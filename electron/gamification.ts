import type { DataFile, Gamification, XpLedgerEntry, XpLedgerReason } from './store'
import { randomUUID } from 'crypto'

/**
 * 全体バランス調整（RAW_XP に一括反映）。開発時のみ変更で OK。
 * 例: ゆるめ `0.85` / 標準 `1` / 強め（周回向け）`1.25`
 */
export const XP_GLOBAL_MULTIPLIER = 1
/** 行動で得た EXP に掛けるポイント化率（100+ を出しやすくする） */
export const POINTS_PER_XP = 12
/** レベルアップ時の追加ポイント */
export const LEVEL_UP_POINT_BONUS = 300

/** 報酬算出の素 EXP（特典バウンド前・XP_GLOBAL_MULTIPLIER・レベル倍率の入力） */
export const RAW_XP: Record<XpLedgerReason, number> = {
  task_create: 10,
  task_complete: 38,
  til_create: 30,
  workout_create: 26,
  event_create: 16,
  goal_create: 14,
}

/** レベル L から L+1 に上がるのに必要な XP（そのレベル帯で貯める量） */
export function xpToAdvanceFromLevel(level: number): number {
  return Math.max(48, Math.floor(52 * Math.pow(1.14, Math.max(0, level - 1))))
}

export function deriveLevelProgress(totalXp: number): {
  level: number
  xpInLevel: number
  xpForNextLevel: number
} {
  let level = 1
  let remaining = totalXp
  while (true) {
    const need = xpToAdvanceFromLevel(level)
    if (remaining < need) {
      return { level, xpInLevel: remaining, xpForNextLevel: need }
    }
    remaining -= need
    level++
  }
}

export type PerkDef = {
  id: string
  minLevel: number
  label: string
  xpMultiplier?: number
}

/** レベル到達で解放される特典（見た目 + 経験値ボーナス） */
export const PERK_DEFINITIONS: PerkDef[] = [
  { id: 'title_blue_hour', minLevel: 2, label: '称号: BLUE HOUR', xpMultiplier: 0 },
  { id: 'xp_bonus_5', minLevel: 4, label: '特典: 獲得EXP +5%', xpMultiplier: 0.05 },
  { id: 'title_arcana_seeker', minLevel: 6, label: '称号: ARCANA SEEKER', xpMultiplier: 0 },
  { id: 'xp_bonus_10', minLevel: 10, label: '特典: 獲得EXP +10%', xpMultiplier: 0.1 },
  { id: 'title_midnight_operator', minLevel: 14, label: '称号: MIDNIGHT OPERATOR', xpMultiplier: 0 },
]

export function perksForTotalXp(totalXp: number): PerkDef[] {
  const level = deriveLevelProgress(totalXp).level
  return PERK_DEFINITIONS.filter((p) => p.minLevel <= level)
}

