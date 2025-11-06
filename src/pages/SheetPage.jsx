import { useMemo } from 'react'
import { useSheetData } from '../hooks/useSheetData'
import { ChartCard } from '../components/ChartCard'
import { DataTable } from '../components/DataTable'
import { DataCard } from '../components/DataCard'
import { detectColumns, buildChartData } from '../utils/data'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList,
} from 'recharts'

export function SheetPage({ sheetName, title, description }) {
  const { rows, loading, error, updatedAt, refresh } = useSheetData(sheetName)

  const { categoryKey, numericKeys } = useMemo(() => detectColumns(rows), [rows])
  const primaryValueKey = numericKeys[0]

  const chartData = useMemo(() => {
    if (!primaryValueKey || !categoryKey) return []
    return buildChartData(rows, categoryKey, primaryValueKey)
  }, [rows, categoryKey, primaryValueKey])

  const tableColumns = useMemo(() => {
    if (!rows.length) return []
    const keys = Object.keys(rows[0])
    if (!categoryKey) return keys
    const rest = keys.filter((key) => key !== categoryKey)
    return [categoryKey, ...rest]
  }, [rows, categoryKey])

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Monitoring</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="max-w-3xl text-sm text-white/60">{description}</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200 shadow-lg">
          Terjadi gangguan ketika memuat data: {error.message}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <DataCard
          title="Status Data"
          value={loading ? 'Memuat…' : `${rows.length} baris`}
          description={
            updatedAt ? `Pembaruan terakhir ${updatedAt.toLocaleString('id-ID')}.` : 'Menunggu respons Google Sheet.'
          }
        />
        <DataCard
          title="Kolom Utama"
          value={primaryValueKey ?? 'Tidak tersedia'}
          description="Kolom numerik pertama digunakan sebagai indikator utama pada grafik."
          accent="from-secondary via-purple-500 to-primary"
        />
        <DataCard
          title="Ketersediaan Data"
          value={error ? 'Gangguan' : 'Normal'}
          description={error ? error.message : 'Endpoint Google Sheet dapat dijangkau.'}
          accent="from-emerald-400 to-secondary"
        />
      </div>

      <ChartCard
        title={`Tren ${primaryValueKey ?? 'Data'}`}
        subtitle={
          primaryValueKey
            ? `Visualisasi bar berdasarkan kolom ${primaryValueKey} terhadap ${categoryKey}.`
            : 'Tidak ada kolom numerik yang dapat divisualisasikan.'
        }
        actions={
          <button
            type="button"
            onClick={refresh}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Muat Ulang
          </button>
        }
      >
        {primaryValueKey ? (
          <div className="h-96 min-w-[32rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                <Bar dataKey="value" fill="#a21caf" radius={[12, 12, 0, 0]}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fill: '#fff', fontSize: 12, textShadow: '0 1px 6px rgba(15, 23, 42, 0.6)' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-white/60">Silakan lengkapi data numerik pada sheet untuk melihat grafik.</p>
        )}
      </ChartCard>

      <ChartCard title="Tabel Data Lengkap" subtitle="Seluruh baris data ditampilkan dalam tabel di bawah ini.">
        <DataTable columns={tableColumns} rows={rows} />
      </ChartCard>
    </div>
  )
}
