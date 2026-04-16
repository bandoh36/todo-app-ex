import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAPI } from "@/lib/api";
import type { TIL, EnjoymentEvent, Task } from "@/types";

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
  const [loading, setLoading] = useState(true);
  const today = todayStr();

  useEffect(() => {
    Promise.all([
      getAPI().tils.list(),
      getAPI().workouts.list(),
      getAPI().events.list(),
      getAPI().tasks.list(),
    ]).then(([tils, workouts, events, tasks]) => {
      setTodayTils(tils.filter((t) => t.date === today));
      setTodayWorkouts(workouts.filter((w) => w.date === today));
      setTodayEvents(events.filter((e) => e.date === today));
      setRecentTils(
        [...tils].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 5),
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
          .slice(0, 5),
      );
      setLoading(false);
    });
  }, [today]);

  if (loading) return <p className="text-sky-900/80">読み込み中...</p>;

  const statusLabel = (status: Task["status"]) =>
    status === "todo" ? "未着手" : status === "doing" ? "進行中" : "完了";

  return (
    <div className="persona-dashboard relative overflow-hidden rounded-3xl border border-sky-200/45 p-6 text-slate-50 shadow-2xl shadow-sky-900/30">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-100/80 blur-2xl moon-glow" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />

      <section className="relative mb-8">
        <div className="mb-2 inline-flex -skew-x-12 bg-sky-300 px-4 py-1">
          <span className="skew-x-12 text-xs font-bold tracking-[0.25em] text-slate-950">
            MIDNIGHT LOG
          </span>
        </div>
        <h2 className="persona-title text-4xl font-extrabold tracking-wide text-cyan-50 drop-shadow-[0_0_12px_rgba(186,230,253,0.6)] md:text-5xl">
          DASHBOARD
        </h2>
        <p className="mt-2 text-sm text-cyan-50/90">- {today} -</p>
      </section>

      <section className="mb-8">
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
                {todayTils.map((t) => (
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
                {todayWorkouts.map((w) => (
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
                {todayEvents.map((e) => (
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

      <section className="mb-8 grid gap-4 xl:grid-cols-2">
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

      <section className="relative overflow-hidden rounded-xl border border-sky-200/15 bg-slate-900/70 p-4">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-sky-200/20" />
        <p className="persona-subtitle text-xs tracking-[0.18em] text-sky-200/80">
          MOONLIGHT NOTE
        </p>
        <p className="mt-2 text-sm text-slate-200/90">
          ここは毎日更新して育てるステータス画面です。
        </p>
        <div className="mt-3 flex gap-2">
          <Link to="/calendar" className="persona-link-button">
            CALENDAR
          </Link>
          <Link to="/tasks" className="persona-link-button">
            TASKS
          </Link>
        </div>
      </section>
    </div>
  );
}