export function getXpMultiplierFromXp(totalXp: number): number {
  let m = 1
  for (const def of perksForTotalXp(totalXp)) {
    if (def.xpMultiplier) m += def.xpMultiplier
  }
  return m
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseLocalDate(str: string): Date {
  const [y, mo, d] = str.split('-').map(Number)
  return new Date(y, mo - 1, d)
}

function daysBetween(a: string, b: string): number {
  const ms = parseLocalDate(b).getTime() - parseLocalDate(a).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

/** アクション発生日（ストリーク用）。保存操作が起きた「今日」を推奨 */
export function touchStreak(g: Gamification, activityDay: string): Gamification {
  const last = g.lastActivityDate
  let streak = g.streakDays
  let longest = g.longestStreak

  if (!last) {
    streak = 1
  } else if (last === activityDay) {
    // 同一日は連続日数は据え置き（最低1）
    streak = Math.max(1, streak)
  } else {
    const diff = daysBetween(last, activityDay)
    if (diff === 1) streak = streak + 1
    else streak = 1
  }

  longest = Math.max(longest, streak)
  return {
    ...g,
    lastActivityDate: activityDay,
    streakDays: streak,
    longestStreak: longest,
  }
}

function trimLedger(entries: XpLedgerEntry[], max = 240): XpLedgerEntry[] {
  if (entries.length <= max) return entries
  return entries.slice(entries.length - max)
}

export type AwardResult = {
  data: DataFile
  gainedXp: number
  gainedPoints: number
  totalPoints: number
  leveledUp: boolean
  newLevel: number
  newPerks: PerkDef[]
}

export function awardXp(
  data: DataFile,
  rawAmount: number,
  reason: XpLedgerEntry['reason'],
  activityDay: string
): AwardResult {
  if (rawAmount <= 0) {
    return {
      data,
      gainedXp: 0,
      gainedPoints: 0,
      totalPoints: data.gamification.rewardPoints,
      leveledUp: false,
      newLevel: deriveLevelProgress(data.gamification.totalXp).level,
      newPerks: [],
    }
  }

  const mult = getXpMultiplierFromXp(data.gamification.totalXp)
  const scaledRaw = rawAmount * XP_GLOBAL_MULTIPLIER
  const gained = Math.max(1, Math.floor(scaledRaw * mult))

  let g = touchStreak(data.gamification, activityDay)
  const beforeLevel = deriveLevelProgress(g.totalXp).level
  g = { ...g, totalXp: g.totalXp + gained }

  const entry: XpLedgerEntry = {
    id: randomUUID(),
    date: activityDay,
    amount: gained,
    reason,
  }
  const ledger = trimLedger([...(data.xpLedger ?? []), entry])

  const afterLevel = deriveLevelProgress(g.totalXp).level
  const levelUps = Math.max(0, afterLevel - beforeLevel)
  const pointsFromXp = Math.max(1, Math.floor(gained * POINTS_PER_XP))
  const pointsFromLevelUp = levelUps * LEVEL_UP_POINT_BONUS
  const gainedPoints = pointsFromXp + pointsFromLevelUp
  if (gainedPoints > 0) {
    g = { ...g, rewardPoints: g.rewardPoints + gainedPoints }
  }
  const newPerks: PerkDef[] = []
  if (afterLevel > beforeLevel) {
    for (let L = beforeLevel + 1; L <= afterLevel; L++) {
      for (const def of PERK_DEFINITIONS) {
        if (def.minLevel === L) newPerks.push(def)
      }
    }
  }

  const next: DataFile = {
    ...data,
    gamification: g,
    xpLedger: ledger,
  }

  return {
    data: next,
    gainedXp: gained,
    gainedPoints,
    totalPoints: g.rewardPoints,
    leveledUp: afterLevel > beforeLevel,
    newLevel: afterLevel,
    newPerks,
  }
}

/** 月曜始まりの「その週」のキーとして使う開始日を返す（ローカル） */
export function startOfWeekMonday(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export type MotivationBoard = {
  gamification: {
    totalXp: number
    rewardPoints: number
    level: number
    xpInLevel: number
    xpForNextLevel: number
    xpMultiplier: number
    streakDays: number
    longestStreak: number
    lastActivityDate?: string
    perks: { id: string; label: string }[]
  }
  weekly: {
    weekStart: string
    weekEnd: string
    xpGained: number
    tilCount: number
    workoutCount: number
    datedEventCount: number
    tasksCompleted: number
    tasksCreated: number
    goalsCreated: number
  }
}

export function buildMotivationBoard(data: DataFile): MotivationBoard {
  const g = data.gamification
  const prog = deriveLevelProgress(g.totalXp)
  const mult = getXpMultiplierFromXp(g.totalXp)
  const perkMeta = perksForTotalXp(g.totalXp).map((p) => ({ id: p.id, label: p.label }))

  const now = new Date()
  const ws = startOfWeekMonday(now)
  const we = new Date(ws)
  we.setDate(ws.getDate() + 6)
  const wsStr = isoDate(ws)
  const weStr = isoDate(we)

  const ledger = data.xpLedger ?? []
  const inWeek = ledger.filter((e) => e.date >= wsStr && e.date <= weStr)
  const xpGained = inWeek.reduce((s, e) => s + e.amount, 0)

  const tilCount = data.tils.filter((t) => t.date >= wsStr && t.date <= weStr).length
  const workoutCount = data.workouts.filter((w) => w.date >= wsStr && w.date <= weStr).length
  const datedEventCount = data.events.filter((e) => e.date && e.date >= wsStr && e.date <= weStr).length

  const tasksCompleted = inWeek.filter((e) => e.reason === 'task_complete').length
  const tasksCreated = inWeek.filter((e) => e.reason === 'task_create').length
  const goalsCreated = inWeek.filter((e) => e.reason === 'goal_create').length

  return {
    gamification: {
      totalXp: g.totalXp,
      rewardPoints: g.rewardPoints,
      level: prog.level,
      xpInLevel: prog.xpInLevel,
      xpForNextLevel: prog.xpForNextLevel,
      xpMultiplier: mult,
      streakDays: g.streakDays,
      longestStreak: g.longestStreak,
      lastActivityDate: g.lastActivityDate,
      perks: perkMeta,
    },
    weekly: {
      weekStart: wsStr,
      weekEnd: weStr,
      xpGained,
      tilCount,
      workoutCount,
      datedEventCount,
      tasksCompleted,
      tasksCreated,
      goalsCreated,
    },
  }
}
