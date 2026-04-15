import {
  isProcessAlive,
  previewUrl,
  readPid,
  removePidFile,
} from './preview-runtime.mjs'

const pid = readPid()

if (!isProcessAlive(pid)) {
  removePidFile()
  console.log('preview 当前没有后台进程需要停止')
  process.exit(0)
}

process.kill(pid, 'SIGTERM')
removePidFile()
console.log(`preview 后台进程已停止: pid=${pid} url=${previewUrl}`)
