import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { EnjoymentEvent } from '@/types'

export default function EnjoymentList() {
  const [events, setEvents] = useState<EnjoymentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAPI()
      .events.list()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return
    await getAPI().events.delete(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const sorted = [...events].sort((a, b) => (a.date > b.date ? 1 : -1))

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">予定一覧</h2>
        <Link
          to="/enjoyment/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          新規登録
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-600">予定がまだありません。（映画の公開日などを登録できます）</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((ev) => (
            <li
              key={ev.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="min-w-0 flex-1">
                <Link to={`/enjoyment/${ev.id}`} className="block hover:opacity-80">
                  <span className="text-gray-500 text-sm mr-2">{ev.date}</span>
                  <span className="font-medium text-gray-800">{ev.title}</span>
                </Link>
                {ev.memo && <p className="mt-1 text-sm text-gray-600">{ev.memo}</p>}
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/enjoyment/${ev.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(ev.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
