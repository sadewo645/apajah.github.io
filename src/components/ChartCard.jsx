export function ChartCard({ title, subtitle, children, actions }) {
  return (
    <section className="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-white/5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}
