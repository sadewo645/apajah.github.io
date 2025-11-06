import { useState, useEffect, useCallback } from 'react'

export function useSheetData(sheetName) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sheet?sheet=${sheetName}`);
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
