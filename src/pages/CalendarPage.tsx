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
    <div className="persona-calendar-page rounded-3xl border border-sky-200/45 p-5 shadow-2xl shadow-sky-900/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="persona-title text-3xl font-bold tracking-wide text-cyan-50">CALENDAR</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="persona-link-button"
          >
            前月
          </button>
          <span className="text-cyan-50 font-medium min-w-32 text-center">
            {year}年{month}月
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="persona-link-button"
          >
            翌月
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cyan-50/95">
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 shrink-0 rounded bg-violet-400 shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"
            aria-hidden
          />
          TIL あり
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 shrink-0 rounded bg-amber-400 shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"
            aria-hidden
          />
          筋トレあり
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 shrink-0 rounded bg-emerald-400 shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"
            aria-hidden
          />
          予定あり
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 shrink-0 rounded border-2 border-cyan-200 bg-white shadow-[0_0_0_2px_rgba(6,182,212,0.5)]"
            aria-hidden
          />
          今日
        </span>
      </div>

      {loading ? (
        <p className="text-cyan-50/85">読み込み中...</p>
      ) : (
        <div className="bg-sky-900/25 border border-sky-100/30 rounded-xl overflow-hidden backdrop-blur-[2px]">
          <div className="grid grid-cols-7 border-b border-sky-100/30 bg-sky-200/15">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2 text-center text-sm font-medium ${
                  i === 0
                    ? 'text-rose-100 bg-rose-300/15'
                    : i === 6
                      ? 'text-sky-100 bg-sky-300/20'
                      : 'text-cyan-50/90'
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
                className={`min-h-[110px] p-1 border-b border-r border-sky-100/20 ${
                  dayTypeByGridIndex(i) === 'sun'
                    ? 'bg-rose-300/18'
                    : dayTypeByGridIndex(i) === 'sat'
                      ? 'bg-sky-300/22'
                      : 'bg-sky-100/8'
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
                  className={`min-h-[110px] p-2 border-b border-r border-sky-100/20 flex flex-col hover:bg-cyan-100/20 transition-colors ${
                    dayType === 'sun' ? 'bg-rose-300/18' : dayType === 'sat' ? 'bg-sky-300/24' : 'bg-sky-100/8'
                  } ${isToday ? 'bg-cyan-100/22 ring-1 ring-inset ring-cyan-100/85' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'text-white'
                          : dayType === 'sun'
                            ? 'text-rose-50'
                            : dayType === 'sat'
                              ? 'text-sky-50'
                              : 'text-cyan-50'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {s?.hasTIL && (
                      <div className="flex items-center gap-1.5 text-xs min-w-0" title={s.tilTitles.join(', ')}>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]" />
                        <span className="truncate text-violet-100">{normalizeCellText(s.tilTitles)}</span>
                      </div>
                    )}
                    {s?.hasWorkout && (
                      <div
                        className="flex items-center gap-1.5 text-xs min-w-0"
                        title={s.workoutContents.join(', ')}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]" />
                        <span className="truncate text-amber-100">{normalizeCellText(s.workoutContents)}</span>
                      </div>
                    )}
                    {s?.eventTitles && s.eventTitles.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs min-w-0" title={s.eventTitles.join(', ')}>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]" />
                        <span className="truncate text-emerald-100">{normalizeCellText(s.eventTitles)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-cyan-50/85">
        日付セル全体をクリックすると、その日の TIL を新規作成できます。筋トレ・予定は各ページから日付を指定して登録してください。
      </p>
    </div>
  )
}
