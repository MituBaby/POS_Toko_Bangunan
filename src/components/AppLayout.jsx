import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Package,
  RotateCcw,
  ScanLine,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { ALL, useApp } from '../store/AppContext'
import { dateFull, idrShort } from '../lib/format'

const NAV = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/kasir', label: 'Kasir', icon: ScanLine },
  { to: '/produk', label: 'Produk & Stok', icon: Package },
  { to: '/piutang', label: 'Pelanggan & Piutang', icon: Users },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
  { to: '/cabang', label: 'Cabang', icon: Building2, restricted: true },
]

function Sidebar({ onNavigate }) {
  const { user, activeBranch, isAllScope, can } = useApp()

  return (
    <aside className="flex h-full w-[248px] flex-col bg-ink-950 text-white">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-[19px] font-bold text-white">
          BJ
        </div>
        <div className="leading-tight">
          <div className="font-display text-[17px] font-semibold tracking-wide">TB. PUTRA AGUNG PRATAMA</div>
          <div className="text-[10.5px] font-medium tracking-[0.14em] text-white/40">MATERIAL & KASIR</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.filter((n) => !n.restricted || can.manageBranch).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.1em] text-white/40">
            <Warehouse size={12} />
            {isAllScope ? 'SEMUA CABANG' : 'CABANG AKTIF'}
          </div>
          <div className="mt-1.5 truncate text-[13px] font-semibold text-white">
            {isAllScope ? 'Konsolidasi 3 cabang' : activeBranch.name}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-white/45">
            {isAllScope ? 'Data gabungan, tanpa ubah stok' : activeBranch.warehouse}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
            {user.initials}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12.5px] font-semibold text-white">{user.name}</div>
            <div className="text-[10.5px] capitalize text-white/40">
              {user.role === 'owner' ? 'Pemilik' : user.role === 'admin' ? 'Admin cabang' : 'Kasir'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function BranchSwitcher() {
  const { visibleBranches, branches, activeBranchId, isAllScope, setScope, can, branchStats } = useApp()
  const [open, setOpen] = useState(false)

  if (!can.switchBranch) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 h-9 text-[12.5px]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="font-semibold text-ink-800">{activeBranchId && branches.find((b) => b.id === activeBranchId)?.name}</span>
        <span className="text-ink-400">· terkunci</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 text-[12.5px] font-semibold text-ink-800 transition hover:border-ink-300"
        aria-expanded={open}
      >
        <Building2 size={14} className="text-brand-600" />
        <span className="max-w-[190px] truncate">
          {isAllScope ? 'Semua cabang' : branches.find((b) => b.id === activeBranchId)?.name}
        </span>
        <ChevronDown size={14} className={`text-ink-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-40 w-[300px] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
            <div className="border-b border-ink-100 px-3 py-2 text-[10.5px] font-semibold tracking-[0.12em] text-ink-400">
              PILIH CAKUPAN DATA
            </div>
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {can.viewAll && (
                <button
                  onClick={() => {
                    setScope(ALL)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition hover:bg-ink-50 ${
                    isAllScope ? 'bg-brand-50' : ''
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-semibold text-ink-900">Semua cabang</div>
                    <div className="text-[11px] text-ink-500">Hanya baca — laporan konsolidasi</div>
                  </div>
                  {isAllScope && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                </button>
              )}
              {visibleBranches.map((b) => {
                const s = branchStats(b.id)
                const active = b.id === activeBranchId
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setScope(b.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-ink-50 ${
                      active ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-ink-900">{b.name}</span>
                        {b.isMain && <span className="rounded bg-ink-900 px-1 py-px text-[9px] font-bold text-white">PUSAT</span>}
                      </div>
                      <div className="text-[11px] text-ink-500">
                        {b.code} · {b.city} · {s.txToday} transaksi hari ini
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11.5px] font-semibold tabular text-ink-700">{idrShort(s.revenueToday)}</div>
                      {active && <div className="text-[10px] font-semibold text-brand-600">aktif</div>}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-ink-100 bg-ink-50/60 px-3 py-2 text-[10.5px] leading-relaxed text-ink-500">
              Satu database, data terpisah per cabang. Stok & transaksi hanya berlaku di cabang aktif.
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function UserSwitcher() {
  const { users, user, setUser, resetDemo } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-ink-100"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
          {user.initials}
        </div>
        <ChevronDown size={14} className="text-ink-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-[250px] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
            <div className="border-b border-ink-100 px-3 py-2 text-[10.5px] font-semibold tracking-[0.12em] text-ink-400">
              SIMULASI PERAN
            </div>
            <div className="p-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setUser(u.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-ink-50 ${
                    u.id === user.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                    {u.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-ink-900">{u.name}</div>
                    <div className="text-[10.5px] capitalize text-ink-500">
                      {u.role === 'owner' ? 'Pemilik · akses penuh' : u.role === 'admin' ? 'Admin cabang' : 'Kasir · cabang terkunci'}
                    </div>
                  </div>
                  {u.id === user.id && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>
            <div className="border-t border-ink-100 p-1.5">
              <button
                onClick={() => {
                  resetDemo()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold text-ink-500 transition hover:bg-red-50 hover:text-red-700"
              >
                <RotateCcw size={13} /> Kembalikan data demo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { can } = useApp()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} />
          <div className="rise relative h-full w-[248px]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute -right-11 top-4 rounded-lg bg-white/10 p-2 text-white"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur-md lg:px-7">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={18} />
          </button>

          <BranchSwitcher />

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-[12px] text-ink-400 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {dateFull(new Date())}
            </div>
            {can.manageBranch && (
              <span className="hidden rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[10.5px] font-semibold text-ink-500 sm:inline">
                Mode demo · data dummy
              </span>
            )}
            <UserSwitcher />
          </div>
        </header>

        <main key={location.pathname} className="min-w-0 flex-1 px-4 py-5 lg:px-7 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
