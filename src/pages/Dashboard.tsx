import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAPI } from "@/lib/api";
import type { TIL, EnjoymentEvent, Task, MotivationBoard } from "@/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [todayTils, setTodayTils] = useState<TIL[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<
    { id: string; date: string; content: string }[]
  >([]);
  const [todayEvents, setTodayEvents] = useState<EnjoymentEvent[]>([]);
  const [recentTils, setRecentTils] = useState<TIL[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [motivation, setMotivation] = useState<MotivationBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const today = todayStr();

  useEffect(() => {
    Promise.all([
      getAPI().tils.list(),
      getAPI().workouts.list(),
      getAPI().events.list(),
      getAPI().tasks.list(),
      getAPI().stats.motivationBoard(),
    ]).then(([tils, workouts, events, tasks, board]) => {
      setTodayTils(tils.filter((t) => t.date === today));
      setTodayWorkouts(workouts.filter((w) => w.date === today));
      setTodayEvents(events.filter((e) => e.date === today));
      setRecentTils(
        [...tils].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 3),
      );
      setRecentTasks(
        [...tasks]
          .filter((task) => task.status !== "done")
          .sort((a, b) => {
            if (a.dueDate && b.dueDate)
              return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return b.createdAt.localeCompare(a.createdAt);
          })
          .slice(0, 3),
      );
      setMotivation(board);
      setLoading(false);
    });
  }, [today]);

  if (loading) return <p className="text-sky-900/80">読み込み中...</p>;

  const statusLabel = (status: Task["status"]) =>
    status === "todo" ? "未着手" : status === "doing" ? "進行中" : "完了";

  return (
    <div className="persona-dashboard relative overflow-hidden rounded-3xl border border-sky-200/45 p-5 text-slate-50 shadow-2xl shadow-sky-900/30">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-100/80 blur-2xl moon-glow" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />

      <section className="relative mb-5">
        <div className="mb-2 inline-flex -skew-x-12 bg-sky-300 px-4 py-1">
          <span className="skew-x-12 text-xs font-bold tracking-[0.25em] text-slate-950">
            MIDNIGHT LOG
          </span>
        </div>
        <h2 className="persona-title text-3xl font-extrabold tracking-wide text-cyan-50 drop-shadow-[0_0_12px_rgba(186,230,253,0.6)] md:text-4xl">
          DASHBOARD
        </h2>
        <p className="mt-2 text-sm text-cyan-50/90">- {today} -</p>
      </section>

      {motivation && (
        <section className="relative mb-5">
          <div className="mb-3 inline-flex -skew-x-12 bg-amber-300/35 px-4 py-1">
            <span className="skew-x-12 text-xs font-bold tracking-[0.28em] text-slate-950">
              RPG STATUS
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="persona-panel border-amber-200/25 py-3">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="persona-subtitle text-[10px] tracking-[0.25em] text-amber-100/90">
                    LEVEL / EXP
                  </p>
                  <p className="persona-title mt-1 text-3xl leading-none text-cyan-50">
                    Lv.{motivation.gamification.level}
                  </p>
                </div>
                <div className="text-right text-xs text-sky-100/85">
                  <p className="font-semibold text-amber-100">
                    MULT ×{motivation.gamification.xpMultiplier.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-sky-100/75">
                    特典による獲得EXPボーナス
                  </p>
                </div>
              </div>
              <div className="mb-2 flex justify-between text-[11px] text-sky-100/85">
                <span>
                  EXP {motivation.gamification.xpInLevel} /{" "}
                  {motivation.gamification.xpForNextLevel}
                </span>
                <span>TOTAL {motivation.gamification.totalXp}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border border-sky-200/35 bg-slate-950/75">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-300 via-cyan-300 to-sky-400 transition-[width]"
                  style={{
                    width: `${Math.min(
                      100,
                      (motivation.gamification.xpInLevel /
                        Math.max(1, motivation.gamification.xpForNextLevel)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-sky-200/20 pt-2 text-sm">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-sky-200/80">
                    STREAK
                  </p>
                  <p className="persona-subtitle text-lg text-cyan-50">
                    {motivation.gamification.streakDays} DAYS
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-sky-200/80">
                    BEST
                  </p>
                  <p className="persona-subtitle text-lg text-cyan-50">
                    {motivation.gamification.longestStreak} DAYS
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-sky-200/80">
                    POINT
                  </p>
                  <p className="persona-subtitle text-lg text-cyan-50">
                    {motivation.gamification.rewardPoints}
                  </p>
                </div>
              </div>
              {motivation.gamification.perks.length > 0 && (
                <div className="mt-3 border-t border-sky-200/15 pt-3">
                  <p className="mb-2 text-[10px] tracking-[0.22em] text-sky-200/85">
                    UNLOCKED PERKS
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {motivation.gamification.perks.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-md border border-cyan-200/35 bg-cyan-300/15 px-2 py-1 text-[11px] text-cyan-50"
                      >
                        {p.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <article className="persona-panel border-violet-200/25 py-3">
              <p className="persona-subtitle mb-3 text-[10px] tracking-[0.25em] text-violet-100/95">
                WEEKLY REPORT
              </p>
              <p className="mb-4 text-xs text-sky-100/85">
                {motivation.weekly.weekStart} ～ {motivation.weekly.weekEnd}{" "}
                <span className="text-sky-200/70">（月曜始まり）</span>
              </p>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-sky-50">
                <dt className="text-sky-200/80">獲得 EXP</dt>
                <dd className="text-right font-semibold text-amber-100">
                  {motivation.weekly.xpGained}
                </dd>
                <dt className="text-sky-200/80">TIL</dt>
                <dd className="text-right">{motivation.weekly.tilCount}</dd>
                <dt className="text-sky-200/80">筋トレ</dt>
                <dd className="text-right">{motivation.weekly.workoutCount}</dd>
                <dt className="text-sky-200/80">予定（日付あり）</dt>
                <dd className="text-right">{motivation.weekly.datedEventCount}</dd>
                <dt className="text-sky-200/80">TODO 完了</dt>
                <dd className="text-right">{motivation.weekly.tasksCompleted}</dd>
                <dt className="text-sky-200/80">TODO 登録</dt>
                <dd className="text-right">{motivation.weekly.tasksCreated}</dd>
                <dt className="text-sky-200/80">目標 新規</dt>
                <dd className="text-right">{motivation.weekly.goalsCreated}</dd>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-sky-100/75">
                EXP は TODO・TIL・筋トレ・予定・目標の作成 / TODO
                完了で付与されます。連続ログインではなく、「記録や完了で
                EXP が入った日」がストリークにカウントされます。
              </p>
            </article>
          </div>
        </section>
      )}

      <section className="mb-5">
        <h3 className="persona-subtitle mb-3 text-xs tracking-[0.2em] text-sky-200/90">
          TODAY FOCUS
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="persona-panel">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-sky-100">TIL</span>
              <Link
                to="/til/new"
                state={{ date: today }}
                className="persona-link-button"
              >
                + ADD
              </Link>
            </div>
            {todayTils.length === 0 ? (
              <p className="text-sm text-slate-300/80">まだありません</p>
            ) : (
              <ul className="space-y-2">
                {todayTils.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <Link to={`/til/${t.id}`} className="persona-item-link">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="persona-panel">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-sky-100">
                WORKOUT
              </span>
              <Link
                to="/workout/new"
                state={{ date: today }}
                className="persona-link-button"
              >
                + ADD
              </Link>
            </div>
            {todayWorkouts.length === 0 ? (
              <p className="text-sm text-slate-300/80">まだありません</p>
            ) : (
              <ul className="space-y-2">
                {todayWorkouts.slice(0, 3).map((w) => (
                  <li key={w.id}>
                    <Link
                      to={`/workout/${w.id}`}
                      className="persona-item-link line-clamp-2"
                    >
                      {w.content}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="persona-panel">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-sky-100">PLAN</span>
              <Link
                to="/enjoyment/new"
                state={{ date: today }}
                className="persona-link-button"
              >
                + ADD
              </Link>
            </div>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-slate-300/80">今日の予定なし</p>
            ) : (
              <ul className="space-y-2">
                {todayEvents.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Link
                      to={`/enjoyment/${e.id}`}
                      className="persona-item-link"
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <section className="mb-2 grid gap-4 xl:grid-cols-2">
        <article className="persona-panel">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="persona-subtitle text-xs tracking-[0.2em] text-sky-200/90">
              RECENT TASKS
            </h3>
            <Link to="/tasks" className="persona-link-button">
              VIEW ALL
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-300/80">
              未完了のタスクはありません。
            </p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li key={task.id}>
                  <Link to={`/tasks/${task.id}`} className="persona-list-row">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sky-50">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-300/85">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1">
                      <span className="rounded-sm bg-sky-300 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                        {statusLabel(task.status)}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] text-sky-100/80">
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="persona-panel">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="persona-subtitle text-xs tracking-[0.2em] text-sky-200/90">
              RECENT TIL
            </h3>
            <Link to="/til" className="persona-link-button">
              VIEW ALL
            </Link>
          </div>
          {recentTils.length === 0 ? (
            <p className="text-sm text-slate-300/80">TIL がまだありません。</p>
          ) : (
            <ul className="space-y-2">
              {recentTils.map((t) => (
                <li key={t.id}>
                  <Link to={`/til/${t.id}`} className="persona-list-row">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sky-50">
                        {t.title}
                      </p>
                      {t.content && (
                        <p className="mt-0.5 truncate text-xs text-slate-300/85">
                          {t.content}
                        </p>
                      )}
                    </div>
                    <span className="ml-3 text-[10px] text-sky-100/80">
                      {t.date}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

    </div>
  );
}
