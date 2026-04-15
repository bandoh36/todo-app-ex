export function getAPI() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI
  }
  throw new Error('electronAPI is only available in Electron')
}
