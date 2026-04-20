import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export interface Goal {
  id: string
  title: string
  description: string
  createdAt: string
  targetDate?: string
}

export interface TIL {
  id: string
  date: string
  title: string
  content: string
  link?: string
  goalId?: string
}

export interface Workout {
  id: string
  date: string
  content: string
}

export interface EnjoymentEvent {
  id: string
  date?: string
  title: string
  memo?: string
}

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  status: TaskStatus
  createdAt: string
  /** TODO を完了にしたときの経験値は一度だけ */
  completionXpGranted?: boolean
}

export interface Gamification {
  totalXp: number
  rewardPoints: number
  pointModelVersion: number
  lastActivityDate?: string
  streakDays: number
  longestStreak: number
}

export type XpLedgerReason =
  | 'task_create'
  | 'task_complete'
  | 'til_create'
  | 'workout_create'
  | 'event_create'
  | 'goal_create'

export interface XpLedgerEntry {
  id: string
  date: string
  amount: number
  reason: XpLedgerReason
}

export interface DataFile {
  goals: Goal[]
  tils: TIL[]
  workouts: Workout[]
  events: EnjoymentEvent[]
  tasks: Task[]
  gamification: Gamification
  xpLedger?: XpLedgerEntry[]
}

const DEFAULT_GAMIFICATION: Gamification = {
  totalXp: 0,
  rewardPoints: 0,
  pointModelVersion: 2,
  streakDays: 0,
  longestStreak: 0,
}

const POINT_MODEL_VERSION = 2
const POINTS_PER_XP = 12
const LEVEL_UP_POINT_BONUS = 300

function xpToAdvanceFromLevel(level: number): number {
  return Math.max(48, Math.floor(52 * Math.pow(1.14, Math.max(0, level - 1))))
}

function deriveLevel(totalXp: number): number {
  let level = 1
  let remaining = totalXp
  while (true) {
    const need = xpToAdvanceFromLevel(level)
    if (remaining < need) return level
    remaining -= need
    level++
  }
}

function migratePoints(gamification: Gamification): Gamification {
  if (gamification.pointModelVersion >= POINT_MODEL_VERSION) return gamification

  const level = deriveLevel(gamification.totalXp)
  const pointsFromXp = Math.floor(gamification.totalXp * POINTS_PER_XP)
  const pointsFromLevelUps = Math.max(0, level - 1) * LEVEL_UP_POINT_BONUS

  return {
    ...gamification,
    rewardPoints: Math.max(gamification.rewardPoints, pointsFromXp + pointsFromLevelUps),
    pointModelVersion: POINT_MODEL_VERSION,
  }
}

export const freshDataFile = (): DataFile => ({
  goals: [],
  tils: [],
  workouts: [],
  events: [],
  tasks: [],
  gamification: { ...DEFAULT_GAMIFICATION },
  xpLedger: [],
})

const DATA_FILE = 'data.json'
const PROJECT_DATA_DIR = path.join(process.cwd(), 'data')
const LEGACY_USER_DATA_FILE = () => path.join(app.getPath('userData'), 'data', DATA_FILE)

const getDataDir = () => {
  const dataDir = PROJECT_DATA_DIR
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const currentDataFile = path.join(dataDir, DATA_FILE)
  const legacyDataFile = LEGACY_USER_DATA_FILE()
  if (!fs.existsSync(currentDataFile) && fs.existsSync(legacyDataFile)) {
    fs.copyFileSync(legacyDataFile, currentDataFile)
  }

  return dataDir
}

export const readData = (): DataFile => {
  const filePath = path.join(getDataDir(), DATA_FILE)
  if (!fs.existsSync(filePath)) return freshDataFile()
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<DataFile>
    const gIn = (parsed.gamification ?? {}) as Partial<Gamification>
    return {
      goals: parsed.goals ?? [],
      tils: parsed.tils ?? [],
      workouts: parsed.workouts ?? [],
      events: parsed.events ?? [],
      tasks: parsed.tasks ?? [],
      gamification: migratePoints({
        ...DEFAULT_GAMIFICATION,
        ...gIn,
        pointModelVersion: typeof gIn.pointModelVersion === 'number' ? gIn.pointModelVersion : 1,
      }),
      xpLedger: parsed.xpLedger ?? [],
    }
  } catch {
    return freshDataFile()
  }
}

export const writeData = (data: DataFile) => {
  const filePath = path.join(getDataDir(), DATA_FILE)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
