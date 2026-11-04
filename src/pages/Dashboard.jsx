import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleAlert,
  Clock3,
  PackageX,
  Plus,
  Receipt,
  ScanLine,
  Truck,
  Wallet,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Card } from '../components/ui'
import { dateFull, dateShort, dayKey, idr, idrShort, num, timeOf } from '../lib/format'

const METHOD_LABEL = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer', tempo: 'Tempo' }
const METHOD_TONE = { cash: 'green', qris: 'blue', transfer: 'blue', tempo: 'amber' }

function buildSeries(txns, days) {
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    const list = txns.filter((t) => dayKey(t.date) === key)
    out.push({
      key,
      date: d,
      label: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
      value: list.reduce((a, t) => a + t.total, 0),
      count: list.length,
    })
  }
  return out
}

export default function Dashboard() {
  const { scopedTransactions, products, branches, activeBranch, isAllScope, branchStats, stockOf, can, user } = useApp()

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
  const todayKey = dayKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = dayKey(yesterday)

  const txToday = scopedTransactions.filter((t) => dayKey(t.date) === todayKey)
  const revToday = txToday.reduce((a, t) => a + t.total, 0)
  const revYesterday = scopedTransactions.filter((t) => dayKey(t.date) === yKey).reduce((a, t) => a + t.total, 0)
  const delta = revYesterday ? ((revToday - revYesterday) / revYesterday) * 100 : 0
  const avgTicket = txToday.length ? revToday / txToday.length : 0
  const series = buildSeries(scopedTransactions, 7)
  const maxSeries = Math.max(...series.map((s) => s.value), 1)

  const outstanding = scopedTransactions
    .filter((t) => t.status !== 'paid')
    .reduce((a, t) => a + (t.total - t.paidAmount), 0)

  const lowStock = products
    .map((p) => ({ ...p, qty: isAllScope ? Object.values(p.stock).reduce((a, b) => a + b, 0) : stockOf(p, activeBranch.id) }))
    .filter((p) => p.qty <= p.minStock)
    .sort((a, b) => a.qty / Math.max(1, a.minStock) - b.qty / Math.max(1, b.minStock))
    .slice(0, 5)

  const recent = scopedTransactions.slice(0, 6)
  const branchRows = branches
    .map((b) => ({ branch: b, stats: branchStats(b.id) }))
    .sort((a, b) => b.stats.revenue30 - a.stats.revenue30)

  return (
    <div className="mx-auto max-w-[1240px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-semibold tracking-[0.14em] text-brand-700">
            {isAllScope ? 'KONSOLIDASI' : activeBranch.city.toUpperCase()} · {dateFull(today)}
          </p>
          <h1 className="mt-1 font-display text-[30px] leading-none font-semibold tracking-wide text-ink-900">
            {greeting}, {user.name}
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {isAllScope
              ? 'Ringkasan gabungan seluruh cabang. Data stok & transaksi tetap terpisah per cabang.'
              : `Ringkasan operasional ${activeBranch.name}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/kasir"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-brand-900/20 transition hover:bg-brand-700"
          >
            <ScanLine size={15} /> Buka kasir
          </Link>
          {can.manageBranch && (
            <Link
              to="/cabang"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 text-[13px] font-semibold text-ink-700 transition hover:border-ink-400"
            >
              <Plus size={15} /> Cabang baru
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr]">
        <div className="blueprint relative overflow-hidden rounded-xl bg-ink-950 px-5 py-5 text-white">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/50">
                  <Receipt size={12} /> PENJUALAN HARI INI
                </div>
                <div className="mt-2 font-display text-[42px] leading-none font-semibold tabular tracking-tight">
                  {idr(revToday)}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[12px]">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
                      delta >= 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'
                    }`}
                  >
                    {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowRight size={12} className="rotate-45" />}
                    {Math.abs(delta).toFixed(1).replace('.', ',')}%
                  </span>
                  <span className="text-white/45">vs kemarin · {idr(revYesterday)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] font-semibold tracking-[0.1em] text-white/40">NOTA</div>
                <div className="font-display text-[28px] leading-tight font-semibold tabular">{txToday.length}</div>
                <div className="text-[10.5px] text-white/40">rata-rata {idrShort(avgTicket)}</div>
              </div>
            </div>

            <div className="mt-5 flex h-[86px] items-end gap-1.5">
              {series.map((s) => (
                <div key={s.key} className="group flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex h-[64px] w-full items-end">
                    <div
                      className={`w-full rounded-t-[3px] transition-colors ${
                        s.key === todayKey ? 'bg-brand-500' : 'bg-white/15 group-hover:bg-white/25'
                      }`}
                      style={{ height: `${Math.max(4, (s.value / maxSeries) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] ${s.key === todayKey ? 'font-semibold text-brand-300' : 'text-white/35'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="flex items-center gap-3 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Clock3 size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-ink-400">TRANSAKSI 30 HARI</div>
              <div className="font-display text-[19px] leading-tight font-semibold tabular text-ink-900">
                {num(scopedTransactions.length)} nota
              </div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Wallet size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-ink-400">PIUTANG BERJALAN</div>
              <div className="font-display text-[19px] leading-tight font-semibold tabular text-ink-900">{idrShort(outstanding)}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <PackageX size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-ink-400">STOK MENIPIS</div>
              <div className="font-display text-[19px] leading-tight font-semibold tabular text-ink-900">{lowStock.length} SKU</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <div>
              <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Transaksi terakhir</h2>
              <p className="text-[11.5px] text-ink-400">
                {isAllScope ? 'Semua cabang' : activeBranch.shortName} · 6 nota terbaru
              </p>
            </div>
            <Link to="/laporan" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-800">
              Semua laporan <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[10px] font-bold text-ink-600">
                  {t.items.length}x
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold text-ink-900">{t.customerName}</span>
                    {t.shipping?.method === 'delivery' && <Truck size={11} className="shrink-0 text-ink-400" />}
                  </div>
                  <div className="truncate font-mono text-[10.5px] text-ink-400">
                    {t.code} · {timeOf(t.date)}
                  </div>
                </div>
                <Badge tone={METHOD_TONE[t.paymentMethod]}>{METHOD_LABEL[t.paymentMethod]}</Badge>
                <div className="w-[86px] text-right">
                  <div className="text-[12.5px] font-semibold tabular text-ink-900">{idr(t.total)}</div>
                  <div className="text-[10px] text-ink-400">{dateShort(t.date)}</div>
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">Belum ada transaksi di cabang ini.</p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Stok perlu perhatian</h2>
              <Link to="/produk" className="text-[12px] font-semibold text-brand-700 hover:text-brand-800">
                Kelola
              </Link>
            </div>
            <div className="divide-y divide-ink-100">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <CircleAlert size={14} className={p.qty === 0 ? 'text-red-500' : 'text-amber-500'} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-ink-800">{p.name}</div>
                    <div className="text-[10.5px] text-ink-400">
                      min. {num(p.minStock)} {p.unit}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular ${
                      p.qty === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {num(p.qty)}
                  </span>
                </div>
              ))}
              {lowStock.length === 0 && <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">Semua stok aman.</p>}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Performa cabang</h2>
              <Building2 size={15} className="text-ink-300" />
            </div>
            <div className="space-y-3 px-4 py-3">
              {branchRows.map(({ branch, stats }) => {
                const top = branchRows[0].stats.revenue30 || 1
                return (
                  <div key={branch.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-ink-700">
                        {branch.shortName}
                        {branch.isMain && <span className="ml-1 text-[10px] text-ink-400">pusat</span>}
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold tabular text-ink-900">{idrShort(stats.revenue30)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full ${branch.isMain ? 'bg-ink-800' : 'bg-brand-500'}`}
                        style={{ width: `${Math.max(2, (stats.revenue30 / top) * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {isAllScope && (
        <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-sky-900">
          <Building2 size={15} className="mt-0.5 shrink-0 text-sky-600" />
          <span>
            Anda melihat <span className="font-semibold">semua cabang</span>. Kasir & penyesuaian stok dinonaktifkan pada
            mode ini — pilih satu cabang lewat pemilih cabang di atas untuk bertransaksi.
          </span>
        </div>
      )}
    </div>
  )
}
