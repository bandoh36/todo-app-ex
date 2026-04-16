import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { getAPI } from '@/lib/api'
import type { TIL, Goal } from '@/types'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function TILEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = (location.state as { date?: string } | null)?.date ?? todayStr()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(!!id)
  const [date, setDate] = useState(initialDate)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [link, setLink] = useState('')
  const [goalId, setGoalId] = useState<string>('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAPI()
      .goals.list()
      .then(setGoals)
  }, [])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setDate(initialDate)
      return
    }
    getAPI()
      .tils.get(id)
      .then((til: TIL | null) => {
        if (til) {
          setDate(til.date)
          setTitle(til.title)
          setContent(til.content)
          setLink(til.link ?? '')
          setGoalId(til.goalId ?? '')
        }
        setLoading(false)
      })
  }, [id, initialDate])

  useEffect(() => {
    if (loading) return
    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
      window.focus()
    })
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const api = getAPI()
    if (id) {
      await api.tils.update(id, { date, title, content, link: link || undefined, goalId: goalId || undefined })
    } else {
      await api.tils.create({ date, title, content, link: link || undefined, goalId: goalId || undefined })
    }
    navigate('/til')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/til" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧へ
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">{id ? 'TIL 編集' : 'TIL 新規作成'}</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="学んだことのタイトル"
            required
            ref={titleInputRef}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="学んだことの内容"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">リンク URL</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">紐づける目標</label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">なし</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {id ? '更新' : '作成'}
          </button>
          <Link
            to="/til"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
