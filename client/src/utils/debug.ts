export const debug = (...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.log('[DEBUG]', ...args)
  }
}

export const err = (...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.error('[ERROR]', ...args)
  }
}
