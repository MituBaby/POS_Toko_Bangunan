import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { useApp } from './store/AppContext'
import Dashboard from './pages/Dashboard'
import Pos from './pages/Pos'
import Products from './pages/Products'
import Branches from './pages/Branches'
import Customers from './pages/Customers'
import Reports from './pages/Reports'

function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  const tones = {
    success: 'border-emerald-200 bg-white',
    info: 'border-sky-200 bg-white',
    error: 'border-red-200 bg-white',
  }
  const dot = {
    success: 'bg-emerald-500',
    info: 'bg-sky-500',
    error: 'bg-red-500',
  }
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0">
      <div className={`rise flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg ${tones[toast.tone] || tones.success}`}>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot[toast.tone] || dot.success}`} />
        <p className="text-[13px] leading-snug text-ink-700">{toast.message}</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="kasir" element={<Pos />} />
          <Route path="produk" element={<Products />} />
          <Route path="piutang" element={<Customers />} />
          <Route path="laporan" element={<Reports />} />
          <Route path="cabang" element={<Branches />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toast />
    </>
  )
}
