import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { Workout } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    getAPI()
      .workouts.list()
      .then(setWorkouts)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    await getAPI().workouts.delete(deleteTargetId)
    setWorkouts((prev) => prev.filter((w) => w.id !== deleteTargetId))
    setDeleteTargetId(null)
  }

  const sorted = [...workouts].sort((a, b) => (b.date > a.date ? 1 : -1))

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">筋トレ一覧</h2>
        <Link
          to="/workout/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-600">筋トレ記録がまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((w) => (
            <li
              key={w.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="min-w-0 flex-1">
                <Link to={`/workout/${w.id}`} className="block hover:opacity-80">
                  <span className="text-gray-500 text-sm mr-2">{w.date}</span>
                  <span className="text-gray-800">{w.content}</span>
                </Link>
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/workout/${w.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(w.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="筋トレ記録を削除しますか？"
        message="この操作は取り消せません。"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
