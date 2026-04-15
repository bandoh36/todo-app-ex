import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { Goal } from '@/types'

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tilCounts, setTilCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAPI().goals.list(), getAPI().tils.list()]).then(([goalsList, tilsList]) => {
      setGoals(goalsList)
      const counts: Record<string, number> = {}
      tilsList.forEach((t) => {
        if (t.goalId) counts[t.goalId] = (counts[t.goalId] ?? 0) + 1
      })
      setTilCounts(counts)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('この目標を削除しますか？紐づく TIL の目標は外れます。')) return
    await getAPI().goals.delete(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setTilCounts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">目標一覧</h2>
        <Link
          to="/goals/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : goals.length === 0 ? (
        <p className="text-gray-600">目標がまだありません。TIL と紐づけて管理できます。</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li
              key={g.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="min-w-0 flex-1">
                <Link to={`/goals/${g.id}`} className="block hover:opacity-80">
                  <span className="font-medium text-gray-800">{g.title}</span>
                  {g.targetDate && (
                    <span className="ml-2 text-sm text-gray-500">目標日: {g.targetDate}</span>
                  )}
                </Link>
                {g.description && (
                  <p className="mt-1 text-sm text-gray-600">{g.description}</p>
                )}
                <span className="inline-block mt-2 text-xs text-indigo-600">
                  TIL 紐付け: {tilCounts[g.id] ?? 0} 件
                </span>
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/goals/${g.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(g.id)}
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
