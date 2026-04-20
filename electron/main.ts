import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import {
  readData,
  writeData,
  type Goal,
  type TIL,
  type Workout,
  type EnjoymentEvent,
  type Task,
} from './store'
import {
  awardXp,
  RAW_XP,
  todayStr,
  buildMotivationBoard,
  type AwardResult,
} from './gamification'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function saveAfterAward(r: AwardResult) {
  writeData(r.data)
  if (r.leveledUp && mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('gamification:level-up', {
      level: r.newLevel,
      gainedXp: r.gainedXp,
      gainedPoints: r.gainedPoints,
      totalPoints: r.totalPoints,
      newPerks: r.newPerks.map((p) => ({ id: p.id, label: p.label })),
    })
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

ipcMain.handle('ping', () => 'pong')

// Goals
ipcMain.handle('goals:list', () => readData().goals)
ipcMain.handle('goals:get', (_e, id: string) => readData().goals.find((g) => g.id === id) ?? null)
ipcMain.handle('goals:create', (_e, goal: Omit<Goal, 'id' | 'createdAt'>) => {
  const data = readData()
  const newGoal: Goal = {
    ...goal,
    id: randomUUID(),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  data.goals.push(newGoal)
  const r = awardXp(data, RAW_XP.goal_create, 'goal_create', todayStr())
  saveAfterAward(r)
  return newGoal
})
ipcMain.handle('goals:update', (_e, id: string, updates: Partial<Goal>) => {
  const data = readData()
  const i = data.goals.findIndex((g) => g.id === id)
  if (i === -1) return null
  data.goals[i] = { ...data.goals[i], ...updates }
  writeData(data)
  return data.goals[i]
})
ipcMain.handle('goals:delete', (_e, id: string) => {
  const data = readData()
  data.goals = data.goals.filter((g) => g.id !== id)
  data.tils = data.tils.map((t) => (t.goalId === id ? { ...t, goalId: undefined } : t))
  writeData(data)
  return true
})

// TIL
ipcMain.handle('tils:list', () => readData().tils)
ipcMain.handle('tils:get', (_e, id: string) => readData().tils.find((t) => t.id === id) ?? null)
ipcMain.handle('tils:create', (_e, til: Omit<TIL, 'id'>) => {
  const data = readData()
  const newTil: TIL = { ...til, id: randomUUID() }
  data.tils.push(newTil)
  const r = awardXp(data, RAW_XP.til_create, 'til_create', todayStr())
  saveAfterAward(r)
  return newTil
})
ipcMain.handle('tils:update', (_e, id: string, updates: Partial<TIL>) => {
  const data = readData()
  const i = data.tils.findIndex((t) => t.id === id)
  if (i === -1) return null
  data.tils[i] = { ...data.tils[i], ...updates }
  writeData(data)
  return data.tils[i]
})
ipcMain.handle('tils:delete', (_e, id: string) => {
  const data = readData()
  data.tils = data.tils.filter((t) => t.id !== id)
  writeData(data)
  return true
})

// Workouts
ipcMain.handle('workouts:list', () => readData().workouts)
ipcMain.handle('workouts:get', (_e, id: string) =>
  readData().workouts.find((w) => w.id === id) ?? null
)
ipcMain.handle('workouts:create', (_e, workout: Omit<Workout, 'id'>) => {
  const data = readData()
  const newWorkout: Workout = { ...workout, id: randomUUID() }
  data.workouts.push(newWorkout)
  const r = awardXp(data, RAW_XP.workout_create, 'workout_create', todayStr())
  saveAfterAward(r)
  return newWorkout
})
ipcMain.handle('workouts:update', (_e, id: string, updates: Partial<Workout>) => {
  const data = readData()
  const i = data.workouts.findIndex((w) => w.id === id)
  if (i === -1) return null
  data.workouts[i] = { ...data.workouts[i], ...updates }
  writeData(data)
  return data.workouts[i]
})
ipcMain.handle('workouts:delete', (_e, id: string) => {
  const data = readData()
  data.workouts = data.workouts.filter((w) => w.id !== id)
  writeData(data)
  return true
})

// Enjoyment events
ipcMain.handle('events:list', () => readData().events)
ipcMain.handle('events:get', (_e, id: string) =>
  readData().events.find((e) => e.id === id) ?? null
)
ipcMain.handle('events:create', (_e, ev: Omit<EnjoymentEvent, 'id'>) => {
  const data = readData()
  const newEv: EnjoymentEvent = { ...ev, id: randomUUID() }
  data.events.push(newEv)
  const r = awardXp(data, RAW_XP.event_create, 'event_create', todayStr())
  saveAfterAward(r)
  return newEv
})
ipcMain.handle('events:update', (_e, id: string, updates: Partial<EnjoymentEvent>) => {
  const data = readData()
  const i = data.events.findIndex((e) => e.id === id)
  if (i === -1) return null
  data.events[i] = { ...data.events[i], ...updates }
  writeData(data)
  return data.events[i]
})
ipcMain.handle('events:delete', (_e, id: string) => {
  const data = readData()
  data.events = data.events.filter((e) => e.id !== id)
  writeData(data)
  return true
})

// Tasks
ipcMain.handle('tasks:list', () => readData().tasks)
ipcMain.handle('tasks:get', (_e, id: string) => readData().tasks.find((t) => t.id === id) ?? null)
ipcMain.handle('tasks:create', (_e, task: Omit<Task, 'id' | 'createdAt'>) => {
  const data = readData()
  const newTask: Task = {
    ...task,
    id: randomUUID(),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  data.tasks.push(newTask)
  const r = awardXp(data, RAW_XP.task_create, 'task_create', todayStr())
  saveAfterAward(r)
  return newTask
})
ipcMain.handle('tasks:update', (_e, id: string, updates: Partial<Task>) => {
  const data = readData()
  const i = data.tasks.findIndex((t) => t.id === id)
  if (i === -1) return null
  const prev = data.tasks[i]
  data.tasks[i] = { ...prev, ...updates }

  if (updates.status === 'done' && prev.status !== 'done' && !prev.completionXpGranted) {
    data.tasks[i] = { ...data.tasks[i], completionXpGranted: true }
    const r = awardXp(data, RAW_XP.task_complete, 'task_complete', todayStr())
    saveAfterAward(r)
    const out = r.data.tasks.find((t) => t.id === id)
    return out ?? null
  }

  writeData(data)
  const out = data.tasks.find((t) => t.id === id)
  return out ?? null
})
ipcMain.handle('tasks:delete', (_e, id: string) => {
  const data = readData()
  data.tasks = data.tasks.filter((t) => t.id !== id)
  writeData(data)
  return true
})

ipcMain.handle('stats:motivationBoard', () => buildMotivationBoard(readData()))

// Calendar: day summaries for a month (YYYY-MM)
ipcMain.handle('calendar:monthSummary', (_e, year: number, month: number) => {
  const data = readData()
  const daysInMonth = new Date(year, month, 0).getDate()
  const result: {
    date: string
    hasTIL: boolean
    hasWorkout: boolean
    eventTitles: string[]
    tilTitles: string[]
    workoutContents: string[]
  }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const tilTitles = data.tils.filter((t) => t.date === dateStr).map((t) => t.title)
    const workoutContents = data.workouts.filter((w) => w.date === dateStr).map((w) => w.content)
    const eventTitles = data.events.filter((e) => e.date === dateStr).map((e) => e.title)
    result.push({
      date: dateStr,
      hasTIL: tilTitles.length > 0,
      hasWorkout: workoutContents.length > 0,
      eventTitles,
      tilTitles,
      workoutContents,
    })
  }
  return result
})
