import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { getAPI } from '@/lib/api'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function EnjoymentEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = (location.state as { date?: string } | null)?.date ?? todayStr()
  const [loading, setLoading] = useState(!!id)
  const [date, setDate] = useState(initialDate)
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setDate(initialDate)
      return
    }
    getAPI()
      .events.get(id)
      .then((ev) => {
        if (ev) {
          setDate(ev.date)
          setTitle(ev.title)
          setMemo(ev.memo ?? '')
        }
        setLoading(false)
      })
  }, [id, initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const api = getAPI()
    if (id) {
      await api.events.update(id, { date, title, memo: memo || undefined })
    } else {
      await api.events.create({ date, title, memo: memo || undefined })
    }
    navigate('/enjoyment')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/enjoyment" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧へ
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">
          {id ? '予定編集' : '予定新規登録'}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="例: 〇〇の映画公開日"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="任意"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {id ? '更新' : '登録'}
          </button>
          <Link
            to="/enjoyment"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
