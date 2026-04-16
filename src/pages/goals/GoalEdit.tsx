import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'

export default function GoalEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    getAPI()
      .goals.get(id)
      .then((g) => {
        if (g) {
          setTitle(g.title)
          setDescription(g.description)
          setTargetDate(g.targetDate ?? '')
        }
        setLoading(false)
      })
  }, [id])

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
    const payload = {
      title,
      description,
      targetDate: targetDate || undefined,
    }
    if (id) {
      await api.goals.update(id, payload)
    } else {
      await api.goals.create(payload)
    }
    navigate('/goals')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/goals" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧へ
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">{id ? '目標編集' : '目標新規作成'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="目標のタイトル"
            required
            ref={titleInputRef}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="目標の説明"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目標日（任意）</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
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
            to="/goals"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
