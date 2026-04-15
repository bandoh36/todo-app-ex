import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { TaskStatus } from '@/types'

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: '未着手' },
  { value: 'doing', label: '進行中' },
  { value: 'done', label: '完了' },
]

export default function TaskEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    getAPI()
      .tasks.get(id)
      .then((task) => {
        if (task) {
          setTitle(task.title)
          setDescription(task.description ?? '')
          setDueDate(task.dueDate ?? '')
          setStatus(task.status)
        }
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      status,
    }

    if (id) {
      await getAPI().tasks.update(id, payload)
    } else {
      await getAPI().tasks.create(payload)
    }

    navigate('/tasks')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/tasks" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧へ
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">{id ? 'TODO 編集' : 'TODO 新規作成'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タスク名</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="例: React hooks の復習"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="補足メモ"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限（任意）</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {id ? '更新' : '作成'}
          </button>
          <Link
            to="/tasks"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
