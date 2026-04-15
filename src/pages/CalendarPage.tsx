import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAPI } from '@/lib/api'

interface DaySummary {
  date: string
  hasTIL: boolean
  hasWorkout: boolean
  eventTitles: string[]
  tilTitles: string[]
  workoutContents: string[]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dayTypeByGridIndex(gridIndex: number): 'sun' | 'sat' | 'weekday' {
  const weekday = gridIndex % 7
  if (weekday === 0) return 'sun'
  if (weekday === 6) return 'sat'
  return 'weekday'
}

function normalizeCellText(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items[0]} (+${items.length - 1})`
}

export default function CalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [summary, setSummary] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAPI()
      .calendar.monthSummary(year, month)
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [year, month])

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const getSummary = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return summary.find((s) => s.date === dateStr)
  }

  const today = toDateString(new Date())

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">カレンダー</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            前月
          </button>
          <span className="text-gray-800 font-medium min-w-32 text-center">
            {year}年{month}月
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            翌月
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-indigo-200 inline-block" /> TIL あり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-amber-200 inline-block" /> 筋トレあり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-emerald-200 inline-block" /> 予定あり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-sky-200 inline-block" /> 今日
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2 text-center text-sm font-medium ${
                  i === 0 ? 'text-red-500 bg-red-50/40' : i === 6 ? 'text-blue-500 bg-blue-50/40' : 'text-gray-600'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startOffset }, (_, i) => (
              <div
                key={`empty-${i}`}
                className={`min-h-[110px] p-1 border-b border-r border-gray-100 ${
                  dayTypeByGridIndex(i) === 'sun'
                    ? 'bg-red-100/60'
                    : dayTypeByGridIndex(i) === 'sat'
                      ? 'bg-blue-100/60'
                      : 'bg-gray-50/60'
                }`}
              />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const s = getSummary(day)
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const gridIndex = startOffset + i
              const dayType = dayTypeByGridIndex(gridIndex)
              const isToday = dateStr === today
              return (
                <Link
                  key={day}
                  to="/til/new"
                  state={{ date: dateStr }}
                  className={`min-h-[110px] p-2 border-b border-r border-gray-100 flex flex-col hover:bg-indigo-50/40 transition-colors ${
                    dayType === 'sun' ? 'bg-red-100/60' : dayType === 'sat' ? 'bg-blue-100/60' : 'bg-white'
                  } ${isToday ? 'bg-sky-200/60 ring-1 ring-inset ring-sky-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'text-sky-800'
                          : dayType === 'sun'
                            ? 'text-red-700'
                            : dayType === 'sat'
                              ? 'text-blue-700'
                              : 'text-gray-800'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {s?.hasTIL && (
                      <div className="flex items-center gap-1.5 text-xs min-w-0" title={s.tilTitles.join(', ')}>
                        <span className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
                        <span className="truncate text-indigo-700">{normalizeCellText(s.tilTitles)}</span>
                      </div>
                    )}
                    {s?.hasWorkout && (
                      <div
                        className="flex items-center gap-1.5 text-xs min-w-0"
                        title={s.workoutContents.join(', ')}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-300 shrink-0" />
                        <span className="truncate text-amber-700">{normalizeCellText(s.workoutContents)}</span>
                      </div>
                    )}
                    {s?.eventTitles && s.eventTitles.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs min-w-0" title={s.eventTitles.join(', ')}>
                        <span className="w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
                        <span className="truncate text-emerald-700">{normalizeCellText(s.eventTitles)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        日付セル全体をクリックすると、その日の TIL を新規作成できます。筋トレ・予定は各ページから日付を指定して登録してください。
      </p>
    </div>
  )
}
