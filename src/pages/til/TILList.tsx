import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { TIL } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function TILList() {
  const [tils, setTils] = useState<TIL[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    getAPI()
      .tils.list()
      .then(setTils)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTargetId) return
    await getAPI().tils.delete(deleteTargetId)
    setTils((prev) => prev.filter((t) => t.id !== deleteTargetId))
    setDeleteTargetId(null)
  }

  const sorted = [...tils].sort((a, b) => (b.date > a.date ? 1 : -1))

  return (
    <div className="persona-page-shell">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="persona-page-title">TIL</h2>
        <Link to="/til/new" className="persona-link-button">
          新規作成
        </Link>
      </div>

      {loading ? (
        <p className="persona-page-help">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="persona-page-help">TIL がまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((til) => (
            <li key={til.id} className="persona-card flex items-start justify-between p-4">
              <div className="min-w-0 flex-1">
                <Link to={`/til/${til.id}`} className="block hover:opacity-90">
                  <span className="mr-2 text-sm text-sky-100/85">{til.date}</span>
                  <span className="font-medium text-sky-50">{til.title}</span>
                  {til.goalId && <span className="ml-2 text-xs text-cyan-200">（目標紐付けあり）</span>}
                </Link>
                {til.content && <p className="mt-1 max-w-2xl truncate text-sm text-sky-100/85">{til.content}</p>}
              </div>
              <div className="ml-4 flex gap-2">
                <Link to={`/til/${til.id}`} className="persona-inline-button persona-inline-button-edit">
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(til.id)}
                  className="persona-inline-button persona-inline-button-delete"
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
        title="TIL を削除しますか？"
        message="この操作は取り消せません。"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
