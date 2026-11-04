// Data dummy toko bangunan. Nominal dalam Rupiah.
// Stok disimpan per cabang: product.stock[branchId] — inilah sumber isolasi data antar cabang.
export const SEED_VERSION = 5

export const BRANCHES = [
  {
    id: 'cbr-pusat',
    code: 'PST',
    name: 'Cabang Pusat Cileungsi',
    shortName: 'Cileungsi',
    city: 'Bogor',
    address: 'Jl. Raya Cileungsi No. 142, Cileungsi, Bogor',
    phone: '021-8230 4411',
    manager: 'H. Suparman',
    isMain: true,
    active: true,
    openedAt: '2014-03-02',
    warehouse: 'Gudang A & B · 1.200 m²',
  },
  {
    id: 'cbr-cibinong',
    code: 'CBN',
    name: 'Cabang Cibinong',
    shortName: 'Cibinong',
    city: 'Bogor',
    address: 'Jl. Raya Jakarta–Bogor KM 42, Cibinong, Bogor',
    phone: '021-8791 2260',
    manager: 'Rina Kartika',
    isMain: false,
    active: true,
    openedAt: '2019-08-17',
    warehouse: 'Gudang C · 640 m²',
  },
  {
    id: 'cbr-bekasi',
    code: 'BKS',
    name: 'Cabang Bekasi Timur',
    shortName: 'Bekasi Timur',
    city: 'Bekasi',
    address: 'Jl. Ir. H. Juanda No. 88, Bekasi Timur',
    phone: '021-8842 7719',
    manager: 'Bayu Prakoso',
    isMain: false,
    active: true,
    openedAt: '2026-09-01',
    warehouse: 'Gudang D · 420 m²',
  },
]

export const USERS = [
  { id: 'usr-owner', name: 'H. Suparman', role: 'owner', branchId: 'cbr-pusat', initials: 'HS' },
  { id: 'usr-admin', name: 'Rina Kartika', role: 'admin', branchId: 'cbr-cibinong', initials: 'RK' },
  { id: 'usr-ksr1', name: 'Rian Saputra', role: 'cashier', branchId: 'cbr-pusat', initials: 'RS' },
  { id: 'usr-ksr2', name: 'Dewi Lestari', role: 'cashier', branchId: 'cbr-cibinong', initials: 'DL' },
  { id: 'usr-ksr3', name: 'Bayu Prakoso', role: 'cashier', branchId: 'cbr-bekasi', initials: 'BP' },
]

export const CATEGORIES = [
  'Semen & Mortar',
  'Besi & Baja',
  'Pasir & Batu',
  'Keramik & Granit',
  'Cat & Finishing',
  'Kayu & Papan',
  'Kelistrikan',
  'Pipa & Sanitasi',
  'Alat & Perkakas',
]

const product = (id, sku, name, category, unit, cost, eceran, tukang, kontraktor, minStock, stock, supplier) => ({
  id,
  sku,
  name,
  category,
  unit,
  cost,
  price: { eceran, tukang, kontraktor },
  minStock,
  stock: { 'cbr-pusat': stock[0], 'cbr-cibinong': stock[1], 'cbr-bekasi': stock[2] },
  supplier,
})

