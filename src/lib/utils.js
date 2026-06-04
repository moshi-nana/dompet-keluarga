export function formatRupiah(amount, compact = false) {
  const num = Number(amount) || 0
  if (compact && Math.abs(num) >= 1_000_000) {
    return 'Rp ' + (num / 1_000_000).toFixed(1).replace('.0', '') + 'jt'
  }
  if (compact && Math.abs(num) >= 1_000) {
    return 'Rp ' + (num / 1_000).toFixed(0) + 'rb'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(d)
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short'
  }).format(d)
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function monthYear(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
}

export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]
