export function parseNumber(value) {
  if (value == null) return null
  const normalized = String(value)
    .replace(/[^0-9,.-]/g, '')
    .replace(/,(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function detectColumns(rows) {
  if (!rows || rows.length === 0) {
    return { categoryKey: null, numericKeys: [] }
  }
  const keys = Object.keys(rows[0])
  const numericKeys = keys.filter((key) => parseNumber(rows[0][key]) != null)
  const categoryKey = keys.find((key) => !numericKeys.includes(key)) ?? keys[0]
  return { categoryKey, numericKeys }
}

export function buildChartData(rows, categoryKey, valueKey) {
  return rows
    .map((row) => {
      const label = row[categoryKey]
      const value = parseNumber(row[valueKey])
      if (label == null || value == null) {
        return null
      }
      return { label, value }
    })
    .filter(Boolean)
}

export function summarize(rows, keys) {
  if (!keys.length) return 0
  const total = rows.reduce((acc, row) => {
    return (
      acc +
      keys.reduce((sum, key) => {
        const parsed = parseNumber(row[key])
        return sum + (parsed ?? 0)
      }, 0)
    )
  }, 0)
  return total
}
