import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";
import {
  RefreshCw,
  Calendar,
  Upload,
  Search,
  Activity,
  AlertTriangle,
  Factory,
  Thermometer,
  FlaskConical,
  Droplets,
  CloudRain,
  Gauge,
} from "lucide-react";

// =============================================
// Konfigurasi
// =============================================
const SHEET_BASE_URL =
  "https://script.google.com/macros/s/AKfycbwGJcBXnbtyVWl3bY2HTdMy9rbWJf2QlSSVNuuEy5wj0bcz4F--0vgM0NNXltgOHWkB/exec";
const SHEET_NAME = "Pabrik"; // nama sheet di Google Sheet

// Ambang batas (contoh — silakan sesuaikan dengan standar PKS-mu)
const LIMITS = {
  COD: 100, // mg/L
  BOD: 60,  // mg/L
  TSS: 100, // mg/L
  pH: { min: 6.0, max: 7.5 },
  SUHU: { max: 90 }, // °C
};

// Station list fallback (untuk filter dropdown)
const COMMON_STATIONS = [
  "Jembatan Timbangan",
  "Loading Ramp",
  "Sterilizer",
  "Press",
  "Clarification",
  "Kernel",
];

export function PabrikPage() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState("");
  const [alerts, setAlerts] = useState([]);

  // Filter
  const [station, setStation] = useState("Semua Stasiun");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ========================================================
  // Ambil data dari Google Sheet (Apps Script → JSON)
  // ========================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const url = `${SHEET_BASE_URL}?sheet=${encodeURIComponent(SHEET_NAME)}`;
      const res = await fetch(url);
      const json = await res.json();

      // Normalisasi kolom agar konsisten
      const normalized = (json || []).map((r) => ({
        tanggal: r["Tanggal"] ?? r["tanggal"] ?? "",
        stasiun: r["Stasiun"] ?? r["stasiun"] ?? "",
        status: r["Status"] ?? r["status"] ?? "",
        COD: num(r["COD (mg/L)"] ?? r["COD"]),
        BOD: num(r["BOD (mg/L)"] ?? r["BOD"]),
        TSS: num(r["TSS (mg/L)"] ?? r["TSS"]),
        pH: num(r["pH"] ?? r["PH"]),
        suhu: num(r["Suhu (°C)"] ?? r["Suhu"] ?? r["suhu"]),
        debit: num(r["Debit (m³/jam)"] ?? r["Debit"]),
        CPO: num(r["CPO Yield (%)"] ?? r["CPO_yield"]),
        Kernel: num(r["Kernel Yield (%)"] ?? r["Kernel_yield"]),
        CST: num(r["Ketinggian CPO CST (cm)"] ?? r["CST"]),
        catatan: r["Catatan"] ?? r["catatan"] ?? "",
      }));
      setRaw(normalized);
    } catch (e) {
      console.error("Gagal mengambil data Pabrik:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // ========================================================
  // Data terfilter (berdasarkan stasiun dan rentang tanggal)
  // ========================================================
  const data = useMemo(() => {
    let d = [...raw];
    if (station && station !== "Semua Stasiun") {
      d = d.filter((r) => r.stasiun === station);
    }
    if (dateFrom) {
      d = d.filter((r) => !r.tanggal || r.tanggal >= dateFrom);
    }
    if (dateTo) {
      d = d.filter((r) => !r.tanggal || r.tanggal <= dateTo);
    }
    return d;
  }, [raw, station, dateFrom, dateTo]);

  // List stasiun untuk dropdown
  const stationOptions = useMemo(() => {
    const unique = Array.from(new Set(raw.map((r) => r.stasiun))).filter(Boolean);
    return ["Semua Stasiun", ...(unique.length ? unique : COMMON_STATIONS)];
  }, [raw]);

  // ========================================================
  // Dataset grafik
  // ========================================================
  // Tren COD per stasiun (ambil nilai rata-rata terbaru per stasiun)
  const codByStation = useMemo(() => {
    const map = new Map();
    data.forEach((r) => {
      const key = r.stasiun || "Tidak Diketahui";
      if (!map.has(key)) map.set(key, { stasiun: key, CODs: [], BODs: [], pHs: [], suhux: [] });
      map.get(key).CODs.push(r.COD);
      map.get(key).BODs.push(r.BOD);
      map.get(key).pHs.push(r.pH);
      map.get(key).suhux.push(r.suhu);
    });
    return Array.from(map.values()).map((v) => ({
      stasiun: v.stasiun,
      COD: avg(v.CODs),
      BOD: avg(v.BODs),
      pH: avg(v.pHs),
      suhu: avg(v.suhux),
      statusColor:
        avg(v.CODs) > LIMITS.COD ? "#ef4444" /* merah */ : "#10b981" /* hijau */,
    }));
  }, [data]);

  // Line: BOD & TSS terhadap waktu (urutkan tanggal)
  const bodTssDaily = useMemo(() => {
    const sorted = [...data].sort((a, b) => (a.tanggal > b.tanggal ? 1 : -1));
    return sorted.map((r) => ({
      tanggal: r.tanggal,
      BOD: r.BOD,
      TSS: r.TSS,
    }));
  }, [data]);

  // Area: pH & suhu harian
  const phSuhuDaily = useMemo(() => {
    const sorted = [...data].sort((a, b) => (a.tanggal > b.tanggal ? 1 : -1));
    return sorted.map((r) => ({
      tanggal: r.tanggal,
      pH: r.pH,
      suhu: r.suhu,
    }));
  }, [data]);

  // Dual axis: efisiensi CPO & Kernel
  const efficiencyDaily = useMemo(() => {
    const sorted = [...data].sort((a, b) => (a.tanggal > b.tanggal ? 1 : -1));
    return sorted.map((r) => ({
      tanggal: r.tanggal,
      CPO: r.CPO,
      Kernel: r.Kernel,
    }));
  }, [data]);

  // Scatter: CST vs Debit
  const cstVsDebit = useMemo(
    () => data.filter((r) => r.CST || r.debit).map((r) => ({ CST: r.CST, debit: r.debit })),
    [data]
  );

  // ========================================================
  // Insight otomatis & alert
  // ========================================================
  const stats = useMemo(() => {
    if (!data.length) return null;
    const codMax = data.reduce((p, c) => (c.COD > p.COD ? c : p), data[0]);
    const overloadPct =
      (data.filter((d) => (d.status || "").toLowerCase().includes("over")).length /
        data.length) *
      100;

    return {
      codTertinggi: codMax,
      avgCOD: avg(data.map((d) => d.COD)),
      avgBOD: avg(data.map((d) => d.BOD)),
      avgTSS: avg(data.map((d) => d.TSS)),
      avgPH: avg(data.map((d) => d.pH)),
      avgSuhu: avg(data.map((d) => d.suhu)),
      overloadPct: Number.isFinite(overloadPct) ? overloadPct.toFixed(1) : 0,
    };
  }, [data]);

  useEffect(() => {
    const a = [];
    data.forEach((r) => {
      if (r.COD > LIMITS.COD) {
        a.push(`⚠️ ${r.stasiun} melebihi ambang COD (${r.COD} mg/L).`);
      }
      if (r.BOD > LIMITS.BOD) {
        a.push(`⚠️ ${r.stasiun} BOD tinggi (${r.BOD} mg/L).`);
      }
      if (r.TSS > LIMITS.TSS) {
        a.push(`⚠️ ${r.stasiun} TSS tinggi (${r.TSS} mg/L).`);
      }
      if (r.pH && (r.pH < LIMITS.pH.min || r.pH > LIMITS.pH.max)) {
        a.push(`⚠️ pH di ${r.stasiun} di luar rentang ideal (${r.pH}).`);
      }
      if (r.suhu > LIMITS.SUHU.max) {
        a.push(`⚠️ Suhu tinggi di ${r.stasiun} (${r.suhu}°C).`);
      }
    });
    setAlerts(a.slice(0, 6)); // batasi agar tidak kebanyakan
  }, [data]);

  // ========================================================
  // Pencarian NLP sederhana
  // ========================================================
  const onQuery = () => {
    const q = query.toLowerCase();
    if (q.includes("cod tertinggi")) {
      if (stats?.codTertinggi) {
        setInsight(
          `📈 COD tertinggi: **${stats.codTertinggi.COD} mg/L** di **${stats.codTertinggi.stasiun}** pada **${stats.codTertinggi.tanggal}**.`
        );
      }
      return;
    }
    if (q.includes("efisiensi") && (q.includes("press") || q.includes("clarification"))) {
      const press = data.filter((d) => d.stasiun.toLowerCase().includes("press"));
      const clar = data.filter((d) => d.stasiun.toLowerCase().includes("clarification"));
      const avgPress = avg(press.map((d) => d.CPO));
      const avgClar = avg(clar.map((d) => d.CPO));
      setInsight(
        `⚙️ Rata-rata efisiensi CPO — Press: **${avgPress}%**, Clarification: **${avgClar}%**.`
      );
      return;
    }
    if (q.includes("bod") && (q.includes("januari") || q.includes("january"))) {
      const jan = data.filter((d) => (d.tanggal || "").slice(5, 7) === "01");
      setInsight(`🧪 Rata-rata BOD Januari: **${avg(jan.map((x) => x.BOD))} mg/L**.`);
      return;
    }
    setInsight(
      "🤖 Tidak mengenali perintah. Contoh: 'Cari stasiun dengan COD tertinggi minggu ini', 'Bandingkan efisiensi CPO Press dan Clarification', 'Tampilkan nilai BOD bulan Januari'."
    );
  };

  if (loading) {
    return <p className="text-slate-200">🔄 Memuat data pabrik…</p>;
  }

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="text-pink-400" />
            Dashboard Analisis Pabrik Kelapa Sawit
          </h1>
          <p className="text-slate-400">
            Monitoring kualitas proses, efisiensi produksi, dan kondisi limbah dari Google Sheet
            secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw size={16} /> Muat Ulang Data
          </button>
          <label className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-lg text-sm cursor-pointer">
            <Upload size={16} />
            Tambah Data
            <input type="file" className="hidden" />
          </label>
          <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 px-3 py-2 rounded-lg text-sm">
            <Calendar size={16} /> Filter Tanggal
          </button>
        </div>
      </header>

      {/* FILTERS */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 grid gap-3 md:grid-cols-4">
        <div className="flex flex-col">
          <label className="text-xs text-slate-400 mb-1">Stasiun</label>
          <select
            className="bg-black/40 border border-white/10 rounded-lg p-2"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          >
            {stationOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-400 mb-1">Dari tanggal</label>
          <input
            type="date"
            className="bg-black/40 border border-white/10 rounded-lg p-2"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-400 mb-1">Sampai tanggal</label>
          <input
            type="date"
            className="bg-black/40 border border-white/10 rounded-lg p-2"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-400 mb-1">Cari (Natural Language)</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2"
              placeholder="mis. COD tertinggi minggu ini"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={onQuery}
              className="bg-indigo-500 hover:bg-indigo-600 px-3 rounded-lg flex items-center"
              title="Jalankan"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      {!!alerts.length && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-300">
            <AlertTriangle /> Peringatan Otomatis
          </div>
          <ul className="list-disc list-inside text-red-200 text-sm">
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-6">
          <Stat icon={<FlaskConical />} title="COD Rata-rata" value={stats.avgCOD} unit="mg/L" />
          <Stat icon={<Droplets />} title="BOD Rata-rata" value={stats.avgBOD} unit="mg/L" />
          <Stat icon={<Activity />} title="TSS Rata-rata" value={stats.avgTSS} unit="mg/L" />
          <Stat icon={<Gauge />} title="pH Rata-rata" value={stats.avgPH} />
          <Stat icon={<Thermometer />} title="Suhu Rata-rata" value={stats.avgSuhu} unit="°C" />
          <Stat icon={<AlertTriangle />} title="Overload" value={stats.overloadPct} unit="%" />
        </div>
      )}

      {/* GRAFIK UTAMA: COD per Stasiun */}
      <ChartBox title="Tren COD (mg/L) per Stasiun">
        <BarChart data={codByStation}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="stasiun" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
          <Bar dataKey="COD">
            {codByStation.map((e, i) => (
              <cell key={`c-${i}`} fill={e.statusColor} />
            ))}
          </Bar>
        </BarChart>
      </ChartBox>

      {/* GRAFIK PENDUKUNG */}
      <section className="grid gap-6 md:grid-cols-2">
        <ChartBox title="Tren BOD & TSS (harian)">
          <LineChart data={bodTssDaily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tanggal" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <Legend />
            <Line type="monotone" dataKey="BOD" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="TSS" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ChartBox>

        <ChartBox title="pH & Suhu Proses (harian)">
          <AreaChart data={phSuhuDaily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tanggal" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <Legend />
            <defs>
              <linearGradient id="gradPh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="gradSuhu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="pH" stroke="#60a5fa" fill="url(#gradPh)" />
            <Area type="monotone" dataKey="suhu" stroke="#fb7185" fill="url(#gradSuhu)" />
          </AreaChart>
        </ChartBox>

        <ChartBox title="Efisiensi Produksi (CPO vs Kernel)">
          <LineChart data={efficiencyDaily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tanggal" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <Legend />
            <Line type="monotone" dataKey="CPO" stroke="#a855f7" strokeWidth={2} />
            <Line type="monotone" dataKey="Kernel" stroke="#22d3ee" strokeWidth={2} />
          </LineChart>
        </ChartBox>

        <ChartBox title="Ketinggian CST vs Debit Limbah">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="CST" name="CST" unit=" cm" stroke="#94a3b8" />
            <YAxis dataKey="debit" name="Debit" unit=" m³/j" stroke="#94a3b8" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0f172a", color: "#e2e8f0" }} />
            <Scatter data={cstVsDebit} fill="#f43f5e" />
          </ScatterChart>
        </ChartBox>
      </section>

      {/* INSIGHT OTOMATIS */}
      {stats && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
          <h3 className="text-lg font-semibold mb-2">🧠 Insight Otomatis</h3>
          <p className="text-slate-200">
            COD tertinggi tercatat di <b>{stats.codTertinggi?.stasiun ?? "-"}</b> sebesar{" "}
            <b>{stats.codTertinggi?.COD ?? "-"}</b> mg/L. pH rata-rata {stats.avgPH}, suhu rata-rata {stats.avgSuhu}°C.
            {stats.avgCOD > LIMITS.COD
              ? " Perlu perhatian pada sistem klarifikasi agar COD turun di bawah ambang."
              : " Nilai COD rata-rata masih dalam batas aman."}
          </p>
        </section>
      )}

      {/* HASIL PENCARIAN / NLP */}
      {insight && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-slate-300 mb-1 flex items-center gap-2">
            <Search size={16} /> Hasil Analisis
          </h4>
          <div className="text-slate-100" dangerouslySetInnerHTML={{ __html: insight }} />
        </section>
      )}
    </div>
  );
}

// =============================================
// Komponen kecil
// =============================================
function ChartBox({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function Stat({ icon, title, value, unit }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
      <div className="flex justify-center mb-2 text-indigo-400">{icon}</div>
      <h4 className="text-xs text-slate-400">{title}</h4>
      <p className="text-xl font-semibold">
        {isFinite(value) ? value : "--"} {unit}
      </p>
    </div>
  );
}

// =============================================
// Util kecil
// =============================================
function num(x) {
  const n = Number(String(x ?? "").toString().replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function avg(arr) {
  const v = (arr || []).filter((x) => Number.isFinite(x));
  if (!v.length) return 0;
  return Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(1));
}

export default PabrikPage;
