# TB. PUTRA AGUNG PRATAMA — POS & Kasir Toko Bangunan

Frontend aplikasi kasir (POS) untuk toko bangunan dengan pengelolaan cabang. Satu database pusat, data terisolasi per cabang.

## Menjalankan

```bash
npm install
npm run dev
```

Build produksi: `npm run build` lalu `npm run preview`.

## Stack

- Vite + React 19 + Tailwind CSS v4 (`@tailwindcss/vite`, token tema di `src/index.css`)
- React Router v7, lucide-react
- State: Context API (`src/store/AppContext.jsx`) + persistensi `localStorage` (key `bangunjaya-pos-v1`)

## Peta halaman

| Route | Halaman |
| --- | --- |
| `/` | Ringkasan (dashboard) |
| `/kasir` | Kasir / POS |
| `/produk` | Produk & stok + transfer antar cabang |
| `/piutang` | Pelanggan & piutang tempo |
| `/laporan` | Laporan penjualan |
| `/cabang` | Manajemen cabang |

## Model isolasi cabang (penting)

- Stok disimpan **per cabang** di `product.stock[branchId]`, bukan satu angka global.
- Setiap transaksi dan pelanggan membawa `branchId`.
- `activeBranchId` di store adalah satu-satunya sumber cakupan data. Nilai `ALL` = mode konsolidasi (hanya baca; kasir & penyesuaian stok dinonaktifkan).
- Peran (`owner` / `admin` / `cashier`) diatur di `PERMISSIONS` pada `AppContext.jsx`. Kasir terkunci pada `user.branchId` dan tidak bisa berpindah cabang.
- Cabang baru otomatis mendapat stok 0 untuk semua SKU dan satu pelanggan "Umum".

## Data dummy

- `src/data/seed.js` berisi 24 SKU, 3 cabang, pelanggan, dan ±420 transaksi 30 hari yang dihasilkan PRNG deterministik.
- Menaikkan `SEED_VERSION` membuat `localStorage` lama diabaikan (data demo di-reset otomatis).
- Reset manual: menu profil kanan atas → "Kembalikan data demo".

## Konvensi UI

- Warna utama: `brand-*` (oranye) di `@theme`; netral memakai `ink-*`, latar `paper`.
- Judul memakai `font-display` (Barlow Condensed), angka uang `font-mono` + `tabular`.
- Komponen dasar (`Button`, `Card`, `Badge`, `Modal`, `Field`, `Input`) ada di `src/components/ui.jsx` — pakai ulang, jangan buat varian baru.
- Cetak struk: `src/components/Receipt.jsx` memakai class `.print-area`; aturan `@media print` di `index.css` hanya mencetak nota.
