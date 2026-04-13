const DB_NAME = 'sunyata-journal-assets'
const STORE_NAME = 'images'
const ASSET_PREFIX = 'asset:'

export function createJournalAssetRef(id) {
  return `${ASSET_PREFIX}${id}`
}

export function isJournalAssetRef(value) {
  return typeof value === 'string' && value.startsWith(ASSET_PREFIX)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function generateAssetId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

function openAssetDatabase() {
  if (!('indexedDB' in globalThis)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open asset database'))
  })
}

export async function saveJournalImageFile(file) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Only image uploads are supported')
  }

  const database = await openAssetDatabase()

  if (!database) {
    return readFileAsDataUrl(file)
  }

  const id = generateAssetId()

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Failed to store image'))

    store.put({
      id,
      blob: file,
      type: file.type,
      updatedAt: Date.now(),
    })
  })

  database.close()
  return createJournalAssetRef(id)
}

export async function resolveJournalImageSource(source) {
  if (!isJournalAssetRef(source)) {
    return {
      src: source,
      revoke() {},
    }
  }

  const database = await openAssetDatabase()

  if (!database) {
    return {
      src: '',
      revoke() {},
    }
  }

  const record = await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(source.slice(ASSET_PREFIX.length))

    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to read stored image'))
  })

  database.close()

  if (!record?.blob) {
    return {
      src: '',
      revoke() {},
    }
  }

  const objectUrl = URL.createObjectURL(record.blob)

  return {
    src: objectUrl,
    revoke() {
      URL.revokeObjectURL(objectUrl)
    },
  }
}
