import { useMemo } from 'react'
import { useSheetData } from '../hooks/useSheetData'
import { DataCard } from '../components/DataCard'
import { ChartCard } from '../components/ChartCard'
import { DataTable } from '../components/DataTable'
import { detectColumns, buildChartData, summarize } from '../utils/data'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts'

const sheets = [
  { key: 'perkebunan', name: 'Perkebunan', sheet: 'Perkebunan' },
  { key: 'pabrik', name: 'Pabrik', sheet: 'Pabrik' },
  { key: 'perusahaan', name: 'Perusahaan', sheet: 'Perusahaan' },
]

export function DashboardPage() {
  const dataMap = sheets.reduce((acc, item) => {
    acc[item.key] = useSheetData(item.sheet)
    return acc
  }, {})

  const perkebunanData = dataMap.perkebunan.rows
  const hasError = sheets.some((item) => dataMap[item.key].error)
  const { categoryKey, numericKeys } = useMemo(() => detectColumns(perkebunanData), [perkebunanData])
  const primaryValueKey = numericKeys[0]

  const chartData = useMemo(() => {
    if (!categoryKey || !primaryValueKey) return []
    return buildChartData(perkebunanData, categoryKey, primaryValueKey)
  }, [perkebunanData, categoryKey, primaryValueKey])

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Dashboard Utama</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Monitoring PKS & Kebun</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/60">
          Ringkasan singkat performa dari seluruh rantai usaha. Data bersumber dari Google Sheet dan
          diperbarui secara berkala untuk memudahkan pengambilan keputusan cepat.
        </p>
      </header>

      {hasError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 shadow-lg">
          Sebagian data tidak dapat dimuat. Silakan cek koneksi ke Google Sheet dan coba lagi.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {sheets.map((item) => {
          const { rows, loading } = dataMap[item.key]
          const { numericKeys: sheetNumeric } = detectColumns(rows)
          const total = summarize(rows, sheetNumeric)
          return (
            <DataCard
              key={item.key}
              title={`Total ${item.name}`}
              value={loading ? 'Memuat…' : total.toLocaleString('id-ID')}
              description={`Akumulasi seluruh indikator numerik pada sheet ${item.name}.`}
              accent="from-primary via-sky-500 to-secondary"
            />
          )
        })}
      </div>

      <ChartCard
        title="Tren Produksi Perkebunan"
        subtitle={
          primaryValueKey
            ? `Grafik berdasarkan kolom ${primaryValueKey} pada sheet Perkebunan.`
            : 'Tidak ada kolom numerik yang dapat divisualisasikan.'
        }
        actions={<DashboardStatus dataMap={dataMap} />}
      >
        {primaryValueKey ? (
          <div className="h-80 min-w-[32rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#a21caf" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fill: '#e2e8f0', fontSize: 12, textShadow: '0 1px 6px rgba(15, 23, 42, 0.6)' }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-white/60">Tidak ada data numerik yang dapat ditampilkan.</p>
        )}
      </ChartCard>

      <ChartCard title="Sampel Data Perkebunan" subtitle="Lima baris pertama untuk pengecekan cepat.">
        <DashboardTablePreview rows={perkebunanData} />
      </ChartCard>
    </div>
  )
}

function DashboardStatus({ dataMap }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
      {Object.entries(dataMap).map(([key, value]) => (
        <span key={key} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {value.loading ? 'Memuat…' : `${value.rows.length} baris`}
        </span>
      ))}
    </div>
  )
}

function DashboardTablePreview({ rows }) {
  if (!rows.length) {
    return <p className="text-sm text-white/60">Data belum tersedia.</p>
  }

  const columns = Object.keys(rows[0])
  const previewRows = rows.slice(0, 5)

  return <DataTable columns={columns} rows={previewRows} />
}
