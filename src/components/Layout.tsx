import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { LevelUpPayload, MotivationBoard } from '@/types'
import LevelUpModal from '@/components/LevelUpModal'

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
  const [peek, setPeek] = useState<MotivationBoard['gamification'] | null>(null)
  const [levelModal, setLevelModal] = useState<{
    open: boolean
    payload: LevelUpPayload | null
  }>({ open: false, payload: null })

  const loadPeek = useCallback(() => {
    getAPI()
      .stats.motivationBoard()
      .then((b) => setPeek(b.gamification))
      .catch(() => setPeek(null))
  }, [])

  useEffect(() => {
    loadPeek()
  }, [location.pathname, loadPeek])

  useEffect(() => {
    const api = getAPI()
    const unsub = api.gamification.onLevelUp((payload) => {
      setLevelModal({ open: true, payload })
      loadPeek()
    })
    return unsub
  }, [loadPeek])

  const pct =
    peek && peek.xpForNextLevel > 0
      ? Math.min(100, (peek.xpInLevel / peek.xpForNextLevel) * 100)
      : 0

  return (
    <div className="flex min-h-screen bg-linear-to-br from-sky-900 via-blue-900 to-slate-950">
      <aside className="flex w-56 flex-col border-r border-sky-200/20 bg-slate-900/75 backdrop-blur-md">
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

        <div className="border-t border-sky-200/20 p-3">
          <Link
            to="/"
            className="block rounded-xl border border-amber-200/35 bg-linear-to-br from-indigo-950/90 to-slate-950/90 p-3 shadow-lg shadow-sky-950/40 transition hover:border-amber-200/55"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="persona-subtitle text-[10px] tracking-[0.18em] text-amber-100/90">
                ARCANA RANK
              </span>
              <span className="font-['Barlow_Condensed',sans-serif] text-xl font-black text-cyan-100">
                Lv.{peek?.level ?? '—'}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/80">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-300 via-cyan-300 to-sky-400 transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-sky-200/85">
              <span>EXP</span>
              <span>
                {peek ? `${peek.xpInLevel} / ${peek.xpForNextLevel}` : '—'}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-cyan-100/90">
              <span>POINT</span>
              <span>{peek?.rewardPoints ?? 0}</span>
            </div>
            <p className="mt-1.5 text-[10px] text-amber-100/80">
              STREAK {peek?.streakDays ?? 0} / BEST {peek?.longestStreak ?? 0}
            </p>
          </Link>
        </div>
      </aside>
      <main className="app-content-skin flex-1 overflow-auto bg-transparent p-6">{children}</main>

      <LevelUpModal
        open={levelModal.open}
        payload={levelModal.payload}
        onClose={() => setLevelModal({ open: false, payload: null })}
      />
    </div>
  )
}
