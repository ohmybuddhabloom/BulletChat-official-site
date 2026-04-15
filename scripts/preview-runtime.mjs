import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(scriptDir, '..')
export const runtimeDir = path.join(projectRoot, '.omx', 'runtime')
export const pidFile = path.join(runtimeDir, 'preview.pid')
export const logFile = path.join(runtimeDir, 'preview.log')
export const previewHost = process.env.PREVIEW_HOST || '127.0.0.1'
export const previewPort = Number(process.env.PREVIEW_PORT || 4173)
export const previewUrl = `http://${previewHost}:${previewPort}/`

export function ensureRuntimeDir() {
  fs.mkdirSync(runtimeDir, { recursive: true })
}

export function readPid() {
  try {
    const rawPid = fs.readFileSync(pidFile, 'utf8').trim()
    const parsedPid = Number(rawPid)
    return Number.isInteger(parsedPid) ? parsedPid : null
  } catch {
    return null
  }
}

export function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false
  }

  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function removePidFile() {
  try {
    fs.unlinkSync(pidFile)
  } catch {
    // Ignore missing pid files.
  }
}

export function writePid(pid) {
  ensureRuntimeDir()
  fs.writeFileSync(pidFile, `${pid}\n`)
}

export function checkPortOpen(host = previewHost, port = previewPort) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    const finish = (result) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(1000)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}
