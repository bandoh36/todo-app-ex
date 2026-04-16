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
}

export interface DataFile {
  goals: Goal[]
  tils: TIL[]
  workouts: Workout[]
  events: EnjoymentEvent[]
  tasks: Task[]
}

const DEFAULT_DATA: DataFile = {
  goals: [],
  tils: [],
  workouts: [],
  events: [],
  tasks: [],
}

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
  if (!fs.existsSync(filePath)) return { ...DEFAULT_DATA }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as DataFile
    return {
      goals: parsed.goals ?? [],
      tils: parsed.tils ?? [],
      workouts: parsed.workouts ?? [],
      events: parsed.events ?? [],
      tasks: parsed.tasks ?? [],
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

export const writeData = (data: DataFile) => {
  const filePath = path.join(getDataDir(), DATA_FILE)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