export const PRODUCTS = [
  product('prd-semen-50', 'SMN-01', 'Semen Tiga Roda 50 kg', 'Semen & Mortar', 'zak', 62000, 72000, 69500, 67500, 40, [320, 96, 24], 'PT Indocement'),
  product('prd-semen-40', 'SMN-02', 'Semen Gresik 40 kg', 'Semen & Mortar', 'zak', 52000, 60000, 58000, 56000, 30, [180, 40, 12], 'PT Semen Gresik'),
  product('prd-mortar', 'SMN-03', 'Mortar Perekat MU-301 40 kg', 'Semen & Mortar', 'zak', 78000, 89000, 86000, 84000, 20, [64, 18, 0], 'PT Mortar Utama'),
  product('prd-hebel', 'SMN-04', 'Hebel AAC 7,5 × 20 × 60', 'Semen & Mortar', 'pcs', 9500, 12500, 11800, 11000, 100, [840, 220, 60], 'PT Grand Elephant'),
  product('prd-besi-8', 'BSI-01', 'Besi Beton Polos 8 mm SNI', 'Besi & Baja', 'batang', 52000, 62000, 60000, 58000, 50, [410, 120, 35], 'Baja Nusantara'),
  product('prd-besi-10', 'BSI-02', 'Besi Beton Ulir 10 mm SNI', 'Besi & Baja', 'batang', 78000, 92000, 89000, 86000, 40, [260, 60, 0], 'Baja Nusantara'),
  product('prd-wiremesh', 'BSI-03', 'Wiremesh M6 2,1 × 5,4 m', 'Besi & Baja', 'lembar', 185000, 215000, 208000, 200000, 10, [42, 8, 2], 'Baja Nusantara'),
  product('prd-pasir', 'PSR-01', 'Pasir Beton', 'Pasir & Batu', 'm³', 210000, 265000, 255000, 245000, 5, [24, 6, 0], 'Galian Cileungsi'),
  product('prd-split', 'PSR-02', 'Batu Split 1–2', 'Pasir & Batu', 'm³', 235000, 290000, 280000, 270000, 5, [18, 4, 0], 'Galian Cileungsi'),
  product('prd-bata', 'PSR-03', 'Batu Bata Merah Press', 'Pasir & Batu', 'buah', 950, 1300, 1200, 1150, 500, [8600, 2400, 300], 'Bata Jaya'),
  product('prd-keramik-40', 'KRM-01', 'Keramik Roman 40 × 40 Putih', 'Keramik & Granit', 'dus', 58000, 72000, 69000, 67000, 20, [128, 30, 6], 'Roman Indonesia'),
  product('prd-granit-60', 'KRM-02', 'Granit Tile 60 × 60 Ivory', 'Keramik & Granit', 'dus', 98000, 128000, 122000, 118000, 15, [76, 14, 0], 'Granito'),
  product('prd-keramik-25', 'KRM-03', 'Keramik Dinding 25 × 40 Motif', 'Keramik & Granit', 'dus', 52000, 65000, 62000, 60000, 15, [0, 22, 0], 'Roman Indonesia'),
  product('prd-cat-dulux', 'CAT-01', 'Cat Tembok Dulux Pentalite 5 kg', 'Cat & Finishing', 'pail', 235000, 289000, 278000, 269000, 10, [38, 9, 3], 'PT ICI Paints'),
  product('prd-cat-avitex', 'CAT-02', 'Cat Avitex 25 kg', 'Cat & Finishing', 'pail', 640000, 745000, 725000, 705000, 6, [12, 2, 0], 'PT Avia Avian'),
  product('prd-kuas', 'CAT-03', 'Kuas Eterna 4 inci', 'Cat & Finishing', 'buah', 14000, 19500, 18500, 17500, 24, [60, 18, 8], 'Eterna'),
  product('prd-kayu-46', 'KAY-01', 'Kayu Meranti 4 × 6', 'Kayu & Papan', 'batang', 42000, 55000, 52000, 49000, 30, [180, 40, 12], 'UPTD Kehutanan'),
  product('prd-triplek', 'KAY-02', 'Triplek 9 mm 122 × 244', 'Kayu & Papan', 'lembar', 132000, 158000, 152000, 148000, 15, [64, 12, 4], 'Sumber Plywood'),
  product('prd-kabel', 'KLS-01', 'Kabel NYM 2 × 1,5 Eterna 50 m', 'Kelistrikan', 'roll', 385000, 445000, 432000, 420000, 5, [18, 4, 1], 'PT Eterna'),
  product('prd-saklar', 'KLS-02', 'Saklar Panasonic Broco', 'Kelistrikan', 'buah', 12000, 17500, 16800, 16000, 20, [96, 20, 0], 'Panasonic'),
  product('prd-pipa-3', 'PIP-01', 'Pipa PVC Wavin 3 inci AW', 'Pipa & Sanitasi', 'batang', 78000, 95000, 92000, 89000, 20, [72, 16, 6], 'Wavin'),
  product('prd-knee-3', 'PIP-02', 'Knee 3 inci PVC', 'Pipa & Sanitasi', 'buah', 5500, 8500, 8000, 7500, 50, [210, 40, 0], 'Wavin'),
  product('prd-paku', 'ALK-01', 'Paku Beton 5 cm', 'Alat & Perkakas', 'kg', 18000, 25000, 23500, 22500, 20, [84, 20, 5], 'Sinar Paku'),
  product('prd-sekop', 'ALK-02', 'Sekop Baja Gagang Kayu', 'Alat & Perkakas', 'buah', 42000, 58000, 55000, 52000, 8, [22, 5, 2], 'Tekiro'),
]

