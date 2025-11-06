import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/perkebunan', label: 'Monitoring Perkebunan' },
  { to: '/pabrik', label: 'Monitoring Pabrik' },
  { to: '/perusahaan', label: 'Monitoring Perusahaan' },
  { to: '/panduan', label: 'Panduan Budidaya' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-primary text-white shadow-2xl">
      <div className="h-full flex flex-col px-6 py-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-white/80">Monitoring</p>
          <h1 className="mt-2 text-2xl font-semibold">PKS & Kebun</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-medium transition hover:bg-white/15 ${
                  isActive ? 'bg-white/20 shadow-lg' : 'bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-8 text-xs text-white/70">
          Terakhir diperbarui dari Google Sheet secara otomatis.
        </div>
      </div>
    </aside>
  )
}
