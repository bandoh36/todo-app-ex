import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { Task } from '@/types'

const statusLabel: Record<Task['status'], string> = {
  todo: '未着手',
  doing: '進行中',
  done: '完了',
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Task['status']>('all')

  useEffect(() => {
    getAPI()
      .tasks.list()
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('このタスクを削除しますか？')) return
    await getAPI().tasks.delete(id)
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const filtered = useMemo(() => {
    const list = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
    return [...list].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [tasks, filter])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">TODO 一覧</h2>
        <Link
          to="/tasks/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          新規作成
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {(['all', 'todo', 'doing', 'done'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-3 py-1 text-sm rounded border ${
              filter === value
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {value === 'all' ? 'すべて' : statusLabel[value]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600">タスクがまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((task) => (
            <li
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="min-w-0 flex-1">
                <Link to={`/tasks/${task.id}`} className="block hover:opacity-80">
                  <span className="font-medium text-gray-800">{task.title}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {statusLabel[task.status]}
                  </span>
                  {task.dueDate && (
                    <span className="ml-2 text-sm text-gray-500">期限: {task.dueDate}</span>
                  )}
                </Link>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  to={`/tasks/${task.id}`}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
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