export const CUSTOMERS = [
  { id: 'cst-graha', branchId: 'cbr-pusat', name: 'PT Graha Sentosa', type: 'kontraktor', phone: '0812-1100 4432', address: 'Perum Griya Asri Blok C, Cileungsi', project: 'Perumahan Griya Asri — 42 unit', creditLimit: 150000000 },
  { id: 'cst-bangun', branchId: 'cbr-pusat', name: 'CV Bangun Mandiri', type: 'kontraktor', phone: '0813-8890 1177', address: 'Jl. Alternatif Cibubur KM 3', project: 'Ruko Cibubur Junction', creditLimit: 90000000 },
  { id: 'cst-hendra', branchId: 'cbr-pusat', name: 'Hendra (Tukang Batu)', type: 'tukang', phone: '0857-2210 9981', address: 'Kp. Cibeuteung, Cileungsi', project: 'Renovasi rumah Jl. Melati', creditLimit: 12000000 },
  { id: 'cst-umum-pusat', branchId: 'cbr-pusat', name: 'Umum / Tanpa Nama', type: 'retail', phone: '-', address: '-', project: '-', creditLimit: 0 },
  { id: 'cst-karya', branchId: 'cbr-cibinong', name: 'PT Karya Beton Nusantara', type: 'kontraktor', phone: '0811-1902 5566', address: 'Kawasan Industri Sentul Blok B4', project: 'Gudang Sentul Fase 2', creditLimit: 120000000 },
  { id: 'cst-andi', branchId: 'cbr-cibinong', name: 'Andi Wijaya', type: 'kontraktor', phone: '0821-3345 7712', address: 'Jl. Pahlawan No. 12, Cibinong', project: 'Ruko Pahlawan 3 lantai', creditLimit: 45000000 },
  { id: 'cst-sinar', branchId: 'cbr-cibinong', name: 'Toko Bangunan Sinar Jaya', type: 'retail', phone: '021-8791 0088', address: 'Jl. Raya Cibinong No. 4', project: '-', creditLimit: 20000000 },
  { id: 'cst-sumber', branchId: 'cbr-bekasi', name: 'CV Sumber Rejeki', type: 'kontraktor', phone: '0812-7788 3321', address: 'Jl. Cut Mutia No. 77, Bekasi', project: 'Renovasi Pasar Baru Bekasi', creditLimit: 60000000 },
  { id: 'cst-jumadi', branchId: 'cbr-bekasi', name: 'Pak Jumadi', type: 'tukang', phone: '0856-4432 1100', address: 'Jl. Kebon Sari, Bekasi Timur', project: 'Pagar & cor halaman', creditLimit: 8000000 },
]

// PRNG deterministik: data demo tetap sama sebelum disimpan ke localStorage.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ARMADA = [
  { label: 'Pick-up L300', fee: 60000 },
  { label: 'Colt Diesel 110', fee: 90000 },
  { label: 'Truk Engkel', fee: 120000 },
]

