export interface Goal {
  id: string
  title: string
  description: string
  createdAt: string // ISO date
  targetDate?: string // ISO date
}

export interface TIL {
  id: string
  date: string // ISO date (YYYY-MM-DD)
  title: string
  content: string
  link?: string
  goalId?: string
}

export interface Workout {
  id: string
  date: string // ISO date
  content: string
}

export interface EnjoymentEvent {
  id: string
  date?: string // ISO date (optional)
  title: string
  memo?: string
}

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string // ISO date
  status: TaskStatus
  createdAt: string // ISO date
  completionXpGranted?: boolean
}

export type LevelUpPayload = {
  level: number
  gainedXp: number
  gainedPoints: number
  totalPoints: number
  newPerks: { id: string; label: string }[]
}

export interface MotivationBoard {
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

export interface DaySummary {
  date: string
  hasTIL: boolean
  hasWorkout: boolean
  events: EnjoymentEvent[]
}
