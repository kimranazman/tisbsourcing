import { format, parseISO } from 'date-fns'

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'RM 0.00'
  return `RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('en-MY')
}

export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy')
  } catch {
    return dateStr
  }
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'MMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatPercentage(value, total) {
  if (!total || total === 0) return '0%'
  return ((value / total) * 100).toFixed(1) + '%'
}
