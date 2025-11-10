import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ComposedChart, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useSheetData } from '../hooks/useSheetData'
import { TrendingUp, Factory, Building2, Leaf, RefreshCw } from 'lucide-react'

export function DashboardPage() {
  const { rows: kebun } = useSheetData('Perkebunan')
  const { rows: pabrik } = useSheetData('Pabrik')
  const { rows: perusahaan } = useSheetData('Perusahaan')

  // Hitung ringkasan data untuk insight singkat
  const summary = useMemo(() => {
    if (!kebun.length || !perusahaan.length) return {}
    const avgHasil = kebun.reduce((a, b) => a + Number(b['Hasil Panen (ton)'] || 0), 0) / kebun.length
    const avgCPO = perusahaan.reduce((a, b) => a + Number(b['Produksi CPO (ton)'] || 0), 0) / perusahaan.length
    const avgFFA = perusahaan.reduce((a, b) => a + Number(b['FFA (%)'] || 0), 0) / perusahaan.length
    return { avgHasil, avgCPO, avgFFA }
  }, [kebun, perusahaan])

  // Data gabungan untuk chart utama
  const chartData = useMemo(() => {
    if (!kebun.length || !perusahaan.length) return []
    return kebun.map((k, i) => ({
      bulan: k['Bulan'],
      hasil: Number(k['Hasil Panen (ton)']),
      cpo: Number(perusahaan[i]?.['Produksi CPO (ton)'] || 0),
      ffa: Number(perusahaan[i]?.['FFA (%)'] || 0)
    }))
  }, [kebun, perusahaan])

  return (
    <div className="space-y-8 p-6 text-white">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          🌴 Dashboard Monitoring & Analisis Produksi Sawit
        </h1>
        <p className="text-slate-400">Integrasi data Perkebunan, Pabrik, dan Perusahaan dalam satu tampilan.</p>
      </header>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Leaf />} title="Rata-rata Hasil Panen" value={summary.avgHasil?.toFixed(1)} unit="ton" color="from-green-400 to-emerald-600" />
        <StatCard icon={<Factory />} title="Rata-rata Produksi CPO" value={summary.avgCPO?.toFixed(1)} unit="ton" color="from-yellow-400 to-orange-500" />
        <StatCard icon={<Building2 />} title="Rata-rata FFA" value={summary.avgFFA?.toFixed(2)} unit="%" color="from-pink-500 to-fuchsia-600" />
      </div>

      {/* Grafik utama gabungan */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Perbandingan Hasil Panen & Produksi CPO</h2>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-300 hover:text-white">
            <RefreshCw size={18} /> Muat Ulang
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bulan" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', color: '#e2e8f0' }} />
              <Legend />
              <Bar dataKey="hasil" fill="#8b5cf6" name="Hasil Panen (ton)" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="cpo" stroke="#f472b6" name="Produksi CPO (ton)" strokeWidth={2} />
              <Line type="monotone" dataKey="ffa" stroke="#22d3ee" name="FFA (%)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Insight otomatis */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">🧠 Insight Otomatis</h2>
        {summary.avgFFA < 3 ? (
          <p className="text-green-400">Kualitas CPO tergolong baik dengan FFA di bawah ambang batas. Produksi stabil dan efisien.</p>
        ) : (
          <p className="text-yellow-400">Perlu perhatian pada kualitas CPO. Nilai FFA di atas normal bisa mempengaruhi hasil akhir.</p>
        )}
      </section>

      {/* Navigasi ke halaman detail */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PageLink title="Perkebunan" desc="Pantau hasil panen dan kondisi lapangan." link="/perkebunan" icon={<Leaf />} />
        <PageLink title="Pabrik" desc="Analisis proses produksi dan kualitas limbah." link="/pabrik" icon={<Factory />} />
        <PageLink title="Perusahaan" desc="Lihat performa produksi CPO dan kualitas akhir." link="/perusahaan" icon={<Building2 />} />
      </section>
    </div>
  )
}

// 🔹 Komponen kecil
const StatCard = ({ icon, title, value, unit, color }) => (
  <div className={`rounded-2xl p-4 bg-gradient-to-br ${color} text-center`}>
    <div className="flex justify-center mb-2">{icon}</div>
    <h4 className="text-sm opacity-90">{title}</h4>
    <p className="text-2xl font-bold">{value || '--'} <span className="text-sm">{unit}</span></p>
  </div>
)

const PageLink = ({ title, desc, link, icon }) => (
  <Link to={link} className="group bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
    <div className="flex items-center gap-2 mb-2 text-pink-400 group-hover:text-white">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-slate-400 text-sm">{desc}</p>
  </Link>
)
