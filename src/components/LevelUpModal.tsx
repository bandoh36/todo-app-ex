import type { LevelUpPayload } from '@/types'

type Props = {
  open: boolean
  payload: LevelUpPayload | null
  onClose: () => void
}

export default function LevelUpModal({ open, payload, onClose }: Props) {
  if (!open || !payload) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <div className="relative max-w-lg overflow-hidden rounded-2xl border-2 border-amber-300/55 bg-linear-to-br from-indigo-950 via-sky-950 to-slate-950 px-8 py-10 shadow-[0_0_60px_rgba(251,191,36,0.35)]">
        <div className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative mb-6 inline-flex -skew-x-12 bg-amber-400 px-5 py-2">
          <span className="skew-x-12 font-['Barlow_Condensed',sans-serif] text-xl font-black tracking-[0.35em] text-slate-950">
            LEVEL UP
          </span>
        </div>

        <p className="relative font-['Barlow_Condensed',sans-serif] text-6xl font-black leading-none tracking-wide text-cyan-50 drop-shadow-[0_0_24px_rgba(34,211,238,0.55)]">
          Lv.{payload.level}
        </p>

        <p className="relative mt-4 text-sm text-amber-100/95">
          このアクションで <span className="font-bold text-amber-200">+{payload.gainedXp} EXP</span>{' '}
          を獲得しました。
        </p>
        <p className="relative mt-1 text-sm text-cyan-100/90">
          Lvアップ報酬: <span className="font-bold text-cyan-200">+{payload.gainedPoints} PT</span> / 所持{' '}
          <span className="font-bold text-cyan-200">{payload.totalPoints} PT</span>
        </p>

        {payload.newPerks.length > 0 && (
          <div className="relative mt-6 border-t border-sky-200/25 pt-5">
            <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-sky-200/90">
              NEW UNLOCK
            </p>
            <ul className="space-y-2">
              {payload.newPerks.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-cyan-200/35 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-50"
                >
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="relative mt-8 w-full rounded-lg border border-amber-200/50 bg-amber-400/25 py-3 font-['Barlow_Condensed',sans-serif] text-sm font-bold tracking-[0.2em] text-amber-50 transition hover:bg-amber-400/35"
        >
          NEXT CHALLENGE
        </button>
      </div>
    </div>
  )
}
