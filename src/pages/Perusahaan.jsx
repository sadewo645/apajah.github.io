import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  RefreshCw,
  Search,
  Brain,
  TrendingUp,
  FlaskConical,
  Thermometer,
  Gauge,
  Droplets,
  Upload,
} from "lucide-react";

// Ganti URL dengan Google Apps Script kamu
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwGJcBXnbtyVWl3bY2HTdMy9rbWJf2QlSSVNuuEy5wj0bcz4F--0vgM0NNXltgOHWkB/exec";
const SHEET_NAME = "Perusahaan";

export function PerusahaanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [prediksi, setPrediksi] = useState(null);
  const [tahunPrediksi, setTahunPrediksi] = useState("2026");

  // 🔹 Ambil data dari Google Sheet
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SHEET_URL}?sheet=${SHEET_NAME}`);
      const json = await res.json();
      setData(
        json.map((r) => ({
          bulan: r["Bulan"],
          tahun: Number(r["Tahun"]),
          produksi: Number(r["Produksi CPO (ton)"]),
          ffa: Number(r["FFA (%)"]),
          dobi: Number(r["DOBI"]),
          kadarAir: Number(r["Kadar Air (%)"]),
          pv: Number(r["PV"]),
          suhu: Number(r["Suhu Proses (°C)"]),
          tekanan: Number(r["Tekanan (Bar)"]),
          catatan: r["Catatan"],
        }))
      );
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Analisis otomatis
  const stats = useMemo(() => {
    if (!data.length) return null;
    const avg = (key) =>
      (data.reduce((a, b) => a + Number(b[key] || 0), 0) / data.length).toFixed(2);
    const maxProd = data.reduce(
      (p, c) => (c.produksi > p.produksi ? c : p),
      data[0]
    );
    const kualitas = data.map((r) => ({
      ...r,
      skor: ((r.dobi / r.ffa) * (1 / (1 + r.pv))).toFixed(2),
    }));
    return {
      rataProduksi: avg("produksi"),
      rataFFA: avg("ffa"),
      rataDOBI: avg("dobi"),
      rataAir: avg("kadarAir"),
      rataPV: avg("pv"),
      maxProd,
      kualitas,
    };
  }, [data]);

  // 🔹 Insight otomatis
  useEffect(() => {
    if (!stats) return;
    setInsight(
      `📊 Produksi tertinggi terjadi pada **${stats.maxProd.bulan} ${stats.maxProd.tahun}** (${stats.maxProd.produksi} ton).
      FFA rata-rata ${stats.rataFFA}% dan DOBI ${stats.rataDOBI}. 
      ${stats.rataFFA < 3 ? "Kualitas CPO sangat baik." : "FFA agak tinggi, perlu pengaturan suhu & tekanan."}`
    );
  }, [stats]);

  // 🔮 Prediksi produksi tahun berikutnya (regresi linear sederhana)
  const predictNextYear = () => {
    if (!data.length) return;
    const n = data.length;
    const sumX = data.reduce((a, b, i) => a + i, 0);
    const sumY = data.reduce((a, b) => a + b.produksi, 0);
    const sumXY = data.reduce((a, b, i) => a + i * b.produksi, 0);
    const sumX2 = data.reduce((a, b, i) => a + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const intercept = (sumY - slope * sumX) / n;
    const nextY = Math.round(intercept + slope * n);
    setPrediksi({
      tahun: tahunPrediksi,
      produksi: nextY,
      ffa: (stats.rataFFA * 0.95).toFixed(2),
      dobi: (stats.rataDOBI * 1.02).toFixed(2),
    });
  };

  if (loading) return <p className="text-white">🔄 Memuat data...</p>;

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="text-pink-400" /> Dashboard Analisis Produksi CPO
          </h1>
          <p className="text-slate-400">
            Analisis kualitas dan produktivitas minyak sawit mentah dari data Google Sheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw size={16} /> Muat Ulang
          </button>
          <button
            onClick={predictNextYear}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 px-3 py-2 rounded-lg text-sm"
          >
            <TrendingUp size={16} /> Prediksi Tahun Depan
          </button>
        </div>
      </header>

      {/* GRAFIK UTAMA */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Produksi CPO & Kualitas</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="bulan" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: "#0f172a", color: "#e2e8f0" }}
              formatter={(v, n) => [v, n.toUpperCase()]}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <Bar dataKey="produksi" fill="url(#grad)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey="bulan" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <Line type="monotone" dataKey="ffa" stroke="#22d3ee" strokeWidth={2} />
            <Line type="monotone" dataKey="dobi" stroke="#a855f7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ANALISIS OTOMATIS */}
      {insight && (
        <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-pink-400 mb-2">
            <Brain /> Analisis Otomatis
          </h3>
          <p className="text-slate-200 whitespace-pre-line">{insight}</p>
        </section>
      )}

      {/* TABEL DATA */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-4 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">📋 Data Produksi Lengkap</h3>
        <table className="min-w-full text-sm text-slate-300">
          <thead className="text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-2 py-1 text-left">Bulan</th>
              <th>Produksi (ton)</th>
              <th>FFA</th>
              <th>DOBI</th>
              <th>Kadar Air</th>
              <th>PV</th>
              <th>Suhu</th>
              <th>Tekanan</th>
              <th>Kualitas</th>
            </tr>
          </thead>
          <tbody>
            {stats?.kualitas.map((r, i) => {
              const kualitas =
                r.ffa < 3 && r.dobi > 4.3
                  ? "Baik"
                  : r.ffa < 3.5
                  ? "Moderat"
                  : "Rendah";
              const warna =
                kualitas === "Baik"
                  ? "text-green-400"
                  : kualitas === "Moderat"
                  ? "text-yellow-400"
                  : "text-red-400";
              return (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-2 py-1">{r.bulan}</td>
                  <td>{r.produksi}</td>
                  <td>{r.ffa}</td>
                  <td>{r.dobi}</td>
                  <td>{r.kadarAir}</td>
                  <td>{r.pv}</td>
                  <td>{r.suhu}</td>
                  <td>{r.tekanan}</td>
                  <td className={warna}>{kualitas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* FORM PREDIKSI */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="text-indigo-400" /> Prediksi Produksi Tahun Berikutnya
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            value={tahunPrediksi}
            onChange={(e) => setTahunPrediksi(e.target.value)}
            className="bg-black/40 border border-white/10 p-2 rounded-lg text-white flex-1"
            placeholder="Tahun berikutnya (misal 2026)"
          />
          <button
            onClick={predictNextYear}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Jalankan
          </button>
        </div>
        {prediksi && (
          <div className="mt-4 text-slate-200">
            <p>
              📈 Prediksi tahun {prediksi.tahun}: <b>{prediksi.produksi}</b> ton/bulan
            </p>
            <p>
              Estimasi FFA: {prediksi.ffa}%, DOBI: {prediksi.dobi}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default PerusahaanPage;
