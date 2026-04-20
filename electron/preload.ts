import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  goals: {
    list: () => ipcRenderer.invoke('goals:list'),
    get: (id: string) => ipcRenderer.invoke('goals:get', id),
    create: (goal: { title: string; description: string; targetDate?: string }) =>
      ipcRenderer.invoke('goals:create', goal),
    update: (id: string, updates: { title?: string; description?: string; targetDate?: string }) =>
      ipcRenderer.invoke('goals:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('goals:delete', id),
  },
  tils: {
    list: () => ipcRenderer.invoke('tils:list'),
    get: (id: string) => ipcRenderer.invoke('tils:get', id),
    create: (til: { date: string; title: string; content: string; link?: string; goalId?: string }) =>
      ipcRenderer.invoke('tils:create', til),
    update: (
      id: string,
      updates: { date?: string; title?: string; content?: string; link?: string; goalId?: string }
    ) => ipcRenderer.invoke('tils:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('tils:delete', id),
  },
  workouts: {
    list: () => ipcRenderer.invoke('workouts:list'),
    get: (id: string) => ipcRenderer.invoke('workouts:get', id),
    create: (workout: { date: string; content: string }) =>
      ipcRenderer.invoke('workouts:create', workout),
    update: (id: string, updates: { date?: string; content?: string }) =>
      ipcRenderer.invoke('workouts:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('workouts:delete', id),
  },
  events: {
    list: () => ipcRenderer.invoke('events:list'),
    get: (id: string) => ipcRenderer.invoke('events:get', id),
    create: (ev: { date?: string; title: string; memo?: string }) =>
      ipcRenderer.invoke('events:create', ev),
    update: (id: string, updates: { date?: string; title?: string; memo?: string }) =>
      ipcRenderer.invoke('events:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('events:delete', id),
  },
  tasks: {
    list: () => ipcRenderer.invoke('tasks:list'),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    create: (task: {
      title: string
      description?: string
      dueDate?: string
      status: 'todo' | 'doing' | 'done'
    }) => ipcRenderer.invoke('tasks:create', task),
    update: (
      id: string,
      updates: {
        title?: string
        description?: string
        dueDate?: string
        status?: 'todo' | 'doing' | 'done'
      }
    ) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
  },
  calendar: {
    monthSummary: (year: number, month: number) =>
      ipcRenderer.invoke('calendar:monthSummary', year, month),
  },
  stats: {
    motivationBoard: () => ipcRenderer.invoke('stats:motivationBoard'),
  },
  gamification: {
    onLevelUp: (handler: (payload: {
      level: number
      gainedXp: number
      gainedPoints: number
      totalPoints: number
      newPerks: { id: string; label: string }[]
    }) => void) => {
      const channel = 'gamification:level-up'
      const wrapped = (
        _e: unknown,
        payload: {
          level: number
          gainedXp: number
          gainedPoints: number
          totalPoints: number
          newPerks: { id: string; label: string }[]
        },
      ) => handler(payload)
      ipcRenderer.on(channel, wrapped)
      return () => ipcRenderer.removeListener(channel, wrapped)
    },
  },
})
