import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { getAPI } from '@/lib/api'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function WorkoutEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = (location.state as { date?: string } | null)?.date ?? todayStr()
  const [loading, setLoading] = useState(!!id)
  const [date, setDate] = useState(initialDate)
  const [content, setContent] = useState('')
  const contentInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setDate(initialDate)
      return
    }
    getAPI()
      .workouts.get(id)
      .then((w) => {
        if (w) {
          setDate(w.date)
          setContent(w.content)
        }
        setLoading(false)
      })
  }, [id, initialDate])

  useEffect(() => {
    if (loading) return
    requestAnimationFrame(() => {
      contentInputRef.current?.focus()
      window.focus()
    })
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const api = getAPI()
    if (id) {
      await api.workouts.update(id, { date, content })
    } else {
      await api.workouts.create({ date, content })
    }
    navigate('/workout')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/workout" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧へ
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? '筋トレ編集' : '筋トレ新規作成'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="メニューやメモ"
            required
            ref={contentInputRef}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {id ? '更新' : '作成'}
          </button>
          <Link
            to="/workout"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
