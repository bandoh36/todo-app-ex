import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { TIL, EnjoymentEvent, Task } from '@/types'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const [todayTils, setTodayTils] = useState<TIL[]>([])
  const [todayWorkouts, setTodayWorkouts] = useState<{ id: string; date: string; content: string }[]>([])
  const [todayEvents, setTodayEvents] = useState<EnjoymentEvent[]>([])
  const [recentTils, setRecentTils] = useState<TIL[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const today = todayStr()

  useEffect(() => {
    Promise.all([
      getAPI().tils.list(),
      getAPI().workouts.list(),
      getAPI().events.list(),
      getAPI().tasks.list(),
    ]).then(([tils, workouts, events, tasks]) => {
      setTodayTils(tils.filter((t) => t.date === today))
      setTodayWorkouts(workouts.filter((w) => w.date === today))
      setTodayEvents(events.filter((e) => e.date === today))
      setRecentTils([...tils].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 5))
      setRecentTasks(
        [...tasks]
          .filter((task) => task.status !== 'done')
          .sort((a, b) => {
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
            if (a.dueDate) return -1
            if (b.dueDate) return 1
            return b.createdAt.localeCompare(a.createdAt)
          })
          .slice(0, 5)
      )
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">ダッシュボード</h2>

      <section>
        <h3 className="text-sm font-medium text-gray-500 mb-2">今日（{today}）</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">TIL</span>
              <Link
                to="/til/new"
                state={{ date: today }}
                className="text-xs text-indigo-600 hover:underline"
              >
                追加
              </Link>
            </div>
            {todayTils.length === 0 ? (
              <p className="text-sm text-gray-500">まだありません</p>
            ) : (
              <ul className="space-y-1">
                {todayTils.map((t) => (
                  <li key={t.id}>
                    <Link to={`/til/${t.id}`} className="text-sm text-gray-800 hover:text-indigo-600">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">筋トレ</span>
              <Link
                to="/workout/new"
                state={{ date: today }}
                className="text-xs text-indigo-600 hover:underline"
              >
                追加
              </Link>
            </div>
            {todayWorkouts.length === 0 ? (
              <p className="text-sm text-gray-500">まだありません</p>
            ) : (
              <ul className="space-y-1">
                {todayWorkouts.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={`/workout/${w.id}`}
                      className="text-sm text-gray-800 hover:text-indigo-600 line-clamp-2"
                    >
                      {w.content}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">予定</span>
              <Link
                to="/enjoyment/new"
                state={{ date: today }}
                className="text-xs text-indigo-600 hover:underline"
              >
                追加
              </Link>
            </div>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-gray-500">今日の予定なし</p>
            ) : (
              <ul className="space-y-1">
                {todayEvents.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={`/enjoyment/${e.id}`}
                      className="text-sm text-gray-800 hover:text-indigo-600"
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">直近タスク</h3>
          <Link to="/tasks" className="text-xs text-indigo-600 hover:underline">
            一覧へ
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-gray-500">未完了のタスクはありません。</p>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {recentTasks.map((task) => (
              <li key={task.id} className="p-3">
                <Link to={`/tasks/${task.id}`} className="block hover:bg-gray-50 -m-3 p-3 rounded">
                  <span className="font-medium text-gray-800">{task.title}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {task.status === 'todo' ? '未着手' : '進行中'}
                  </span>
                  {task.dueDate && (
                    <span className="ml-2 text-sm text-gray-500">期限: {task.dueDate}</span>
                  )}
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600 truncate">{task.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">直近の TIL</h3>
          <Link to="/til" className="text-xs text-indigo-600 hover:underline">
            一覧へ
          </Link>
        </div>
        {recentTils.length === 0 ? (
          <p className="text-sm text-gray-500">TIL がまだありません。</p>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {recentTils.map((t) => (
              <li key={t.id} className="p-3">
                <Link to={`/til/${t.id}`} className="block hover:bg-gray-50 -m-3 p-3 rounded">
                  <span className="text-gray-500 text-sm mr-2">{t.date}</span>
                  <span className="font-medium text-gray-800">{t.title}</span>
                  {t.content && (
                    <p className="mt-1 text-sm text-gray-600 truncate">{t.content}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
