// src/pages/Panduan.jsx
import { useEffect, useMemo, useState } from 'react'

/** ---------- Ikon kecil (tanpa dependency) ---------- */
const Chevron = ({ open }) => (
  <svg
    className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M6.293 7.293a1 1 0 011.414 0L12 11.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)

/** ---------- Komponen Accordion generik ---------- */
function Accordion({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="rounded-2xl bg-white/5 ring-1 ring-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-300/70">{subtitle}</p>}
        </div>
        <div className="text-slate-300">
          <Chevron open={open} />
        </div>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 px-5 pb-5">{children}</div>
      </div>
    </section>
  )
}

function SubAccordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <div className="text-slate-300">
          <Chevron open={open} />
        </div>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 px-4 pb-4">{children}</div>
      </div>
    </div>
  )
}

/** ---------- Halaman Panduan (Upkeep TM) ---------- */
export function PanduanPage() {
  // dummy progress kecil di header (biar hidup)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const sTop = window.scrollY
      const sHeight = document.body.scrollHeight - window.innerHeight
      const p = sHeight > 0 ? Math.min(100, Math.round((sTop / sHeight) * 100)) : 0
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // tombol back-to-top
  const showBackTop = progress > 12

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-2xl bg-gradient-to-r from-[#7b2ff7]/20 to-[#f107a3]/20 p-6 ring-1 ring-white/10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Panduan</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Upkeep TM (Tanaman Menghasilkan)</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Materi lengkap pemeliharaan kebun kelapa sawit pada fase menghasilkan — disusun per modul dan
          submodul. Buka setiap bagian untuk mempelajari ringkasan praktik terbaik dan catatan lapangan.
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>Progress Baca</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#a21caf] to-[#2563eb] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Struktur: Modul -> Submodul (Accordion bersarang) */}
      <div className="grid gap-5">
        {/* 1. TM Generatif */}
        <Accordion
          title="TM Generatif"
          subtitle="Karakteristik fase menghasilkan: pembungaan, pembentukan buah, target BJR & produktivitas."
          defaultOpen
        >
          <div className="grid gap-3">
            <SubAccordion title="BJR Optimum (Berat Janjang Rata-rata)">
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>BJR optimum menunjang rendemen CPO dan kestabilan output TBS.</li>
                <li>Jaga kepadatan pelepah nutrisi &amp; suplai hara untuk pembesaran buah.</li>
                <li>Monitoring rutin per blok untuk melihat tren BJR dan anomali.</li>
              </ul>
            </SubAccordion>

            <SubAccordion title="TM Muda, Remaja, Tua (Songgo)">
              <p className="text-sm text-white/80">
                Pembagian umur produktif memengaruhi strategi panen, frekuensi pemupukan, dan prioritas perawatan
                (mis. songgo 1–3). TM muda fokus pertumbuhan tajuk &amp; stabilisasi produksi; TM tua ditekankan
                pada peremajaan tajuk &amp; efisiensi panen.
              </p>
            </SubAccordion>

            <SubAccordion title="Yield (CPO & Kernel)">
              <p className="text-sm text-white/80">
                Yield dipengaruhi BJR, kadar minyak, dan kehilangan proses. Jaga kualitas buah, kurangi restan,
                dan sinkronkan jadwal angkut–olah untuk meminimalkan FFA naik.
              </p>
            </SubAccordion>
          </div>
        </Accordion>

        {/* 2. Pemupukan TM */}
        <Accordion
          title="Pemupukan TM"
          subtitle="Optimasi hara lewat prinsip 4T, koreksi defisiensi, dan penataan penguntilan."
        >
          <div className="grid gap-3">
            <SubAccordion title="Defisiensi Hara (gejala & tindakan)">
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>Identifikasi visual: klorosis, bercak, nekrosis tepi, pertumbuhan kerdil.</li>
                <li>Konfirmasi dengan analisis daun &amp; tanah.</li>
                <li>Penanganan: dosis koreksi + pemupukan berimbang, perbaikan drainase jika perlu.</li>
              </ul>
            </SubAccordion>

            <SubAccordion title="Penguntilan (penataan pupuk)">
              <p className="text-sm text-white/80">
                Penguntilan memastikan distribusi pupuk merata di zona serapan akar. Hindari tumpukan terlalu
                dekat batang, perhatikan kontur &amp; aliran air untuk mencegah hanyut.
              </p>
            </SubAccordion>

            <SubAccordion title="Prinsip 4T (Tepat Jenis, Dosis, Waktu, Cara)">
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>Tepat jenis: formula sesuai hasil analisis.</li>
                <li>Tepat dosis: ikuti rekomendasi blok; hindari over/under.</li>
                <li>Tepat waktu: musim &amp; ketersediaan air.</li>
                <li>Tepat cara: sebar merata, jangan menutup kuncup akar.</li>
              </ul>
            </SubAccordion>
          </div>
        </Accordion>

        {/* 3. Pengendalian Gulma */}
        <Accordion
          title="Pengendalian Gulma"
          subtitle="Menekan kompetisi hara & air; kombinasi kultur teknis, mekanis, & kimia."
        >
          <p className="text-sm text-white/80">
            Fokus pada area piringan, jalan panen, dan gawangan. Gunakan metode terpadu: mulsa, tanaman penutup
            tanah bermanfaat, pengendalian mekanis terjadwal, dan herbisida selektif bila diperlukan.
          </p>
        </Accordion>

        {/* 4. Pengendalian HP & Gulma (detail alat & praktik) */}
        <Accordion
          title="Pengendalian Hama Penyakit (HP) & Praktik Lapangan"
          subtitle="Dari identifikasi, alat & kalibrasi, hingga PHT & wiping."
        >
          <div className="grid gap-3">
            <SubAccordion title="Dongkel Anak Kayu (DAK)">
              <p className="text-sm text-white/80">
                DAK dilakukan untuk menekan kompetisi dan sarang hama pada semak berkayu. Pastikan akar tercabut
                maksimal &amp; ditumpuk di tempat aman.
              </p>
            </SubAccordion>

            <SubAccordion title="Jenis Pestisida (sistemik & kontak)">
              <p className="text-sm text-white/80">
                Pilih formulasi sesuai target organisme &amp; fase hidupnya. Rotasi bahan aktif untuk mencegah
                resistensi, dan patuhi K3 saat aplikasi.
              </p>
            </SubAccordion>

            <SubAccordion title="Jenis Alat Semprot & Nozzle">
              <p className="text-sm text-white/80">
                Gunakan nozzle yang sesuai (cone/flat) untuk distribusi tetes optimal. Jaga kebersihan filter
                &amp; selang agar laju semprot stabil.
              </p>
            </SubAccordion>

            <SubAccordion title="Kalibrasi Alat Semprot">
              <p className="text-sm text-white/80">
                Kalibrasi memastikan dosis lapangan sesuai rekomendasi. Ukur debit, langkah operator, dan lebar
                semprot untuk mendapatkan L/ha akurat.
              </p>
            </SubAccordion>

            <SubAccordion title="PHT (Pengendalian Hama Terpadu) & Wiping">
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>PHT: monitoring → ambang kendali → tindakan selektif → evaluasi.</li>
                <li>
                  Wiping: aplikasi kontak langsung pada gulma sasaran untuk mengurangi off-target dan menekan biaya.
                </li>
              </ul>
            </SubAccordion>
          </div>
        </Accordion>

        {/* 5. Pruning Pelepah */}
        <Accordion title="Pruning Pelepah" subtitle="Menjaga akses panen & kesehatan tajuk.">
          <p className="text-sm text-white/80">
            Pruning pelepah tua/kering untuk memperlancar panen, mengurangi sarang hama, dan memperbaiki distribusi
            fotosintat. Hindari over-pruning agar kapasitas tajuk tetap memadai.
          </p>
        </Accordion>

        {/* 6. Water Management (WM) */}
        <Accordion title="Water Management (Pengelolaan Air)" subtitle="Drainase, konservasi, & keseimbangan air tanah.">
          <p className="text-sm text-white/80">
            Susun jaringan drainase &amp; saluran kontrol untuk menghindari genangan berkepanjangan. Terapkan
            konservasi air di musim kering (check dam, rorak), serta pemeliharaan berkala saluran.
          </p>
        </Accordion>

        {/* 7. Panen */}
        <Accordion title="Panen" subtitle="Panen TBS matang optimal & manajemen angkut–olah.">
          <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>Standar matang: fraksi brondolan/tangkai sesuai ketentuan kebun.</li>
            <li>Minimalkan restan; sinkronkan ritase angkut dengan jadwal olah pabrik.</li>
            <li>QC lapangan untuk menjaga mutu &amp; menekan FFA.</li>
          </ul>
        </Accordion>
      </div>

      {/* Catatan integrasi */}
      <section className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h3 className="text-base font-semibold text-white">Catatan Integrasi Materi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>
            Konten di atas diringkas dari berkas-berkas materi (Panen, Pemupukan TM, Defisiensi Hara, Penguntilan,
            Prinsip 4T, Pengendalian Gulma, Pengendalian HP &amp; Gulma: Dongkel, Jenis Pestisida, Jenis Alat,
            Kalibrasi, PHT, Wiping, Pruning, TM Generatif: BJR, TM/Remaja/Tua, Yield, Water Management).
          </li>
          <li>
            Jika kamu ingin menampilkan naskah panjang apa adanya, kita bisa pecah per submodul menjadi halaman
            terpisah dengan router, lalu tautkan dari sini.
          </li>
        </ul>
      </section>

      {/* Back to top */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 rounded-full bg-gradient-to-r from-[#a21caf] to-[#2563eb] px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10"
        >
          Kembali ke Atas
        </button>
      )}
    </div>
  )
}

export default PanduanPage
