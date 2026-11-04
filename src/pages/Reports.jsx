import { useMemo, useState } from 'react'
import { Download, Receipt as ReceiptIcon, Search } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Button, Card, Modal, Select, inputClass } from '../components/ui'
import Receipt from '../components/Receipt'
import { dateFull, dateShort, dayKey, idr, idrShort, num, timeOf } from '../lib/format'

const METHOD = {
  cash: { label: 'Tunai', tone: 'green' },
  qris: { label: 'QRIS', tone: 'blue' },
  transfer: { label: 'Transfer', tone: 'blue' },
  tempo: { label: 'Tempo', tone: 'amber' },
}

export default function Reports() {
  const { scopedTransactions, branches, products, isAllScope, activeBranch } = useApp()
  const [range, setRange] = useState('30')
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('semua')
  const [detail, setDetail] = useState(null)

  const days = Number(range)
  const cutoff = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (days - 1))
    return d
  }, [days])

  const txns = useMemo(
    () => scopedTransactions.filter((t) => new Date(t.date) >= cutoff),
    [scopedTransactions, cutoff],
  )

  const revenue = txns.reduce((a, t) => a + t.total, 0)
  const cogs = txns.reduce(
    (a, t) =>
      a +
      t.items.reduce((b, it) => {
        const p = products.find((x) => x.id === it.productId)
        return b + (p ? p.cost * it.qty : 0)
      }, 0),
    0,
  )
  const grossProfit = revenue - cogs
  const margin = revenue ? (grossProfit / revenue) * 100 : 0
  const avgTicket = txns.length ? revenue / txns.length : 0

  const series = useMemo(() => {
    const map = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      map.set(dayKey(d), { key: dayKey(d), date: d, value: 0, count: 0 })
    }
    txns.forEach((t) => {
      const k = dayKey(t.date)
      const entry = map.get(k)
      if (entry) {
        entry.value += t.total
        entry.count += 1
      }
    })
    return [...map.values()]
  }, [txns, days])

  const maxDay = Math.max(...series.map((s) => s.value), 1)

  const topProducts = useMemo(() => {
    const map = new Map()
    txns.forEach((t) =>
      t.items.forEach((it) => {
        const prev = map.get(it.productId) || { name: it.name, unit: it.unit, qty: 0, revenue: 0 }
        map.set(it.productId, {
          ...prev,
          qty: prev.qty + it.qty,
          revenue: prev.revenue + it.subtotal,
        })
      }),
    )
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6)
  }, [txns])

  const methodBreakdown = ['cash', 'qris', 'transfer', 'tempo'].map((m) => {
    const list = txns.filter((t) => t.paymentMethod === m)
    const value = list.reduce((a, t) => a + t.total, 0)
    return { id: m, count: list.length, value, share: revenue ? (value / revenue) * 100 : 0 }
  })

  const branchRows = branches
    .map((b) => {
      const list = txns.filter((t) => t.branchId === b.id)
      const value = list.reduce((a, t) => a + t.total, 0)
      return { ...b, count: list.length, value, share: revenue ? (value / revenue) * 100 : 0 }
    })
    .sort((a, b) => b.value - a.value)

  const filteredTxns = txns.filter((t) => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || t.code.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q) || t.cashier.toLowerCase().includes(q)
    const matchM = method === 'semua' || t.paymentMethod === method
    return matchQ && matchM
  })

  const exportCsv = () => {
    const header = ['Nota', 'Tanggal', 'Cabang', 'Kasir', 'Pelanggan', 'Metode', 'Total', 'Dibayar', 'Sisa']
    const lines = filteredTxns.map((t) => [
      t.code,
      new Date(t.date).toISOString(),
      branches.find((b) => b.id === t.branchId)?.shortName ?? '',
      t.cashier,
      t.customerName,
      METHOD[t.paymentMethod]?.label ?? t.paymentMethod,
      t.total,
      t.paidAmount,
      t.total - t.paidAmount,
    ])
    const csv = [header, ...lines].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-penjualan-${days}h.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-ink-900">Laporan</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {isAllScope ? 'Konsolidasi semua cabang' : activeBranch.name} · {days} hari terakhir
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-0.5 rounded-lg border border-ink-200 bg-white p-0.5">
            {[
              { id: '7', label: '7 hari' },
              { id: '30', label: '30 hari' },
              { id: '90', label: '90 hari' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                  range === r.id ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={exportCsv}>
            <Download size={15} /> Ekspor
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Omzet', value: idr(revenue), sub: `${num(txns.length)} nota` },
          { label: 'Laba kotor', value: idr(grossProfit), sub: `margin ${margin.toFixed(1).replace('.', ',')}%`, accent: true },
          { label: 'Rata-rata nota', value: idr(avgTicket), sub: 'per transaksi' },
          { label: 'Nilai HPP', value: idr(cogs), sub: 'harga pokok terjual' },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.accent ? 'border-brand-200 bg-brand-50/40' : ''}`}>
            <div className="text-[11.5px] font-semibold text-ink-500">{s.label}</div>
            <div className={`mt-1 font-display text-[24px] leading-none font-semibold tabular ${s.accent ? 'text-brand-700' : 'text-ink-900'}`}>
              {s.value}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-400">{s.sub}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Penjualan harian</h2>
          <span className="text-[11.5px] text-ink-400">
            puncak {idrShort(maxDay)} · {dateShort(cutoff.toISOString())} – {dateShort(new Date().toISOString())}
          </span>
        </div>
        <div className="mt-4 flex h-[160px] items-end gap-[3px]">
          {series.map((s) => (
            <div key={s.key} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-[2px] bg-brand-500/85 transition-colors group-hover:bg-brand-600"
                style={{ height: `${Math.max(1, (s.value / maxDay) * 100)}%` }}
              />
              <div className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 font-mono text-[10px] text-white group-hover:block">
                {dateShort(s.date.toISOString())} · {idrShort(s.value)} · {s.count} nota
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10.5px] text-ink-400">
          <span>{dateShort(cutoff.toISOString())}</span>
          <span>{dateShort(new Date().toISOString())}</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-ink-100 px-4 py-3">
            <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Barang terlaris</h2>
            <p className="text-[11.5px] text-ink-400">berdasarkan nilai penjualan</p>
          </div>
          <div className="divide-y divide-ink-100">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-4 font-mono text-[11px] text-ink-400">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-ink-800">{p.name}</div>
                  <div className="text-[10.5px] text-ink-400">
                    {num(p.qty)} {p.unit} terjual
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12.5px] font-semibold tabular text-ink-900">{idr(p.revenue)}</div>
                  <div className="text-[10.5px] text-ink-400">{revenue ? ((p.revenue / revenue) * 100).toFixed(1) : 0}% omzet</div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">Belum ada penjualan.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="border-b border-ink-100 px-4 py-3">
              <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Metode bayar</h2>
            </div>
            <div className="space-y-3 px-4 py-3">
              {methodBreakdown.map((m) => (
                <div key={m.id}>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="font-medium text-ink-700">
                      {METHOD[m.id].label} <span className="text-ink-400">({m.count})</span>
                    </span>
                    <span className="font-semibold tabular text-ink-900">{idrShort(m.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(1, m.share)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {isAllScope && (
            <Card>
              <div className="border-b border-ink-100 px-4 py-3">
                <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Per cabang</h2>
              </div>
              <div className="divide-y divide-ink-100">
                {branchRows.map((b) => (
                  <div key={b.id} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between text-[12px]">
                      <span className="font-medium text-ink-700">{b.shortName}</span>
                      <span className="font-semibold tabular text-ink-900">{idrShort(b.value)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-ink-700" style={{ width: `${Math.max(1, b.share)}%` }} />
                      </div>
                      <span className="w-16 text-right text-[10px] text-ink-400">{b.count} nota</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-2 border-b border-ink-100 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor nota, pelanggan, atau kasir"
              className={`${inputClass} pl-9`}
            />
          </div>
          <Select value={method} onChange={(e) => setMethod(e.target.value)} className="sm:w-44">
            <option value="semua">Semua metode</option>
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer</option>
            <option value="tempo">Tempo</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 text-[11px] font-semibold tracking-wide text-ink-500">
                <th className="px-4 py-2.5">Nota</th>
                {isAllScope && <th className="px-3 py-2.5">Cabang</th>}
                <th className="px-3 py-2.5">Pelanggan</th>
                <th className="px-3 py-2.5">Kasir</th>
                <th className="px-3 py-2.5">Metode</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Sisa</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredTxns.slice(0, 60).map((t) => (
                <tr key={t.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-2.5">
                    <div className="font-mono text-[11px] text-ink-700">{t.code}</div>
                    <div className="text-[10.5px] text-ink-400">
                      {dateFull(t.date)} · {timeOf(t.date)}
                    </div>
                  </td>
                  {isAllScope && (
                    <td className="px-3 py-2.5 text-[12px] text-ink-600">
                      {branches.find((b) => b.id === t.branchId)?.shortName}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-[12px] text-ink-700">{t.customerName}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-500">{t.cashier}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={METHOD[t.paymentMethod]?.tone ?? 'neutral'}>{METHOD[t.paymentMethod]?.label}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[12px] font-semibold tabular text-ink-900">{idr(t.total)}</td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular">
                    {t.total - t.paidAmount > 0 ? (
                      <span className="text-amber-700">{idr(t.total - t.paidAmount)}</span>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => setDetail(t)}
                      className="rounded-md border border-ink-200 p-1.5 text-ink-500 hover:border-brand-400 hover:text-brand-700"
                      title="Lihat nota"
                    >
                      <ReceiptIcon size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTxns.length === 0 && (
          <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">Tidak ada transaksi pada filter ini.</p>
        )}
        {filteredTxns.length > 60 && (
          <div className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-400">
            Menampilkan 60 dari {filteredTxns.length} nota. Persempit filter untuk melihat sisanya.
          </div>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Nota penjualan" width="max-w-md">
        {detail && <Receipt txn={detail} onClose={() => setDetail(null)} />}
      </Modal>
    </div>
  )
}
