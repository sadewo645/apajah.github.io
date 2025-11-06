import { useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useSheetData } from '../hooks/useSheetData'

const Perkebunan = () => {
  const { rows, loading, error } = useSheetData('Perkebunan')

  // Format data dari sheet untuk grafik
  const chartData = useMemo(() => {
    if (!rows || !rows.length) return []
    return rows.map(r => ({
      Bulan: r['Bulan'],
      Panen: Number(r['Hasil Panen (ton)']),
    }))
  }, [rows])

  const latest = rows.length ? rows[rows.length - 1] : {}

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-white">Monitoring Perkebunan</h2>
      <p className="text-slate-300">Integrasi sensor lapangan untuk memastikan performa agronomis optimal.</p>

      {/* Grafik */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hasil Panen Bulanan</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="Bulan" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', color: '#e2e8f0' }} />
              <Bar dataKey="Panen" fill="url(#grad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="pH Tanah" value={latest['pH Tanah']} unit="" />
        <Card title="Kelembapan Tanah" value={latest['Kelembapan (%)']} unit="%" />
        <Card title="Intensitas Cahaya" value={latest['Cahaya (lux)']} unit="lux" />
        <Card title="Curah Hujan" value={latest['Hujan (mm)']} unit="mm" />
      </div>
    </section>
  )
}

const Card = ({ title, value, unit }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
    <h4 className="text-sm text-slate-400">{title}</h4>
    <p className="text-2xl font-semibold text-white">{value ?? '--'} {unit}</p>
  </div>
)

export default Perkebunan
