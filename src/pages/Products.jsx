import { useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Boxes,
  Filter,
  Minus,
  PackageSearch,
  Plus,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Button, Card, Field, Input, Modal, Select, inputClass } from '../components/ui'
import { dateFull, idr, idrShort, num } from '../lib/format'

export default function Products() {
  const {
    products,
    branches,
    activeBranch,
    isAllScope,
    stockOf,
    can,
    adjustStock,
    transferStock,
    transfers,
    notify,
  } = useApp()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('semua')
  const [lowOnly, setLowOnly] = useState(false)
  const [adjust, setAdjust] = useState(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustMode, setAdjustMode] = useState('in')
  const [adjustNote, setAdjustNote] = useState('')
  const [transfer, setTransfer] = useState(null)
  const [toBranch, setToBranch] = useState('')
  const [transferQty, setTransferQty] = useState('')
  const [transferNote, setTransferNote] = useState('')

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products])

  const stockTotal = (p) => Object.values(p.stock).reduce((a, b) => a + b, 0)

  const rows = products.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchC = category === 'semua' || p.category === category
    const qty = isAllScope ? stockTotal(p) : stockOf(p, activeBranch.id)
    const matchL = !lowOnly || qty <= p.minStock
    return matchQ && matchC && matchL
  })

  const lowStock = products.filter((p) => {
    const qty = isAllScope ? stockTotal(p) : stockOf(p, activeBranch.id)
    return qty <= p.minStock
  })

  const inventoryValue = products.reduce((a, p) => a + p.cost * (isAllScope ? stockTotal(p) : stockOf(p, activeBranch.id)), 0)

  const openAdjust = (p) => {
    if (!can.manageStock) {
      notify('Hanya pemilik atau admin cabang yang dapat menyesuaikan stok.', 'error')
      return
    }
    setAdjust(p)
    setAdjustQty('')
    setAdjustMode('in')
    setAdjustNote('')
  }

  const submitAdjust = () => {
    const qty = Number(adjustQty)
    if (!qty) return
    const delta = adjustMode === 'in' ? qty : -qty
    adjustStock(adjust.id, activeBranch.id, delta, adjustNote)
    setAdjust(null)
  }

  const openTransfer = (p) => {
    setTransfer(p)
    setToBranch(branches.find((b) => b.id !== activeBranch.id)?.id ?? '')
    setTransferQty('')
    setTransferNote('')
  }

  const submitTransfer = () => {
    const qty = Number(transferQty)
    if (!qty || !toBranch) return
    if (qty > stockOf(transfer, activeBranch.id)) {
      notify(`Stok ${activeBranch.shortName} hanya ${stockOf(transfer, activeBranch.id)} ${transfer.unit}.`, 'error')
      return
    }
    transferStock({ fromBranchId: activeBranch.id, toBranchId: toBranch, productId: transfer.id, qty, note: transferNote })
    setTransfer(null)
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-ink-900">Produk & Stok</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {isAllScope ? 'Konsolidasi stok semua cabang' : `Stok ${activeBranch.name}`} · {products.length} SKU
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg border border-ink-200 bg-white px-3 py-1.5">
            <div className="text-[10px] font-semibold text-ink-400">NILAI PERSEDIAAN</div>
            <div className="font-display text-[15px] font-semibold tabular text-ink-900">{idrShort(inventoryValue)}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
            <div className="text-[10px] font-semibold text-amber-700">STOK MENIPIS</div>
            <div className="font-display text-[15px] font-semibold tabular text-amber-800">{lowStock.length} SKU</div>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-[12px] leading-relaxed text-amber-900">
            <span className="font-semibold">{lowStock.length} barang</span> di bawah batas minimum:{' '}
            {lowStock.slice(0, 3).map((p) => p.name).join(', ')}
            {lowStock.length > 3 ? `, dan ${lowStock.length - 3} lainnya.` : '.'} Segera buat permintaan restock.
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-2 border-b border-ink-100 p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama barang atau SKU"
              className={`${inputClass} pl-9`}
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="lg:w-56">
            <option value="semua">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Button variant={lowOnly ? 'primary' : 'outline'} onClick={() => setLowOnly((v) => !v)}>
            <Filter size={14} /> Stok menipis
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 text-[11px] font-semibold tracking-wide text-ink-500">
                <th className="px-4 py-2.5">Barang</th>
                <th className="px-3 py-2.5">Kategori</th>
                <th className="px-3 py-2.5 text-right">Stok {isAllScope ? '(total)' : activeBranch.code}</th>
                <th className="px-3 py-2.5 text-right">Min.</th>
                <th className="px-3 py-2.5 text-right">Harga eceran</th>
                <th className="px-3 py-2.5 text-right">Harga kontraktor</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((p) => {
                const qty = isAllScope ? stockTotal(p) : stockOf(p, activeBranch.id)
                const low = qty <= p.minStock
                return (
                  <tr key={p.id} className="group hover:bg-ink-50/50">
                    <td className="px-4 py-2.5">
                      <div className="text-[12.5px] font-semibold text-ink-900">{p.name}</div>
                      <div className="font-mono text-[10.5px] text-ink-400">
                        {p.sku} · {p.supplier}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[11.5px] text-ink-600">{p.category}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-semibold tabular ${
                          qty === 0 ? 'bg-red-50 text-red-700' : low ? 'bg-amber-50 text-amber-800' : 'text-ink-900'
                        }`}
                      >
                        {qty === 0 && <span className="h-1 w-1 rounded-full bg-red-500" />}
                        {num(qty)} {p.unit}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[11.5px] tabular text-ink-400">{num(p.minStock)}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] tabular text-ink-700">{idr(p.price.eceran)}</td>
                    <td className="px-3 py-2.5 text-right text-[12px] tabular text-ink-700">{idr(p.price.kontraktor)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1 opacity-60 transition group-hover:opacity-100">
                        <button
                          onClick={() => openAdjust(p)}
                          disabled={isAllScope}
                          className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-40"
                        >
                          <Plus size={11} className="mr-0.5 inline" />
                          Stok
                        </button>
                        <button
                          onClick={() => openTransfer(p)}
                          disabled={isAllScope || branches.length < 2}
                          className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-40"
                        >
                          <ArrowLeftRight size={11} className="mr-0.5 inline" />
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <PackageSearch size={22} className="text-ink-300" />
            <p className="mt-2 text-[13px] font-semibold text-ink-700">Tidak ada barang yang cocok</p>
            <p className="mt-1 text-[12px] text-ink-400">Coba kata kunci lain atau reset filter kategori.</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Transfer stok antar cabang</h2>
            <p className="text-[11.5px] text-ink-400">Riwayat perpindahan barang antar gudang</p>
          </div>
          <Boxes size={16} className="text-ink-300" />
        </div>
        <div className="divide-y divide-ink-100">
          {transfers.map((t) => {
            const product = products.find((p) => p.id === t.productId)
            const from = branches.find((b) => b.id === t.fromBranchId)
            const to = branches.find((b) => b.id === t.toBranchId)
            return (
              <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <span className="font-mono text-[10.5px] text-ink-400">{t.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-ink-800">
                    {product?.name ?? 'Barang'} · {num(t.qty)} {t.unit}
                  </div>
                  <div className="text-[10.5px] text-ink-400">
                    {from?.shortName} → {to?.shortName} · {dateFull(t.date)} · {t.note}
                  </div>
                </div>
                <Badge
                  tone={t.status === 'diterima' ? 'green' : t.status === 'dikirim' ? 'blue' : 'neutral'}
                >
                  {t.status}
                </Badge>
              </div>
            )
          })}
          {transfers.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">Belum ada transfer.</p>}
        </div>
      </Card>

      <Modal
        open={!!adjust}
        onClose={() => setAdjust(null)}
        title="Penyesuaian stok"
        subtitle={adjust ? `${adjust.name} · ${activeBranch.name}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setAdjust(null)}>
              Batal
            </Button>
            <Button onClick={submitAdjust} disabled={!Number(adjustQty)}>
              Simpan penyesuaian
            </Button>
          </>
        }
      >
        {adjust && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2.5">
              <span className="text-[12px] text-ink-600">Stok saat ini</span>
              <span className="font-display text-[18px] font-semibold tabular text-ink-900">
                {num(stockOf(adjust, activeBranch.id))} {adjust.unit}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'in', label: 'Barang masuk', icon: Plus },
                { id: 'out', label: 'Barang keluar', icon: Minus },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAdjustMode(m.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-[12.5px] font-semibold transition ${
                    adjustMode === m.id
                      ? m.id === 'in'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : 'border-ink-200 bg-white text-ink-600'
                  }`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
            <Field label="Jumlah" hint={adjust.unit}>
              <Input type="number" min="1" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} autoFocus />
            </Field>
            <Field label="Catatan">
              <Input
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="mis. kiriman supplier, barang rusak, stok opname"
              />
            </Field>
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Penyesuaian hanya berlaku pada cabang {activeBranch.shortName}. Cabang lain tidak terpengaruh.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!transfer}
        onClose={() => setTransfer(null)}
        title="Transfer stok"
        subtitle={transfer ? `${transfer.name} · dari ${activeBranch.name}` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setTransfer(null)}>
              Batal
            </Button>
            <Button onClick={submitTransfer} disabled={!Number(transferQty) || !toBranch}>
              Kirim transfer
            </Button>
          </>
        }
      >
        {transfer && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
              <div className="flex-1">
                <div className="text-[10px] font-semibold text-ink-400">DARI</div>
                <div className="text-[12.5px] font-semibold text-ink-800">{activeBranch.shortName}</div>
                <div className="text-[11px] text-ink-500">
                  tersedia {num(stockOf(transfer, activeBranch.id))} {transfer.unit}
                </div>
              </div>
              <ArrowLeftRight size={16} className="text-brand-600" />
              <div className="flex-1 text-right">
                <div className="text-[10px] font-semibold text-ink-400">KE</div>
                <Select value={toBranch} onChange={(e) => setToBranch(e.target.value)} className="mt-0.5 h-8 text-[12px]">
                  {branches
                    .filter((b) => b.id !== activeBranch.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortName}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
            <Field label="Jumlah dikirim" hint={transfer.unit}>
              <Input type="number" min="1" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} autoFocus />
            </Field>
            <Field label="Catatan / surat jalan">
              <Input
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="mis. permintaan cabang, proyek baru"
              />
            </Field>
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Stok dikurangi dari {activeBranch.shortName} dan ditambahkan ke cabang tujuan secara bersamaan.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
