import { useState } from 'react'
import {
  ArrowLeftRight,
  Building2,
  Check,
  CircleDot,
  Database,
  KeyRound,
  Lock,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Users,
  Warehouse,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Button, Card, Field, Input, Modal, Select } from '../components/ui'
import { dateFull, idrShort, num } from '../lib/format'

const emptyForm = {
  name: '',
  shortName: '',
  code: '',
  city: '',
  address: '',
  phone: '',
  manager: '',
  warehouse: '',
  openedAt: new Date().toISOString().slice(0, 10),
}

export default function Branches() {
  const { branches, branchStats, createBranch, updateBranch, setScope, activeBranchId, products, users, can, notify } =
    useApp()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.city.trim()) {
      setError('Nama cabang dan kota wajib diisi.')
      return
    }
    if (form.code && branches.some((b) => b.code === form.code.toUpperCase())) {
      setError('Kode cabang sudah dipakai. Gunakan kode lain.')
      return
    }
    const id = createBranch(form)
    setOpen(false)
    setForm(emptyForm)
    setError('')
    setScope(id)
  }

  const saveEdit = () => {
    if (!editing) return
    updateBranch(editing.id, {
      name: editing.name,
      manager: editing.manager,
      phone: editing.phone,
      address: editing.address,
    })
    setEditing(null)
  }

  if (!can.manageBranch) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Lock size={26} className="mx-auto text-ink-300" />
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-wide text-ink-900">Akses terbatas</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
          Hanya pemilik dan admin cabang yang dapat mengelola cabang. Masuk sebagai pemilik lewat menu profil untuk
          mencoba.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-ink-900">Cabang</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {branches.length} cabang dalam satu database · data terisolasi per cabang
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} /> Cabang baru
        </Button>
      </div>

      <div className="blueprint relative overflow-hidden rounded-xl bg-ink-950 px-5 py-5 text-white">
        <div className="relative grid gap-5 md:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand-400">
              <Database size={12} /> ARSITEKTUR MULTI-CABANG
            </div>
            <h2 className="mt-2 font-display text-[24px] leading-tight font-semibold tracking-wide">
              Satu database pusat, ruang data terpisah tiap cabang
            </h2>
            <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-white/55">
              Semua cabang menulis ke skema yang sama, namun setiap baris data menyimpan <code className="rounded bg-white/10 px-1 font-mono text-[11px] text-brand-200">branch_id</code>.
              Kasir hanya membaca dan menulis data cabangnya; pemilik dapat berpindah cakupan untuk konsolidasi.
            </p>
          </div>
          <div className="grid gap-2 self-center sm:grid-cols-3 md:grid-cols-1">
            {[
              { icon: ShieldCheck, title: 'Isolasi baca', desc: 'Setiap query difilter branch_id' },
              { icon: Warehouse, title: 'Stok per gudang', desc: 'Transfer tercatat antar cabang' },
              { icon: KeyRound, title: 'Akses berbasis peran', desc: 'Kasir terkunci di cabangnya' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <f.icon size={14} className="mt-0.5 shrink-0 text-brand-400" />
                <div>
                  <div className="text-[12px] font-semibold">{f.title}</div>
                  <div className="text-[10.5px] text-white/45">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b) => {
          const stats = branchStats(b.id)
          const isActive = b.id === activeBranchId
          const staff = users.filter((u) => u.branchId === b.id)
          const skuWithStock = products.filter((p) => (p.stock[b.id] ?? 0) > 0).length
          return (
            <Card
              key={b.id}
              className={`flex flex-col overflow-hidden transition ${isActive ? 'ring-2 ring-brand-500/70' : 'hover:border-ink-300'}`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-ink-100 px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-[13px] font-bold ${
                      b.isMain ? 'bg-ink-900 text-white' : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    {b.code}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold leading-tight text-ink-900">{b.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-400">
                      <MapPin size={10} /> {b.city}
                      {b.isMain && <Badge tone="dark" className="ml-1">PUSAT</Badge>}
                    </div>
                  </div>
                </div>
                {isActive && <Badge tone="brand">aktif</Badge>}
              </div>

              <div className="space-y-1.5 px-4 py-3 text-[11.5px] text-ink-500">
                <div className="leading-relaxed">{b.address}</div>
                <div>Telp. {b.phone}</div>
                <div>
                  Kepala cabang: <span className="font-medium text-ink-700">{b.manager}</span>
                </div>
                <div>Buka {dateFull(b.openedAt)}</div>
              </div>

              <div className="grid grid-cols-3 gap-px border-y border-ink-100 bg-ink-100">
                <div className="bg-white px-3 py-2">
                  <div className="text-[10px] font-semibold text-ink-400">OMZET 30H</div>
                  <div className="text-[12.5px] font-semibold tabular text-ink-900">{idrShort(stats.revenue30)}</div>
                </div>
                <div className="bg-white px-3 py-2">
                  <div className="text-[10px] font-semibold text-ink-400">NOTA</div>
                  <div className="text-[12.5px] font-semibold tabular text-ink-900">{num(stats.tx30)}</div>
                </div>
                <div className="bg-white px-3 py-2">
                  <div className="text-[10px] font-semibold text-ink-400">SKU ADA</div>
                  <div className="text-[12.5px] font-semibold tabular text-ink-900">
                    {skuWithStock}/{products.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] text-ink-400">
                <Users size={11} /> {staff.length} pengguna
                {stats.lowStock > 0 && (
                  <>
                    <span className="text-ink-200">|</span>
                    <span className="text-amber-700">{stats.lowStock} SKU menipis</span>
                  </>
                )}
              </div>

              <div className="mt-auto flex gap-1.5 border-t border-ink-100 px-3 py-2.5">
                <Button size="sm" variant={isActive ? 'primary' : 'outline'} className="flex-1" onClick={() => setScope(b.id)}>
                  {isActive ? <Check size={13} /> : <CircleDot size={13} />}
                  {isActive ? 'Sedang dilihat' : 'Lihat data'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing({ ...b })} aria-label="Ubah cabang">
                  <Pencil size={13} />
                </Button>
              </div>
            </Card>
          )
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-white/50 px-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Plus size={18} />
          </span>
          <span className="text-[13px] font-semibold text-ink-800">Tambah cabang baru</span>
          <span className="max-w-[210px] text-[11.5px] leading-relaxed text-ink-500">
            Cabang baru langsung terhubung ke database pusat dengan ruang data sendiri.
          </span>
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <ArrowLeftRight size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div className="text-[12px] leading-relaxed text-ink-600">
            <span className="font-semibold text-ink-900">Transfer stok antar cabang</span> tersedia di menu Produk & Stok.
            Setiap transfer mengurangi stok cabang asal dan menambah stok cabang tujuan dalam satu transaksi database,
            lengkap dengan surat jalan.
          </div>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cabang baru"
        subtitle="Data cabang baru langsung terpisah dari cabang lain"
        width="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit}>
              <Building2 size={15} /> Buat cabang
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
            <Field label="Nama cabang" hint="wajib">
              <Input value={form.name} onChange={set('name')} placeholder="mis. Cabang Depok Margonda" autoFocus />
            </Field>
            <Field label="Kode" hint="3 huruf">
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().slice(0, 3) }))}
                placeholder="DPK"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama pendek" hint="tampil di pemilih cabang">
              <Input value={form.shortName} onChange={set('shortName')} placeholder="Depok" />
            </Field>
            <Field label="Kota" hint="wajib">
              <Input value={form.city} onChange={set('city')} placeholder="Depok" />
            </Field>
          </div>

          <Field label="Alamat lengkap">
            <Input value={form.address} onChange={set('address')} placeholder="Jl. Margonda Raya No. 210, Depok" />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Telepon">
              <Input value={form.phone} onChange={set('phone')} placeholder="021-7720 1188" />
            </Field>
            <Field label="Kepala cabang">
              <Input value={form.manager} onChange={set('manager')} placeholder="Nama penanggung jawab" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Gudang / kapasitas">
              <Input value={form.warehouse} onChange={set('warehouse')} placeholder="Gudang E · 380 m²" />
            </Field>
            <Field label="Tanggal buka">
              <Input type="date" value={form.openedAt} onChange={set('openedAt')} />
            </Field>
          </div>

          <div className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-700">
              <Check size={13} className="text-emerald-600" /> Yang dibuat otomatis
            </div>
            <ul className="mt-1.5 space-y-1 text-[11.5px] leading-relaxed text-ink-500">
              <li>• Stok nol untuk {products.length} SKU katalog master</li>
              <li>• Pelanggan default “Umum / Tanpa Nama”</li>
              <li>• Nomor nota memakai kode cabang ({form.code || 'XXX'})</li>
            </ul>
          </div>

          {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
        </form>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Ubah data cabang"
        subtitle={editing?.name}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={saveEdit}>Simpan perubahan</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3.5">
            <Field label="Nama cabang">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Kepala cabang">
              <Input value={editing.manager} onChange={(e) => setEditing({ ...editing, manager: e.target.value })} />
            </Field>
            <Field label="Telepon">
              <Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            </Field>
            <Field label="Alamat">
              <Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select
                value={editing.active ? 'aktif' : 'nonaktif'}
                onChange={(e) => setEditing({ ...editing, active: e.target.value === 'aktif' })}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </Select>
            </Field>
            {!editing.active && (
              <p className="rounded-md bg-amber-50 px-2.5 py-2 text-[11.5px] leading-relaxed text-amber-800">
                Cabang nonaktif tetap menyimpan datanya, tetapi tidak bisa dipilih untuk transaksi baru.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
