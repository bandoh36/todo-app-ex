import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { TIL } from '@/types'

export default function TILList() {
  const [tils, setTils] = useState<TIL[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAPI()
      .tils.list()
      .then(setTils)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('この TIL を削除しますか？')) return
    await getAPI().tils.delete(id)
    setTils((prev) => prev.filter((t) => t.id !== id))
  }

  const sorted = [...tils].sort((a, b) => (b.date > a.date ? 1 : -1))

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">TIL 一覧</h2>
        <Link
          to="/til/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-600">TIL がまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((til) => (
            <li
              key={til.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="min-w-0 flex-1">
                <Link to={`/til/${til.id}`} className="block hover:opacity-80">
                  <span className="text-gray-500 text-sm mr-2">{til.date}</span>
                  <span className="font-medium text-gray-800">{til.title}</span>
                  {til.goalId && (
                    <span className="ml-2 text-xs text-indigo-600">（目標紐付けあり）</span>
                  )}
                </Link>
                {til.content && (
                  <p className="mt-1 text-sm text-gray-600 truncate max-w-2xl">{til.content}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/til/${til.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(til.id)}
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