function generateTransactions() {
  const rnd = mulberry32(20261102)
  const txns = []
  const seq = { 'cbr-pusat': 0, 'cbr-cibinong': 0, 'cbr-bekasi': 0 }
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = 29; d >= 0; d--) {
    const day = new Date(today)
    day.setDate(day.getDate() - d)

    BRANCHES.filter((b) => b.active).forEach((branch) => {
      const staff = USERS.filter((u) => u.branchId === branch.id && u.role === 'cashier')
      const cashierName = staff.length ? staff[0].name : branch.manager
      const base = branch.id === 'cbr-bekasi' ? 2 : 4
      const count = base + Math.floor(rnd() * 4)

      for (let i = 0; i < count; i++) {
        seq[branch.id] += 1
        const date = new Date(day)
        date.setHours(8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60), 0, 0)

        const itemCount = 1 + Math.floor(rnd() * 4)
        const items = []
        const used = new Set()
        for (let k = 0; k < itemCount; k++) {
          const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)]
          if (used.has(p.id)) continue
          used.add(p.id)
          const tierRoll = rnd()
          const tier = tierRoll < 0.52 ? 'eceran' : tierRoll < 0.86 ? 'tukang' : 'kontraktor'
          const unitPrice = p.price[tier]
          let qty
          if (p.unit === 'm³') qty = 1 + Math.floor(rnd() * 4)
          else if (p.unit === 'zak' || p.unit === 'pcs') qty = 2 + Math.floor(rnd() * 14)
          else if (p.unit === 'buah' && p.price.eceran < 2000) qty = 50 + Math.floor(rnd() * 450)
          else qty = 1 + Math.floor(rnd() * 8)
          items.push({ productId: p.id, name: p.name, unit: p.unit, qty, unitPrice, tier, subtotal: qty * unitPrice })
        }
        if (!items.length) continue

        const subtotal = items.reduce((a, it) => a + it.subtotal, 0)
        const discount = rnd() < 0.22 ? (1 + Math.floor(rnd() * 5)) * 5000 : 0

        const delivery = rnd() < 0.22
        const armada = ARMADA[Math.floor(rnd() * ARMADA.length)]
        const shipping = {
          method: delivery ? 'delivery' : 'pickup',
          armada: delivery ? armada.label : '',
          fee: delivery ? armada.fee : 0,
          address: delivery ? 'Alamat proyek pelanggan' : '',
        }

        const methodRoll = rnd()
        const paymentMethod =
          methodRoll < 0.44 ? 'cash' : methodRoll < 0.72 ? 'qris' : methodRoll < 0.9 ? 'transfer' : 'tempo'

        const branchCustomers = CUSTOMERS.filter((c) => c.branchId === branch.id)
        const creditCustomers = branchCustomers.filter((c) => c.type !== 'retail')
        let customer = null
        if (paymentMethod === 'tempo' && creditCustomers.length) {
          customer = creditCustomers[Math.floor(rnd() * creditCustomers.length)]
        } else if (rnd() < 0.32) {
          customer = branchCustomers[Math.floor(rnd() * branchCustomers.length)]
        }

        const total = subtotal - discount + shipping.fee
        const paidAmount = paymentMethod === 'tempo' ? (rnd() < 0.3 ? Math.round(total * 0.4) : 0) : total

        const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

        txns.push({
          id: `txn-${branch.code}-${seq[branch.id]}`,
          code: `INV/${branch.code}/${ymd}/${String(seq[branch.id]).padStart(4, '0')}`,
          branchId: branch.id,
          date: date.toISOString(),
          cashier: cashierName,
          customerId: customer ? customer.id : null,
          customerName: customer ? customer.name : 'Umum',
          items,
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod,
          paidAmount,
          dueDate: paymentMethod === 'tempo' ? new Date(date.getTime() + 30 * 86400000).toISOString() : null,
          status: paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
        })
      }
    })
  }

  return txns.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const TRANSACTIONS = generateTransactions()

export const TRANSFERS = [
  {
    id: 'trf-1',
    code: 'TRF/2026/0091',
    fromBranchId: 'cbr-pusat',
    toBranchId: 'cbr-bekasi',
    productId: 'prd-semen-50',
    qty: 80,
    unit: 'zak',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'diterima',
    note: 'Stok awal pembukaan cabang Bekasi',
    by: 'H. Suparman',
  },
  {
    id: 'trf-2',
    code: 'TRF/2026/0092',
    fromBranchId: 'cbr-pusat',
    toBranchId: 'cbr-cibinong',
    productId: 'prd-granit-60',
    qty: 20,
    unit: 'dus',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'dikirim',
    note: 'Permintaan granit proyek Sentul',
    by: 'Rina Kartika',
  },
  {
    id: 'trf-3',
    code: 'TRF/2026/0093',
    fromBranchId: 'cbr-cibinong',
    toBranchId: 'cbr-bekasi',
    productId: 'prd-besi-8',
    qty: 25,
    unit: 'batang',
    date: new Date(Date.now() - 6 * 3600000).toISOString(),
    status: 'draft',
    note: 'Menunggu persetujuan kepala gudang',
    by: 'Bayu Prakoso',
  },
]
