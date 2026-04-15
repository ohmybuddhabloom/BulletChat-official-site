import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import {
  checkPortOpen,
  ensureRuntimeDir,
  isProcessAlive,
  logFile,
  previewHost,
  previewPort,
  previewUrl,
  projectRoot,
  readPid,
  removePidFile,
  writePid,
} from './preview-runtime.mjs'

const existingPid = readPid()

if (isProcessAlive(existingPid)) {
  console.log(`preview 已在后台运行: pid=${existingPid} url=${previewUrl}`)
  process.exit(0)
}

removePidFile()

if (await checkPortOpen()) {
  console.log(`preview 已可访问，但不是当前守护进程接管: ${previewUrl}`)
  process.exit(0)
}

ensureRuntimeDir()
fs.mkdirSync(path.dirname(logFile), { recursive: true })
const output = fs.openSync(logFile, 'a')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const child = spawn(
  npmCommand,
  ['run', 'preview', '--', '--host', previewHost, '--port', String(previewPort)],
  {
    cwd: projectRoot,
    detached: true,
    stdio: ['ignore', output, output],
    env: process.env,
  },
)

child.unref()
writePid(child.pid)

console.log(`preview 已切到后台常驻模式: pid=${child.pid} url=${previewUrl}`)
console.log(`日志文件: ${logFile}`)
