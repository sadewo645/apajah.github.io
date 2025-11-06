import { Sidebar } from './Sidebar'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter">
      <Sidebar />
      <main className="ml-72 min-h-screen overflow-y-auto bg-slate-900/60">
        <div className="min-h-screen px-10 py-10">
          <div className="mx-auto max-w-6xl space-y-10">{children}</div>
        </div>
      </main>
    </div>
  )
}
