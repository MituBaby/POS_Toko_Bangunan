import { useMemo, useState } from 'react'
import { AlertCircle, Banknote, Phone, Plus, Search, UserRound, Wallet } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Button, Card, Field, Input, Modal, Select, inputClass } from '../components/ui'
import { dateFull, daysBetween, idr, idrShort } from '../lib/format'

const TYPE_LABEL = { kontraktor: 'Kontraktor', tukang: 'Tukang', retail: 'Retail / Umum' }
const TYPE_TONE = { kontraktor: 'brand', tukang: 'blue', retail: 'neutral' }

export default function Customers() {
  const { scopedCustomers, scopedTransactions, activeBranch, isAllScope, saveCustomer, recordPayment, branches } =
    useApp()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('semua')
  const [payOpen, setPayOpen] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'kontraktor', phone: '', address: '', project: '', creditLimit: '' })

  const ledger = useMemo(() => {
    return scopedCustomers
      .map((c) => {
        const txns = scopedTransactions.filter((t) => t.customerId === c.id)
        const debtTxns = txns.filter((t) => t.status !== 'paid')
        const outstanding = debtTxns.reduce((a, t) => a + (t.total - t.paidAmount), 0)
        const totalSpend = txns.reduce((a, t) => a + t.total, 0)
        const oldest = debtTxns.length
          ? debtTxns.reduce((min, t) => (new Date(t.date) < new Date(min.date) ? t : min), debtTxns[0])
          : null
        return { ...c, txns, debtTxns, outstanding, totalSpend, oldest }
      })
      .sort((a, b) => b.outstanding - a.outstanding)
  }, [scopedCustomers, scopedTransactions])

  const filtered = ledger.filter((c) => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || c.name.toLowerCase().includes(q) || (c.project || '').toLowerCase().includes(q)
    const matchF =
      filter === 'semua' ||
      (filter === 'piutang' && c.outstanding > 0) ||
      (filter === 'lunas' && c.outstanding === 0 && c.txns.length > 0) ||
      filter === c.type
    return matchQ && matchF
  })

  const totalOutstanding = ledger.reduce((a, c) => a + c.outstanding, 0)
  const overdue = ledger.filter((c) => c.oldest && daysBetween(c.oldest.date, new Date()) > 30)
  const debtors = ledger.filter((c) => c.outstanding > 0)

  const openPay = (customer, txn) => {
    setPayOpen({ customer, txn })
    setPayAmount(String(txn.total - txn.paidAmount))
  }

  const submitPay = () => {
    const amount = Number(payAmount)
    if (!amount) return
    recordPayment(payOpen.txn.id, amount)
    setPayOpen(null)
    setPayAmount('')
  }

  const submitCustomer = () => {
    if (!form.name.trim()) return
    saveCustomer({
      name: form.name.trim(),
      type: form.type,
      phone: form.phone || '-',
      address: form.address || '-',
      project: form.project || '-',
      creditLimit: Number(form.creditLimit) || 0,
      branchId: isAllScope ? branches[0].id : activeBranch.id,
    })
    setAddOpen(false)
    setForm({ name: '', type: 'kontraktor', phone: '', address: '', project: '', creditLimit: '' })
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-ink-900">
            Pelanggan & Piutang
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {isAllScope ? 'Seluruh cabang' : activeBranch.name} · tagihan tempo kontraktor & proyek
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={15} /> Pelanggan baru
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500">
            <Wallet size={13} /> Total piutang
          </div>
          <div className="mt-1 font-display text-[26px] leading-none font-semibold tabular text-ink-900">
            {idrShort(totalOutstanding)}
          </div>
          <div className="mt-1 text-[11.5px] text-ink-400">{debtors.length} pelanggan punya tagihan</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500">
            <AlertCircle size={13} /> Lewat jatuh tempo
          </div>
          <div className={`mt-1 font-display text-[26px] leading-none font-semibold tabular ${overdue.length ? 'text-red-600' : 'text-ink-900'}`}>
            {overdue.length}
          </div>
          <div className="mt-1 text-[11.5px] text-ink-400">lebih dari 30 hari</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500">
            <UserRound size={13} /> Pelanggan terdaftar
          </div>
          <div className="mt-1 font-display text-[26px] leading-none font-semibold tabular text-ink-900">
            {scopedCustomers.length}
          </div>
          <div className="mt-1 text-[11.5px] text-ink-400">termasuk pelanggan umum</div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-2 border-b border-ink-100 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama pelanggan atau proyek"
              className={`${inputClass} pl-9`}
            />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-52">
            <option value="semua">Semua pelanggan</option>
            <option value="piutang">Punya piutang</option>
            <option value="lunas">Sudah lunas</option>
            <option value="kontraktor">Kontraktor</option>
            <option value="tukang">Tukang</option>
            <option value="retail">Retail</option>
          </Select>
        </div>

        <div className="divide-y divide-ink-100">
          {filtered.map((c) => {
            const over = c.oldest && daysBetween(c.oldest.date, new Date()) > 30
            const limitPct = c.creditLimit ? Math.min(100, (c.outstanding / c.creditLimit) * 100) : 0
            return (
              <div key={c.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13.5px] font-semibold text-ink-900">{c.name}</span>
                      <Badge tone={TYPE_TONE[c.type]}>{TYPE_LABEL[c.type]}</Badge>
                      {over && <Badge tone="red">Jatuh tempo</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-500">
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {c.phone}
                      </span>
                      {c.project !== '-' && <span>Proyek: {c.project}</span>}
                      <span>{c.txns.length} nota · total belanja {idrShort(c.totalSpend)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-ink-400">SISA TAGIHAN</div>
                      <div className={`font-display text-[17px] leading-tight font-semibold tabular ${c.outstanding ? 'text-ink-900' : 'text-emerald-600'}`}>
                        {c.outstanding ? idr(c.outstanding) : 'Lunas'}
                      </div>
                      {c.creditLimit > 0 && (
                        <div className="mt-1 w-28">
                          <div className="h-1 overflow-hidden rounded-full bg-ink-100">
                            <div
                              className={`h-full rounded-full ${limitPct > 85 ? 'bg-red-500' : 'bg-brand-500'}`}
                              style={{ width: `${Math.max(2, limitPct)}%` }}
                            />
                          </div>
                          <div className="mt-0.5 text-[9.5px] text-ink-400">limit {idrShort(c.creditLimit)}</div>
                        </div>
                      )}
                    </div>
                    {c.oldest && (
                      <Button size="sm" variant="soft" onClick={() => openPay(c, c.oldest)}>
                        <Banknote size={13} /> Bayar
                      </Button>
                    )}
                  </div>
                </div>

                {c.debtTxns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.debtTxns.slice(0, 4).map((t) => {
                      const days = daysBetween(t.date, new Date())
                      return (
                        <button
                          key={t.id}
                          onClick={() => openPay(c, t)}
                          className="group flex items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50/60 px-2 py-1 font-mono text-[10.5px] text-ink-600 transition hover:border-brand-400 hover:bg-brand-50"
                        >
                          <span className="font-semibold">{t.code}</span>
                          <span className="text-ink-400">{dateFull(t.date)}</span>
                          <span className={`font-semibold ${days > 30 ? 'text-red-600' : 'text-amber-700'}`}>
                            {idr(t.total - t.paidAmount)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">Tidak ada pelanggan yang cocok.</p>
        )}
      </Card>

      <Modal
        open={!!payOpen}
        onClose={() => setPayOpen(null)}
        title="Catat pembayaran piutang"
        subtitle={payOpen ? `${payOpen.customer.name} · ${payOpen.txn.code}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setPayOpen(null)}>
              Batal
            </Button>
            <Button onClick={submitPay} disabled={!Number(payAmount)}>
              Simpan pembayaran
            </Button>
          </>
        }
      >
        {payOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-ink-50 px-3 py-2.5 text-[12px]">
              <div>
                <div className="text-ink-500">Total nota</div>
                <div className="font-semibold tabular text-ink-900">{idr(payOpen.txn.total)}</div>
              </div>
              <div>
                <div className="text-ink-500">Sisa tagihan</div>
                <div className="font-semibold tabular text-ink-900">{idr(payOpen.txn.total - payOpen.txn.paidAmount)}</div>
              </div>
            </div>
            <Field label="Jumlah dibayar">
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} autoFocus />
            </Field>
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Pembayaran mengurangi sisa tagihan nota ini. Status berubah menjadi lunas bila sisa mencapai nol.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Pelanggan baru"
        subtitle={isAllScope ? 'Akan masuk ke cabang pertama' : `Terdaftar di ${activeBranch.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitCustomer} disabled={!form.name.trim()}>
              Simpan pelanggan
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label="Nama pelanggan / perusahaan">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipe">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="kontraktor">Kontraktor</option>
                <option value="tukang">Tukang</option>
                <option value="retail">Retail / Umum</option>
              </Select>
            </Field>
            <Field label="Telepon">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Nama proyek">
            <Input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
          </Field>
          <Field label="Alamat">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Limit kredit (Rp)" hint="0 = tanpa limit">
            <Input
              type="number"
              value={form.creditLimit}
              onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
              placeholder="0"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
