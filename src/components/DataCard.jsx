export function DataCard({ title, value, description, accent = 'from-primary to-secondary' }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-white/5">
      <p className="text-sm font-medium text-white/70">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {description ? (
        <p className="mt-3 text-sm text-white/60">{description}</p>
      ) : null}
      <div className={`mt-6 h-1 w-24 rounded-full bg-gradient-to-r ${accent}`}></div>
    </div>
  )
}
