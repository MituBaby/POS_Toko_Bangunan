export const idr = (n) =>
  'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(n || 0))

export const idrShort = (n) => {
  const v = Math.abs(n || 0)
  if (v >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace('.', ',')} M`
  if (v >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace('.', ',')} jt`
  if (v >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`
  return idr(n)
}

export const num = (n) => new Intl.NumberFormat('id-ID').format(n || 0)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const dateShort = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const dateFull = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const timeOf = (iso) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const dateTime = (iso) => `${dateShort(iso)} · ${timeOf(iso)}`

export const dayKey = (d) => {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export const isSameDay = (a, b) => dayKey(a) === dayKey(b)

export const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000)

export const pct = (n) => `${(n || 0).toFixed(1).replace('.', ',')}%`

export const initialsOf = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
