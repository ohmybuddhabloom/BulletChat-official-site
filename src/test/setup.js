import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

function createMemoryStorage() {
  let store = {}

  return {
    getItem(key) {
      return Object.hasOwn(store, key) ? store[key] : null
    },
    setItem(key, value) {
      store[key] = String(value)
    },
    removeItem(key) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
}

beforeEach(() => {
  if (
    !window.localStorage ||
    typeof window.localStorage.clear !== 'function' ||
    typeof window.localStorage.getItem !== 'function'
  ) {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
  }

  window.localStorage.clear()
})
