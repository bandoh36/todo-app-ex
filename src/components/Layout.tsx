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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">MyTODO</h1>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
