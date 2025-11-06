import { useState, useEffect, useCallback } from 'react'

export function useSheetData(sheetName) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `https://script.google.com/macros/s/AKfycbyZVUuOh3_WWXeLYP5Q9-pBkaFy-DAstfjKuZglh2y6QJHzkGE4_Ro4d_sRKCC69YGw/exec?sheet=${sheetName}`,
        { mode: 'cors' }
      )
      if (!res.ok) {
        throw new Error('Gagal mengambil data Google Sheet')
      }
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
      setUpdatedAt(new Date())
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [sheetName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { rows, loading, error, updatedAt, refresh: fetchData }
}
