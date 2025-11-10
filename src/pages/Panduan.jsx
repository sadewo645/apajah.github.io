import { useMemo, useRef, useState } from 'react'

/**
 * Halaman Panduan — Upkeep TM (Single Page)
 * - Tema gelap, gaya dashboard
 * - Accordion per topik
 * - Viewer (iframe) untuk membuka HTML materi
 * - Progress belajar sederhana
 */

const CARD =
  'rounded-2xl bg-white/5 border border-white/10 shadow-lg shadow-black/20 backdrop-blur-sm'

const GRADIENT =
  'bg-gradient-to-r from-[#a21caf] via-[#6d28d9] to-[#2563eb]'

const modules = [
  {
    id: 'index',
    title: 'INDEX UTAMA Upkeep TM',
    items: [{ title: 'Index Utama', file: 'INDEX UTAMA Upkeep_TM_index.html' }],
  },
  {
    id: 'generatif',
    title: 'TM – Generatif & Tujuan Utama',
    items: [
      { title: 'TM Generatif (Ringkasan)', file: '6. Generatif_TM.html' },
      { title: 'BJR Optimum', file: '6a. bjr.html' },
      { title: 'TM (3 s.d 25/30 th)', file: '6b. tm.html' },
      { title: 'Yield (CPO/Kernel)', file: '6c. yiled.html' },
    ],
  },
  {
    id: 'pruning',
    title: 'Pruning (Pruning Pelepah)',
    items: [{ title: 'Panduan Pruning', file: '5. pruning.html' }],
  },
  {
    id: 'pemupukan',
    title: 'Pemupukan TM',
    items: [
      { title: 'Konsep & Praktik Pemupukan', file: '2. Pemupukan_tm.html' },
      { title: 'Defisiensi Hara', file: '2a. defisiensi_hara.html' },
      { title: 'Penguntilan', file: '2b. penguntilan.html' },
      { title: 'Prinsip 4T', file: '2c. Prinsip_4T.html' },
    ],
  },
  {
    id: 'gulma',
    title: 'Pengendalian Gulma (gawangan/piringan/jalan panen)',
    items: [{ title: 'Index Pengendalian Gulma', file: '3. pengendalian_gulma_index.html' }],
  },
  {
    id: 'hp_gulma',
    title: 'Pengendalian Hama Penyakit & Gulma (HPG)',
    items: [
      { title: 'Ringkasan HPG', file: '4. Pengendalian_hp_gulma.html' },
      { title: 'Dongkel Anak Kayu (DAK)', file: '4a. dongkel.html' },
      { title: 'Jenis Pestisida & Kontak/Sistemik', file: '4b. jenis_pestisida.html' },
      { title: 'Jenis Alat Semprot & Nozzle', file: '4c. jenisalat.html' },
      { title: 'Kalibrasi, Laju Semprot, Kecepatan Jalan', file: '4d. kalibrasi.html' },
      { title: 'PHT (Agensia Hayati, dsb.)', file: '4e. pht.html' },
      { title: 'Wiping', file: '4f. wiping.html' },
    ],
  },
  {
    id: 'wm',
    title: 'WM – Water Management (Pengelolaan Air)',
    items: [{ title: 'Pengelolaan Air', file: '7. WM.html' }],
  },
  {
    id: 'panen',
    title: 'Panen (TBS & Kematangan)',
    items: [{ title: 'Panduan Panen', file: '1. panen.html' }],
  },
]

// --- Komponen kecil ---

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`${CARD} overflow-hidden`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span
          className={`i-lucide-chevron-down text-white/80 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="border-t border-white/10 px-5 py-4">{children}</div>}
    </section>
  )
}

function ModuleList({ items, onOpen, current }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const active = current === it.file
        return (
          <li key={it.file}>
            <button
              onClick={() => onOpen(it.file)}
              className={`group ${CARD} w-full px-4 py-3 text-left transition hover:bg-white/[0.08] ${
                active ? 'ring-1 ring-primary/60 bg-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="i-lucide-book-open text-white/80" />
                <div>
                  <p className="text-sm font-medium text-white">{it.title}</p>
                  <p className="text-xs text-white/50">{it.file}</p>
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function IframeViewer({ file, onBack }) {
  const src = useMemo(() => (file ? `/upkeep/${encodeURI(file)}` : ''), [file])
  if (!file) return null

  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20"
          >
            ← Kembali ke daftar modul
          </button>
          <span className="text-white/60 text-xs">{file}</span>
        </div>
        <a
          className="rounded-lg bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20"
          href={src}
          target="_blank"
          rel="noreferrer"
        >
          Buka tab baru ↗
        </a>
      </div>
      <div className="h-[70vh] w-full">
        <iframe
          title={file}
          className="h-full w-full"
          src={src}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}

// --- Halaman utama ---

export function PanduanPage() {
  const [openedFile, setOpenedFile] = useState(null)
  const openedSetRef = useRef(new Set())

  const totalLeaf = useMemo(
    () => modules.reduce((acc, m) => acc + m.items.length, 0),
    []
  )
  const progress = useMemo(() => {
    const count = openedSetRef.current.size
    return Math.round((count / totalLeaf) * 100)
  }, [openedFile, totalLeaf])

  const handleOpen = (file) => {
    setOpenedFile(file)
    openedSetRef.current.add(file)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className={`${CARD} relative overflow-hidden`}>
        <div className={`absolute inset-0 -z-10 opacity-30 ${GRADIENT}`} />
        <div className="relative px-6 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Panduan Terintegrasi
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Panduan Upkeep TM (Tanaman Menghasilkan)
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            Semua materi Upkeep TM disatukan dalam satu halaman. Klik modul untuk membuka konten,
            pantau progres belajar, dan lanjutkan kapan saja.
          </p>

          {/* Progress */}
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full ${GRADIENT}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm font-semibold text-white">
              {progress}%
            </span>
          </div>
        </div>
      </header>

      {/* Viewer jika ada file dibuka */}
      {openedFile && (
        <IframeViewer
          file={openedFile}
          onBack={() => setOpenedFile(null)}
        />
      )}

      {/* Daftar modul */}
      <div className="grid gap-5">
        {modules.map((m, idx) => (
          <Section key={m.id} title={`${idx + 1}. ${m.title}`} defaultOpen={idx < 2}>
            <ModuleList items={m.items} onOpen={handleOpen} current={openedFile} />
          </Section>
        ))}
      </div>

      {/* Catatan */}
      <div className={`${CARD} px-5 py-4 text-sm text-white/70`}>
        Tips: jika file tidak muncul, pastikan semua berkas ada di <code className="text-white">public/upkeep/</code>,
        nama file sama persis (termasuk spasi & huruf besar-kecil). Anda juga bisa membuka “Buka tab baru”.
      </div>
    </div>
  )
}

export default PanduanPage
