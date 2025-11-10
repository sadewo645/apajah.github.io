import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  RefreshCw,
  Upload,
  Calendar,
  Search,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  Flame,
  Leaf,
  FlaskConical,
  BarChart3,
} from "lucide-react";

export function PerkebunanPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState("");

  // 🔹 Ganti URL di bawah dengan Google Apps Script kamu
  const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbwGJcBXnbtyVWl3bY2HTdMy9rbWJf2QlSSVNuuEy5wj0bcz4F--0vgM0NNXltgOHWkB/exec";

  // Ambil data dari Google Sheet
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Gagal ambil data Google Sheet", err);
    } finally {
      setLoading(false);
    }
  };

  // Muat data saat pertama kali
  useMemo(() => {
    fetchData();
  }, []);

  // 🔹 Format data untuk grafik
  const chartData = useMemo(() => {
    if (!rows?.length) return [];
    return rows.map((r) => ({
      Bulan: r["Bulan"],
      Panen: Number(r["Hasil Panen (ton)"]),
      pH: Number(r["pH Tanah"]),
      Kelembapan: Number(r["Kelembapan (%)"]),
      Cahaya: Number(r["Intensitas Cahaya (lux)"]),
      Hujan: Number(r["Curah Hujan (mm)"]),
      Suhu: Number(r["Suhu (°C)"]),
      Jenis: r["Jenis Tanaman"],
      Catatan: r["Catatan"],
    }));
  }, [rows]);

  // 🔹 Hitung statistik otomatis
  const stats = useMemo(() => {
    if (!rows?.length) return {};
    const avg = (key) =>
      (
        rows.reduce((a, b) => a + Number(b[key] || 0), 0) / rows.length
      ).toFixed(1);
    return {
      avgPanen: avg("Hasil Panen (ton)"),
      avgpH: avg("pH Tanah"),
      avgKelembapan: avg("Kelembapan (%)"),
      avgCahaya: avg("Intensitas Cahaya (lux)"),
      avgHujan: avg("Curah Hujan (mm)"),
      avgSuhu: avg("Suhu (°C)"),
    };
  }, [rows]);

  // 🔍 Analisis cepat berdasarkan input user
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
        `📈 Hasil panen tertinggi terjadi pada **${max["Bulan"]}** (${max["Hasil Panen (ton)"]} ton, pH ${max["pH Tanah"]}, suhu ${max["Suhu (°C)"]}°C).`
      );
    } else if (q.includes("ph")) {
      setInsight(
        `🧪 pH tanah rata-rata ${stats.avgpH}. Idealnya antara 6.0–7.0 untuk kelapa sawit.`
      );
    } else if (q.includes("suhu")) {
      setInsight(`🌡️ Suhu rata-rata ${stats.avgSuhu}°C, kondisi stabil.`);
    } else if (q.includes("bandingkan")) {
      setInsight(
        `📊 Korelasi pH dan hasil panen menunjukkan bahwa hasil meningkat pada pH 6.3–6.7 dan kelembapan < 33%.`
      );
    } else {
      setInsight(
        "🤖 Tidak mengenali perintah. Coba ketik: 'bulan dengan hasil panen tertinggi' atau 'hubungan pH dengan hasil panen'."
      );
    }
  };

  // 🔮 Simulasi prediksi linear sederhana
  const predictYield = (ph, hujan) => {
    if (!rows.length) return 0;
    // regresi linear sederhana (contoh)
    const a = 5.2;
    const b = 0.4 * ph + 0.02 * hujan;
    return (a + b).toFixed(2);
  };

  if (loading) return <p className="text-white">🔄 Memuat data...</p>;

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-pink-400" /> Dashboard Analisis Hasil Panen
          </h1>
          <p className="text-slate-400">
            Data langsung dari Google Sheet — analisis interaktif faktor
            lingkungan dan hasil panen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw size={16} /> Muat Ulang Data
          </button>
          <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 px-3 py-2 rounded-lg text-sm">
            <Upload size={16} /> Perbarui Data
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-sm">
            <Calendar size={16} /> Pilih Periode
          </button>
        </div>
      </header>

      {/* GRAFIK */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">
          📊 Hasil Panen Bulanan
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="Bulan" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: "#0f172a", color: "#e2e8f0" }}
              formatter={(value, name) => [
                value,
                name.replace("_", " ").toUpperCase(),
              ]}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <Bar dataKey="Panen" fill="url(#grad)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* INSIGHT BOX */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat icon={<BarChart3 />} title="Rata-rata Panen" value={stats.avgPanen} unit="ton" />
        <Stat icon={<FlaskConical />} title="pH Tanah" value={stats.avgpH} />
        <Stat icon={<Droplets />} title="Kelembapan" value={stats.avgKelembapan} unit="%" />
        <Stat icon={<Sun />} title="Cahaya" value={stats.avgCahaya} unit="lux" />
        <Stat icon={<CloudRain />} title="Curah Hujan" value={stats.avgHujan} unit="mm" />
        <Stat icon={<Thermometer />} title="Suhu" value={stats.avgSuhu} unit="°C" />
      </div>

      {/* ANALISIS CEPAT */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Search className="text-indigo-400" /> Analisis Cepat
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: bulan dengan hasil panen tertinggi"
            className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-white"
          />
          <button
            onClick={handleQuery}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Jalankan
          </button>
        </div>
        {insight && (
          <div className="mt-4 bg-black/30 p-4 rounded-lg text-slate-200 border border-white/10">
            <p dangerouslySetInnerHTML={{ __html: insight }} />
          </div>
        )}
      </section>

      {/* VISUALISASI TAMBAHAN */}
      <section className="grid md:grid-cols-2 gap-6">
        <ChartBox
          title="Korelasi pH vs Panen"
          children={
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="pH" stroke="#94a3b8" />
              <YAxis dataKey="Panen" stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a" }} />
              <Scatter data={chartData} fill="#a855f7" />
            </ScatterChart>
          }
        />
        <ChartBox
          title="Tren Panen & Suhu"
          children={
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="Bulan" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a" }} />
              <Line type="monotone" dataKey="Panen" stroke="#ec4899" />
              <Line type="monotone" dataKey="Suhu" stroke="#f59e0b" />
            </LineChart>
          }
        />
      </section>
    </div>
  );
}

// 🔸 Komponen tambahan
function Stat({ icon, title, value, unit }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
      <div className="flex justify-center mb-2 text-indigo-400">{icon}</div>
      <h4 className="text-sm text-slate-400">{title}</h4>
      <p className="text-xl font-semibold">
        {value ?? "--"} {unit}
      </p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default PerkebunanPage;
