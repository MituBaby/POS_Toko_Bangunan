import { useApp } from '../store/AppContext'
import { dateFull, idr, num, timeOf } from '../lib/format'

const METHOD_LABEL = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer Bank',
  tempo: 'Tempo / Kredit',
}

export default function Receipt({ txn, onClose }) {
  const { branches, user } = useApp()
  const branch = branches.find((b) => b.id === txn.branchId) ?? branches[0]
  const remaining = txn.total - txn.paidAmount

  return (
    <div className="mx-auto max-w-[360px]">
      <div className="nota print-area rounded-sm px-5 py-5 font-mono text-[11.5px] leading-relaxed text-ink-900">
        <div className="text-center">
          <div className="font-display text-[19px] font-bold tracking-wide">BANGUN JAYA</div>
          <div className="text-[10.5px] font-semibold tracking-wide text-ink-600">{branch.name.toUpperCase()}</div>
          <div className="mt-1 text-[10px] leading-snug text-ink-500">{branch.address}</div>
          <div className="text-[10px] text-ink-500">Telp. {branch.phone}</div>
        </div>

        <div className="dashed-rule my-2.5" />

        <div className="flex justify-between">
          <span className="text-ink-500">No. Nota</span>
          <span className="font-semibold">{txn.code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-500">Tanggal</span>
          <span>
            {dateFull(txn.date)} {timeOf(txn.date)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-500">Kasir</span>
          <span>{txn.cashier ?? user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-500">Pelanggan</span>
          <span className="max-w-[60%] truncate text-right">{txn.customerName}</span>
        </div>

        <div className="dashed-rule my-2.5" />

        <div className="space-y-2">
          {txn.items.map((it) => (
            <div key={it.productId}>
              <div className="font-semibold">{it.name}</div>
              <div className="flex justify-between text-ink-600">
                <span>
                  {num(it.qty)} {it.unit} × {idr(it.unitPrice)}
                  {it.tier !== 'eceran' && <span className="ml-1 text-[9.5px] uppercase">({it.tier})</span>}
                </span>
                <span className="tabular text-ink-900">{idr(it.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashed-rule my-2.5" />

        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-ink-500">Subtotal</span>
            <span className="tabular">{idr(txn.subtotal)}</span>
          </div>
          {txn.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-500">Diskon</span>
              <span className="tabular">−{idr(txn.discount)}</span>
            </div>
          )}
          {txn.shipping?.fee > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-500">Ongkir ({txn.shipping.armada})</span>
              <span className="tabular">{idr(txn.shipping.fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-900 pt-1 text-[13px] font-bold">
            <span>TOTAL</span>
            <span className="tabular">{idr(txn.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">{METHOD_LABEL[txn.paymentMethod]}</span>
            <span className="tabular">{idr(txn.paidAmount)}</span>
          </div>
          {remaining > 0 && (
            <div className="flex justify-between font-semibold">
              <span>Sisa tagihan</span>
              <span className="tabular">{idr(remaining)}</span>
            </div>
          )}
        </div>

        {txn.shipping?.method === 'delivery' && (
          <>
            <div className="dashed-rule my-2.5" />
            <div className="text-[10px] font-bold tracking-wide">SURAT JALAN — {txn.shipping.armada}</div>
            <div className="text-[10px] leading-snug text-ink-600">
              Kirim ke: {txn.shipping.address || 'alamat pelanggan'}
            </div>
          </>
        )}

        {txn.dueDate && remaining > 0 && (
          <>
            <div className="dashed-rule my-2.5" />
            <div className="text-[10px] leading-snug text-ink-600">
              Jatuh tempo: {dateFull(txn.dueDate)}. Simpan nota ini sebagai bukti tagihan.
            </div>
          </>
        )}

        <div className="dashed-rule my-2.5" />
        <div className="text-center text-[10px] leading-relaxed text-ink-500">
          Barang yang sudah dibeli tidak dapat ditukar
          <br />
          kecuali rusak dari pabrik.
          <br />
          <span className="font-semibold text-ink-700">Terima kasih atas kepercayaan Anda.</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => window.print()}
          className="h-10 flex-1 rounded-lg bg-ink-900 text-sm font-semibold text-white transition hover:bg-ink-800"
        >
          Cetak nota
        </button>
        <button
          onClick={onClose}
          className="h-10 flex-1 rounded-lg border border-ink-300 bg-white text-sm font-semibold text-ink-700 transition hover:border-ink-400"
        >
          Transaksi baru
        </button>
      </div>
    </div>
  )
}
