import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BRANCHES,
  CUSTOMERS,
  PRODUCTS,
  SEED_VERSION,
  TRANSACTIONS,
  TRANSFERS,
  USERS,
} from '../data/seed'
import { dayKey, isSameDay } from '../lib/format'

const STORAGE_KEY = 'bangunjaya-pos-v1'
export const ALL = 'ALL'

const AppCtx = createContext(null)

const PERMISSIONS = {
  owner: { switchBranch: true, viewAll: true, manageBranch: true, manageStock: true },
  admin: { switchBranch: true, viewAll: false, manageBranch: true, manageStock: true },
  cashier: { switchBranch: false, viewAll: false, manageBranch: false, manageStock: false },
}

const seedState = () => ({
  version: SEED_VERSION,
  branches: BRANCHES,
  products: PRODUCTS,
  customers: CUSTOMERS,
  transactions: TRANSACTIONS,
  transfers: TRANSFERS,
  users: USERS,
  currentUserId: 'usr-owner',
  activeBranchId: 'cbr-pusat',
})

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === SEED_VERSION) return parsed
    }
  } catch {
    /* cache rusak — pakai seed */
  }
  return seedState()
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        /* kuota penuh — data demo tetap hidup di memori */
      }
    }, 200)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3600)
    return () => clearTimeout(t)
  }, [toast])

  const notify = (message, tone = 'success') => setToast({ message, tone, id: Date.now() })

  const user = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]
  const can = PERMISSIONS[user.role] ?? PERMISSIONS.cashier

  const isAllScope = state.activeBranchId === ALL
  const activeBranch =
    state.branches.find((b) => b.id === state.activeBranchId) ??
    state.branches.find((b) => b.id === user.branchId) ??
    state.branches[0]

  const visibleBranches = can.switchBranch ? state.branches : state.branches.filter((b) => b.id === user.branchId)

  const setScope = (branchId) => {
    if (branchId === ALL && !can.viewAll) return
    if (branchId !== ALL && !can.switchBranch && branchId !== user.branchId) return
    setState((s) => ({ ...s, activeBranchId: branchId }))
  }

  const setUser = (id) => {
    const next = state.users.find((u) => u.id === id)
    if (!next) return
    setState((s) => ({
      ...s,
      currentUserId: id,
      activeBranchId: PERMISSIONS[next.role]?.switchBranch ? s.activeBranchId : next.branchId,
    }))
  }

  const scopedTransactions = useMemo(() => {
    if (isAllScope) return state.transactions
    return state.transactions.filter((t) => t.branchId === state.activeBranchId)
  }, [state.transactions, state.activeBranchId, isAllScope])

  const scopedCustomers = useMemo(() => {
    if (isAllScope) return state.customers
    return state.customers.filter((c) => c.branchId === state.activeBranchId)
  }, [state.customers, state.activeBranchId, isAllScope])

  const stockOf = (product, branchId) => product?.stock?.[branchId] ?? 0

  const branchStats = (branchId) => {
    const txns = state.transactions.filter((t) => t.branchId === branchId)
    const today = txns.filter((t) => isSameDay(t.date, new Date()))
    return {
      revenueToday: today.reduce((a, t) => a + t.total, 0),
      revenue30: txns.reduce((a, t) => a + t.total, 0),
      txToday: today.length,
      tx30: txns.length,
      lowStock: state.products.filter((p) => (p.stock[branchId] ?? 0) <= p.minStock).length,
      receivables: txns.filter((t) => t.status !== 'paid').reduce((a, t) => a + (t.total - t.paidAmount), 0),
      staff: state.users.filter((u) => u.branchId === branchId).length,
    }
  }

  const createBranch = (data) => {
    const id = `cbr-${Date.now()}`
    const code = (data.code || data.shortName || data.name || 'BRG').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'BRG'
    setState((s) => ({
      ...s,
      branches: [
        ...s.branches,
        {
          id,
          code,
          name: data.name,
          shortName: data.shortName || data.name,
          city: data.city,
          address: data.address || '-',
          phone: data.phone || '-',
          manager: data.manager || '-',
          isMain: false,
          active: true,
          openedAt: data.openedAt || new Date().toISOString().slice(0, 10),
          warehouse: data.warehouse || 'Gudang baru',
        },
      ],
      products: s.products.map((p) => ({ ...p, stock: { ...p.stock, [id]: 0 } })),
      customers: [
        ...s.customers,
        {
          id: `cst-umum-${id}`,
          branchId: id,
          name: 'Umum / Tanpa Nama',
          type: 'retail',
          phone: '-',
          address: '-',
          project: '-',
          creditLimit: 0,
        },
      ],
    }))
    notify(`Cabang ${data.name} dibuat. Stok awal nol, data cabang lain tidak terpengaruh.`)
    return id
  }

  const updateBranch = (id, patch) => {
    setState((s) => ({ ...s, branches: s.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
    notify('Data cabang diperbarui.')
  }

  const adjustStock = (productId, branchId, delta, reason) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId
          ? { ...p, stock: { ...p.stock, [branchId]: Math.max(0, (p.stock[branchId] ?? 0) + delta) } }
          : p,
      ),
    }))
    notify(`Stok disesuaikan ${delta > 0 ? '+' : ''}${delta}${reason ? ` — ${reason}` : ''}.`)
  }

  const transferStock = ({ fromBranchId, toBranchId, productId, qty, note }) => {
    setState((s) => {
      const product = s.products.find((p) => p.id === productId)
      if (!product || qty <= 0 || qty > (product.stock[fromBranchId] ?? 0)) return s
      const seq = 94 + s.transfers.length
      return {
        ...s,
        products: s.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                stock: {
                  ...p.stock,
                  [fromBranchId]: (p.stock[fromBranchId] ?? 0) - qty,
                  [toBranchId]: (p.stock[toBranchId] ?? 0) + qty,
                },
              }
            : p,
        ),
        transfers: [
          {
            id: `trf-${Date.now()}`,
            code: `TRF/${new Date().getFullYear()}/${String(seq).padStart(4, '0')}`,
            fromBranchId,
            toBranchId,
            productId,
            qty,
            unit: product.unit,
            date: new Date().toISOString(),
            status: 'dikirim',
            note: note || 'Transfer stok antar cabang',
            by: user.name,
          },
          ...s.transfers,
        ],
      }
    })
    notify('Transfer dicatat. Stok cabang asal berkurang, cabang tujuan bertambah.')
  }

  const createTransaction = (payload) => {
    const branchId = isAllScope ? user.branchId : state.activeBranchId
    const branch = state.branches.find((b) => b.id === branchId)
    const now = new Date()
    const seq = state.transactions.filter((t) => t.branchId === branchId).length + 1
    const ymd = dayKey(now).replace(/-/g, '')

    const txn = {
      id: `txn-${Date.now()}`,
      code: `INV/${branch.code}/${ymd}/${String(seq).padStart(4, '0')}`,
      branchId,
      date: now.toISOString(),
      cashier: user.name,
      customerId: payload.customerId || null,
      customerName: payload.customerName || 'Umum',
      items: payload.items,
      subtotal: payload.subtotal,
      discount: payload.discount || 0,
      shipping: payload.shipping,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      paidAmount: payload.paidAmount,
      dueDate: payload.dueDate || null,
      status: payload.paidAmount >= payload.total ? 'paid' : payload.paidAmount > 0 ? 'partial' : 'unpaid',
    }

    setState((s) => ({
      ...s,
      transactions: [txn, ...s.transactions],
      products: s.products.map((p) => {
        const line = payload.items.find((i) => i.productId === p.id)
        if (!line) return p
        return { ...p, stock: { ...p.stock, [branchId]: Math.max(0, (p.stock[branchId] ?? 0) - line.qty) } }
      }),
    }))
    notify(`Nota ${txn.code} tersimpan. Stok ${branch.shortName} berkurang.`)
    return txn
  }

  const recordPayment = (txnId, amount) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => {
        if (t.id !== txnId) return t
        const paidAmount = Math.min(t.total, t.paidAmount + amount)
        return { ...t, paidAmount, status: paidAmount >= t.total ? 'paid' : 'partial' }
      }),
    }))
    notify('Pembayaran piutang dicatat.')
  }

  const saveCustomer = (data) => {
    if (data.id) {
      setState((s) => ({ ...s, customers: s.customers.map((c) => (c.id === data.id ? { ...c, ...data } : c)) }))
      notify('Data pelanggan diperbarui.')
      return data.id
    }
    const id = `cst-${Date.now()}`
    setState((s) => ({ ...s, customers: [...s.customers, { ...data, id }] }))
    notify(`Pelanggan ${data.name} ditambahkan.`)
    return id
  }

  const resetDemo = () => {
    setState(seedState())
    notify('Data demo dikembalikan ke kondisi awal.')
  }

  const value = {
    ...state,
    user,
    can,
    activeBranch,
    isAllScope,
    visibleBranches,
    scopedTransactions,
    scopedCustomers,
    stockOf,
    branchStats,
    setScope,
    setUser,
    createBranch,
    updateBranch,
    adjustStock,
    transferStock,
    createTransaction,
    recordPayment,
    saveCustomer,
    resetDemo,
    toast,
    notify,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
