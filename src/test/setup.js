import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

beforeEach(() => {
  window.localStorage.clear()
})
