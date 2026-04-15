import {
  checkPortOpen,
  isProcessAlive,
  logFile,
  previewUrl,
  readPid,
} from './preview-runtime.mjs'

const pid = readPid()
const alive = isProcessAlive(pid)
const reachable = await checkPortOpen()

if (alive) {
  console.log(`preview 后台运行中: pid=${pid} url=${previewUrl}`)
  console.log(`日志文件: ${logFile}`)
  process.exit(0)
}

if (reachable) {
  console.log(`preview 可访问，但未由当前后台脚本托管: ${previewUrl}`)
  process.exit(0)
}

console.log('preview 当前未运行')
process.exit(1)
