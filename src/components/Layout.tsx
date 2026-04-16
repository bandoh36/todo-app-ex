import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'ダッシュボード' },
  { path: '/til', label: 'TIL' },
  { path: '/workout', label: '筋トレ' },
  { path: '/calendar', label: 'カレンダー' },
  { path: '/enjoyment', label: '予定' },
  { path: '/goals', label: '目標' },
  { path: '/tasks', label: 'TODO' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-linear-to-br from-sky-900 via-blue-900 to-slate-950">
      <aside className="w-52 flex flex-col border-r border-sky-200/20 bg-slate-900/75 backdrop-blur-md">
        <div className="border-b border-sky-200/20 p-4">
          <h1 className="text-lg font-bold text-sky-100">MyTODO</h1>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
                  ? 'bg-sky-200/25 text-sky-50'
                  : 'text-sky-100/80 hover:bg-sky-200/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="app-content-skin flex-1 overflow-auto bg-transparent p-6">{children}</main>
    </div>
  )
}
