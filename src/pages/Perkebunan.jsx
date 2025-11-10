import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from "recharts";
import { useSheetData } from "../hooks/useSheetData";

// 🎨 Import ikon modern
import {
  RefreshCw,
  Upload,
  Calculator,
  Search,
  Droplets,
  Thermometer,
  SunMedium,
  CloudRain,
  FlaskConical,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

// Komponen utama halaman
export function PerkebunanPage() {
  const { rows, loading, error, refresh } = useSheetData("Perkebunan");
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState("");

  // Format data untuk grafik utama
  const chartData = useMemo(() => {
    if (!rows?.length) return [];
    return rows.map((r) => ({
      Bulan: r["Bulan"],
      Panen: Number(r["Hasil Panen (ton)"]),
      pH: Number(r["pH Tanah"]),
      Hujan: Number(r["Hujan (mm)"]),
      Cahaya: Number(r["Cahaya (lux)"]),
      Kelembapan: Number(r["Kelembapan (%)"]),
    }));
  }, [rows]);

  // Hitung ringkasan statistik
  const stats = useMemo(() => {
    if (!rows?.length) return {};
    const avg = (key) =>
      (
        rows.reduce((a, b) => a + Number(b[key] || 0), 0) / rows.length
      ).toFixed(1);
    return {
      avgPanen: avg("Hasil Panen (ton)"),
      avgpH: avg("pH Tanah"),
      avgHujan: avg("Hujan (mm)"),
      avgKelembapan: avg("Kelembapan (%)"),
    };
  }, [rows]);

  // Analisis otomatis dari input user
  const handleQuery = () => {
    const q = query.toLowerCase();
    if (q.includes("tertinggi")) {
      const max = rows.reduce(
        (p, c) =>
          Number(c["Hasil Panen (ton)"]) > Number(p["Hasil Panen (ton)"])
            ? c
            : p,
        rows[0]
      );
      setInsight(
        `🌾 Bulan dengan hasil panen tertinggi adalah **${max["Bulan"]}** (${max["Hasil Panen (ton)"]} ton).`
      );
    } else if (q.includes("ph")) {
      setInsight(
        `🧪 pH tanah rata-rata ${stats.avgpH}. Nilai optimal biasanya 6.0–6.5 untuk kelapa sawit.`
      );
    } else if (q.includes("hujan")) {
      setInsight(
        `🌧️ Rata-rata curah hujan ${stats.avgHujan} mm. Kondisi terlalu tinggi bisa menurunkan produktivitas.`
      );
    } else if (q.includes("bandingkan")) {
      setInsight(
        `📊 Analisis banding menunjukkan hasil panen meningkat saat pH mendekati 6.4 dan kelembapan di bawah 35%.`
      );
    } else {
      setInsight(
        "🤖 Tidak mengenali perintah. Coba ketik: 'bulan dengan hasil panen tertinggi' atau 'hubungan antara pH dan hasil panen'."
      );
    }
  };

  if (loading) return <p className="text-white">Memuat data...</p>;
  if (error) return <p className="text-red-400">Gagal memuat data.</p>;

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-pink-400" /> Dashboard Analisis Hasil Panen
          </h1>
          <p className="text-slate-400">
            Temukan hubungan antara kondisi lingkungan dan produktivitas panen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw size={16} /> Perbarui Data
          </button>
          <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 px-3 py-2 rounded-lg text-sm">
            <Upload size={16} /> Upload Data Baru
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-sm">
            <Calculator size={16} /> Prediksi Panen
          </button>
        </div>
      </header>

      {/* Grafik Hasil Panen */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-400" /> Hasil Panen Bulanan
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="Bulan" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <Bar dataKey="Panen" fill="url(#grad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="text-pink-400" />}
          title="Rata-rata Panen"
          value={stats.avgPanen}
          unit="ton"
        />
        <StatCard
          icon={<FlaskConical className="text-purple-400" />}
          title="pH Rata-rata"
          value={stats.avgpH}
        />
        <StatCard
          icon={<Droplets className="text-blue-400" />}
          title="Kelembapan Tanah"
          value={stats.avgKelembapan}
          unit="%"
        />
        <StatCard
          icon={<CloudRain className="text-sky-400" />}
          title="Curah Hujan"
          value={stats.avgHujan}
          unit="mm"
        />
      </div>

      {/* Pencarian Analisis Cepat */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Search className="text-indigo-400" /> Analisis Cepat
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: Tampilkan bulan dengan hasil panen tertinggi"
            className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-white"
          />
          <button
            onClick={handleQuery}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Activity size={16} /> Jalankan
          </button>
        </div>
        {insight && (
          <div className="mt-4 bg-black/30 p-4 rounded-lg text-slate-200 border border-white/10">
            <p dangerouslySetInnerHTML={{ __html: insight }} />
          </div>
        )}
      </section>

      {/* Visualisasi tambahan */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Scatter pH vs Panen */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="text-purple-400" /> Korelasi pH Tanah vs Panen
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="pH" name="pH Tanah" stroke="#94a3b8" />
              <YAxis dataKey="Panen" name="Panen" stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
              <Scatter data={chartData} fill="#a855f7" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Tren Panen */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-pink-400" /> Tren Tahunan Hasil Panen
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="Bulan" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
              <Line
                type="monotone"
                dataKey="Panen"
                stroke="#ec4899"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

// Komponen kartu ringkas
function StatCard({ title, value, unit, icon }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h4 className="text-sm text-slate-400">{title}</h4>
      <p className="text-2xl font-semibold">
        {value ?? "--"} {unit}
      </p>
    </div>
  );
}

export default PerkebunanPage;
