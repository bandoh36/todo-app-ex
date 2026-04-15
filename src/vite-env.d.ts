/// <reference types="vite/client" />

import type { Goal, TIL, Workout, EnjoymentEvent, Task, TaskStatus } from './types'

interface ElectronAPI {
  ping: () => Promise<string>
  goals: {
    list: () => Promise<Goal[]>
    get: (id: string) => Promise<Goal | null>
    create: (goal: { title: string; description: string; targetDate?: string }) => Promise<Goal>
    update: (
      id: string,
      updates: { title?: string; description?: string; targetDate?: string }
    ) => Promise<Goal | null>
    delete: (id: string) => Promise<boolean>
  }
  tils: {
    list: () => Promise<TIL[]>
    get: (id: string) => Promise<TIL | null>
    create: (til: {
      date: string
      title: string
      content: string
      link?: string
      goalId?: string
    }) => Promise<TIL>
    update: (
      id: string,
      updates: {
        date?: string
        title?: string
        content?: string
        link?: string
        goalId?: string
      }
    ) => Promise<TIL | null>
    delete: (id: string) => Promise<boolean>
  }
  workouts: {
    list: () => Promise<Workout[]>
    get: (id: string) => Promise<Workout | null>
    create: (workout: { date: string; content: string }) => Promise<Workout>
    update: (id: string, updates: { date?: string; content?: string }) => Promise<Workout | null>
    delete: (id: string) => Promise<boolean>
  }
  events: {
    list: () => Promise<EnjoymentEvent[]>
    get: (id: string) => Promise<EnjoymentEvent | null>
    create: (ev: { date: string; title: string; memo?: string }) => Promise<EnjoymentEvent>
    update: (
      id: string,
      updates: { date?: string; title?: string; memo?: string }
    ) => Promise<EnjoymentEvent | null>
    delete: (id: string) => Promise<boolean>
  }
  tasks: {
    list: () => Promise<Task[]>
    get: (id: string) => Promise<Task | null>
    create: (task: {
      title: string
      description?: string
      dueDate?: string
      status: TaskStatus
    }) => Promise<Task>
    update: (
      id: string,
      updates: {
        title?: string
        description?: string
        dueDate?: string
        status?: TaskStatus
      }
    ) => Promise<Task | null>
    delete: (id: string) => Promise<boolean>
  }
  calendar: {
    monthSummary: (
      year: number,
      month: number
    ) => Promise<
      {
        date: string
        hasTIL: boolean
        hasWorkout: boolean
        eventTitles: string[]
        tilTitles: string[]
        workoutContents: string[]
      }[]
    >
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
