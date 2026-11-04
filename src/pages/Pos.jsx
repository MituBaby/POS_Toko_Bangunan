import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Badge, Button, Field, Input, Modal, Select, inputClass } from '../components/ui'
import Receipt from '../components/Receipt'
import { idr, num } from '../lib/format'

const TIERS = [
  { id: 'eceran', label: 'Eceran' },
  { id: 'tukang', label: 'Tukang' },
  { id: 'kontraktor', label: 'Kontraktor' },
]

const METHODS = [
  { id: 'cash', label: 'Tunai' },
  { id: 'qris', label: 'QRIS' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'tempo', label: 'Tempo' },
]

const ARMADA = [
  { id: 'l300', label: 'Pick-up L300', fee: 60000 },
  { id: 'colt', label: 'Colt Diesel 110', fee: 90000 },
  { id: 'engkel', label: 'Truk Engkel', fee: 120000 },
]

export default function Pos() {
  const {
    products,
    customers,
    branches,
    activeBranch,
    isAllScope,
    stockOf,
    user,
    createTransaction,
  } = useApp()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua')
  const [cart, setCart] = useState([])
  const [tier, setTier] = useState('eceran')
  const [customerId, setCustomerId] = useState('')
  const [discount, setDiscount] = useState('')
  const [delivery, setDelivery] = useState(false)
  const [armadaId, setArmadaId] = useState('l300')
  const [address, setAddress] = useState('')
  const [payOpen, setPayOpen] = useState(false)
  const [method, setMethod] = useState('cash')
  const [cashInput, setCashInput] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')

  const categories = useMemo(
    () => ['Semua', ...new Set(products.map((p) => p.category))],
    [products],
  )

  const branchCustomers = customers.filter((c) => c.branchId === activeBranch.id)

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchC = category === 'Semua' || p.category === category
    return matchQ && matchC
  })

  const subtotal = cart.reduce((a, it) => a + it.qty * it.unitPrice, 0)
  const discountValue = Math.min(Number(discount) || 0, subtotal)
  const armada = ARMADA.find((a) => a.id === armadaId)
  const shippingFee = delivery ? armada.fee : 0
  const total = Math.max(0, subtotal - discountValue + shippingFee)

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((it) => it.productId === product.id)
      if (found) {
        return prev.map((it) =>
          it.productId === product.id ? { ...it, qty: it.qty + 1 } : it,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          qty: 1,
          unitPrice: product.price[tier],
          tier,
        },
      ]
    })
  }

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0),
    )
  }

  const removeLine = (productId) => setCart((prev) => prev.filter((it) => it.productId !== productId))

  const changeTier = (next) => {
    setTier(next)
    setCart((prev) =>
      prev.map((it) => {
        const product = products.find((p) => p.id === it.productId)
        return product ? { ...it, tier: next, unitPrice: product.price[next] } : it
      }),
    )
  }

  const resetCart = () => {
    setCart([])
    setDiscount('')
    setCustomerId('')
    setDelivery(false)
    setAddress('')
    setCashInput('')
    setMethod('cash')
  }

  const openPayment = () => {
    if (cart.length === 0) return
    const overStock = cart.find((it) => it.qty > stockOf(products.find((p) => p.id === it.productId), activeBranch.id))
    if (overStock) {
      setError(`Stok ${overStock.name} tidak cukup di cabang ini.`)
      return
    }
    if (method === 'tempo' && !customerId) {
      setError('Pilih pelanggan kontraktor untuk transaksi tempo.')
      return
    }
    setError('')
    setPayOpen(true)
  }

  const submitPayment = () => {
    const customer = branchCustomers.find((c) => c.id === customerId)
    const paid = method === 'tempo' ? 0 : method === 'cash' ? Number(cashInput) || total : total
    const txn = createTransaction({
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? 'Umum',
      items: cart.map((it) => ({ ...it, subtotal: it.qty * it.unitPrice })),
      subtotal,
      discount: discountValue,
      shipping: {
        method: delivery ? 'delivery' : 'pickup',
        armada: delivery ? armada.label : '',
        fee: shippingFee,
        address: delivery ? address : '',
      },
      total,
      paymentMethod: method,
      paidAmount: Math.min(paid, total),
      dueDate: method === 'tempo' ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
    })
    setPayOpen(false)
    setReceipt(txn)
    resetCart()
  }

  if (isAllScope) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Building2 size={22} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-wide text-ink-900">Pilih cabang dulu</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">
          Kasir bekerja pada satu cabang agar stok dan nomor nota tidak tercampur. Pilih cabang pada pemilih di atas,
          atau kembali ke ringkasan konsolidasi.
        </p>
        <Link to="/" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">
          <ArrowLeft size={15} /> Kembali ke ringkasan
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none font-semibold tracking-wide text-ink-900">Kasir</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {activeBranch.name} · kasir {user.name}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5">
          <span className="text-[11.5px] text-ink-500">Harga</span>
          <div className="flex gap-0.5 rounded-md bg-ink-100 p-0.5">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTier(t.id)}
                className={`rounded px-2.5 py-1 text-[11.5px] font-semibold transition ${
                  tier === t.id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama barang atau SKU — mis. semen, besi 10, KRM"
                className={`${inputClass} h-11 pl-9`}
              />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 sm:w-56">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((p) => {
              const stock = stockOf(p, activeBranch.id)
              const out = stock <= 0
              return (
                <button
                  key={p.id}
                  onClick={() => !out && addToCart(p)}
                  disabled={out}
                  className={`group relative flex flex-col rounded-xl border bg-white p-3 text-left transition ${
                    out
                      ? 'cursor-not-allowed border-ink-200 opacity-60'
                      : 'border-ink-200 hover:border-brand-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] text-ink-400">{p.sku}</span>
                    {out ? (
                      <Badge tone="red">Habis</Badge>
                    ) : stock <= p.minStock ? (
                      <Badge tone="amber">Sisa {num(stock)}</Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-snug text-ink-900">
                    {p.name}
                  </div>
                  <div className="mt-1 text-[10.5px] text-ink-400">
                    Stok {num(stock)} {p.unit}
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-2.5">
                    <div>
                      <div className="font-display text-[19px] leading-none font-semibold tabular text-ink-900">
                        {idr(p.price[tier])}
                      </div>
                      <div className="text-[10.5px] text-ink-400">per {p.unit}</div>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-100 text-ink-600 transition group-hover:bg-brand-600 group-hover:text-white">
                      <Plus size={14} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
              <p className="text-[13.5px] font-semibold text-ink-800">Barang tidak ditemukan</p>
              <p className="mt-1 text-[12.5px] text-ink-500">
                Coba kata kunci lain, atau periksa apakah barang tersedia di {activeBranch.shortName}.
              </p>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="flex flex-col rounded-xl border border-ink-200 bg-white xl:sticky xl:top-[76px] xl:max-h-[calc(100vh-92px)]">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-brand-600" />
              <h2 className="font-display text-[17px] font-semibold tracking-wide text-ink-900">Keranjang</h2>
              <Badge tone="brand">{cart.length}</Badge>
            </div>
            {cart.length > 0 && (
              <button onClick={resetCart} className="text-[11.5px] font-semibold text-ink-400 hover:text-red-600">
                Kosongkan
              </button>
            )}
          </div>

          <div className="min-h-[120px] flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                  <ShoppingCart size={19} />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-ink-700">Belum ada barang</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-400">
                  Klik barang di sebelah kiri untuk menambahkan ke nota.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {cart.map((it) => {
                  const stock = stockOf(products.find((p) => p.id === it.productId), activeBranch.id)
                  const over = it.qty > stock
                  return (
                    <div key={it.productId} className="px-3.5 py-2.5">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-semibold text-ink-900">{it.name}</div>
                          <div className="mt-0.5 text-[10.5px] text-ink-400">
                            {idr(it.unitPrice)} / {it.unit} · <span className="capitalize">{it.tier}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeLine(it.productId)}
                          className="rounded p-1 text-ink-300 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus ${it.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => changeQty(it.productId, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-ink-200 text-ink-600 hover:bg-ink-100"
                            aria-label="Kurangi"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            value={it.qty}
                            onChange={(e) => {
                              const v = Math.max(1, Number(e.target.value) || 1)
                              setCart((prev) => prev.map((x) => (x.productId === it.productId ? { ...x, qty: v } : x)))
                            }}
                            className="h-6 w-11 rounded border border-ink-200 text-center font-mono text-[12px] tabular focus:border-brand-500 focus:outline-none"
                          />
                          <button
                            onClick={() => changeQty(it.productId, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-ink-200 text-ink-600 hover:bg-ink-100"
                            aria-label="Tambah"
                          >
                            <Plus size={12} />
                          </button>
                          <span className="ml-1 text-[10.5px] text-ink-400">{it.unit}</span>
                        </div>
                        <span className="text-[12.5px] font-semibold tabular text-ink-900">
                          {idr(it.qty * it.unitPrice)}
                        </span>
                      </div>
                      {over && (
                        <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-red-600">
                          <AlertTriangle size={11} /> Melebihi stok tersedia ({num(stock)})
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-ink-200 px-3.5 py-3">
            <Field label="Pelanggan" hint={method === 'tempo' ? 'wajib untuk tempo' : 'opsional'}>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Umum / tanpa nama</option>
                {branchCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.type === 'kontraktor' ? ' — kontraktor' : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Diskon (Rp)">
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Pengiriman">
                <button
                  onClick={() => setDelivery((v) => !v)}
                  className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-[12.5px] font-semibold transition ${
                    delivery ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-300 bg-white text-ink-600'
                  }`}
                >
                  <Truck size={14} />
                  {delivery ? 'Dikirim' : 'Ambil sendiri'}
                </button>
              </Field>
            </div>

            {delivery && (
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-2">
                <Select value={armadaId} onChange={(e) => setArmadaId(e.target.value)}>
                  {ARMADA.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} · {idr(a.fee)}
                    </option>
                  ))}
                </Select>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat kirim"
                />
              </div>
            )}

            <div className="space-y-1 border-t border-dashed border-ink-200 pt-2.5 font-mono text-[11.5px]">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span className="tabular text-ink-800">{idr(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-ink-500">
                  <span>Diskon</span>
                  <span className="tabular text-ink-800">−{idr(discountValue)}</span>
                </div>
              )}
              {delivery && (
                <div className="flex justify-between text-ink-500">
                  <span>Ongkir</span>
                  <span className="tabular text-ink-800">{idr(shippingFee)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-ink-900 pt-1.5">
                <span className="text-[11px] font-bold tracking-wide text-ink-900">TOTAL</span>
                <span className="font-display text-[24px] leading-none font-bold tabular text-ink-900">{idr(total)}</span>
              </div>
            </div>

            {error && (
              <p className="flex items-start gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-[11.5px] font-medium text-red-700">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}

            <Button onClick={openPayment} size="lg" className="w-full" disabled={cart.length === 0}>
              Bayar · {idr(total)}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Pembayaran"
        subtitle={`${cart.length} jenis barang · ${activeBranch.shortName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitPayment}>Simpan & cetak nota</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition ${
                  method === m.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-ink-900 px-4 py-3 text-white">
            <div className="text-[11px] text-white/50">Total tagihan</div>
            <div className="font-display text-[30px] leading-none font-semibold tabular">{idr(total)}</div>
          </div>

          {method === 'cash' && (
            <div>
              <Field label="Uang diterima" hint={`kembalian ${idr(Math.max(0, (Number(cashInput) || 0) - total))}`}>
                <Input
                  type="number"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  placeholder={String(total)}
                  autoFocus
                />
              </Field>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[total, Math.ceil(total / 50000) * 50000, Math.ceil(total / 100000) * 100000].map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setCashInput(String(v))}
                    className="rounded-md border border-ink-200 px-2.5 py-1 text-[11.5px] font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-700"
                  >
                    {i === 0 ? 'Uang pas' : idr(v)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === 'tempo' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-amber-800">
                <UserRound size={13} /> Nota tempo 30 hari
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-amber-700">
                {customerId
                  ? `Tagihan dicatat atas nama ${branchCustomers.find((c) => c.id === customerId)?.name}. Jatuh tempo ${new Date(Date.now() + 30 * 86400000).toLocaleDateString('id-ID')}.`
                  : 'Pilih pelanggan terlebih dahulu. Nota tempo hanya untuk pelanggan kontraktor/toko langganan.'}
              </p>
            </div>
          )}

          {(method === 'qris' || method === 'transfer') && (
            <p className="rounded-lg bg-ink-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-600">
              Konfirmasi bukti pembayaran {method === 'qris' ? 'QRIS' : 'transfer'} sebelum menyimpan nota. Nominal
              terbayar dianggap penuh.
            </p>
          )}
        </div>
      </Modal>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Nota penjualan" width="max-w-md">
        {receipt && <Receipt txn={receipt} onClose={() => setReceipt(null)} />}
      </Modal>
    </div>
  )
}
