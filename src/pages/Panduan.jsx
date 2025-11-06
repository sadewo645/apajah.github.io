export function PanduanPage() {
  const steps = [
    {
      title: 'Perencanaan Bibit',
      content:
        'Pilih bibit unggul bersertifikat dengan produktivitas tinggi dan ketahanan terhadap hama penyakit.',
    },
    {
      title: 'Pemeliharaan Kebun',
      content:
        'Lakukan pemupukan berimbang, pengendalian gulma terjadwal, serta pemantauan kelembapan dan irigasi.',
    },
    {
      title: 'Panen & Transportasi',
      content:
        'Panen tandan buah segar pada tingkat kematangan optimal, minimalkan waktu tempuh ke pabrik untuk menjaga kualitas.',
    },
    {
      title: 'Keselamatan Kerja',
      content:
        'Pastikan penggunaan APD lengkap, lakukan briefing harian, dan catat insiden untuk evaluasi keselamatan.',
    },
  ]

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Referensi</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Panduan Budidaya</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/60">
          Kumpulan praktik terbaik untuk menjaga produktivitas kebun dan efisiensi operasional pabrik kelapa sawit.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{step.title}</h2>
              <span className="rounded-full bg-gradient-to-br from-primary to-secondary px-3 py-1 text-xs font-semibold text-white">
                Langkah {index + 1}
              </span>
            </div>
            <p className="mt-4 text-sm text-white/70">{step.content}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-white/5">
        <h2 className="text-xl font-semibold text-white">Tips Integrasi Data</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/70">
          <li>
            • Gunakan Google Sheet yang sama dengan struktur kolom konsisten agar grafik pada dashboard tetap stabil.
          </li>
          <li>• Hindari formula yang menghasilkan error (#N/A, #REF!) untuk mencegah data gagal diambil.</li>
          <li>• Update data minimal sekali sehari dan klik tombol "Muat Ulang" pada halaman monitoring untuk menyinkronkan.</li>
        </ul>
      </section>
    </div>
  )
}
