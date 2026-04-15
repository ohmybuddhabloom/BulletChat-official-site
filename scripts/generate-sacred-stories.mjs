import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const SOURCE_DIR = '/Users/kevin/Documents/obsidian/buddha story'
const OUTPUT_FILE = '/Users/kevin/Documents/官网buddha/BulletChat-official-site/src/content/sacredStories.js'

const STORIES = [
  {
    file: "Children of Scripture - 20 Years of Venerable Jixiang and Ci'en Buddhist Academy in Nepal.md",
    slug: 'children-of-scripture',
    kicker: 'Nepal Chronicle',
    shortTitle: 'Children of Scripture',
    location: 'Kathmandu, Nepal',
  },
  {
    file: 'Journey of Amethyst - From Nepalese Buddhist Wisdom to Deep Healing in Life.md',
    slug: 'journey-of-amethyst',
    kicker: 'Healing Matter',
    shortTitle: 'Journey of Amethyst',
    location: 'Kathmandu Valley',
  },
  {
    file: 'A Life in Thangka - The Journey of Prakash Khadgi.md',
    slug: 'a-life-in-thangka',
    kicker: 'Artist Lineage',
    shortTitle: 'A Life in Thangka',
    location: 'Kathmandu Valley',
  },
]

const IMAGE_FALLBACKS = {
  'a-life-in-thangka': [
    '/editor-assets/2026-04-14T20-18-46-668Z-DSC01789.jpg',
    '/editor-assets/2026-04-14T19-29-55-525Z-2026-04-15-03-29-40.png',
    '/editor-assets/2026-04-14T19-30-56-466Z-2026-04-15-03-30-43.png',
  ],
}

function normalizeTitle(filename) {
  return filename.replace(/\.md$/, '').replace(' - ', ': ')
}

function extractImages(line) {
  const matches = [...line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)]

  return matches.map((match, index) => ({
    alt: match[1] || `Story image ${index + 1}`,
    src: match[2],
  }))
}

function stripImagesFromLine(line) {
  return line.replace(/!\[[^\]]*\]\([^)]+\)/g, '').trim()
}

function cleanHeading(line) {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*/g, '')
    .trim()
}

function parseMarkdown(markdown) {
  const lines = markdown.split('\n')
  const blocks = []
  let paragraphBuffer = []

  const flushParagraph = () => {
    const text = paragraphBuffer.join(' ').trim()

    if (text) {
      blocks.push({ type: 'paragraph', text })
    }

    paragraphBuffer = []
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (!line || line === '---') {
      flushParagraph()
      continue
    }

    if (line.startsWith('![')) {
      flushParagraph()
      const images = extractImages(line)

      if (images.length === 1) {
        blocks.push({ type: 'image', ...images[0] })
      } else if (images.length > 1) {
        blocks.push({ type: 'gallery', images })
      }
      continue
    }

    if (line.startsWith('#')) {
      flushParagraph()
      blocks.push({ type: 'heading', text: cleanHeading(line) })
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      const items = []
      const galleryImages = []

      const pushListLine = (listLine) => {
        const rawItem = listLine.slice(2).trim()
        const cleanedItem = stripImagesFromLine(rawItem)

        if (cleanedItem) {
          items.push(cleanedItem)
        }

        const images = extractImages(rawItem)

        if (images.length) {
          galleryImages.push(...images)
        }
      }

      pushListLine(line)

      while (index + 1 < lines.length && lines[index + 1].trim().startsWith('- ')) {
        index += 1
        pushListLine(lines[index].trim())
      }

      if (items.length) {
        blocks.push({ type: 'list', items })
      }

      if (galleryImages.length === 1) {
        blocks.push({ type: 'image', ...galleryImages[0] })
      } else if (galleryImages.length > 1) {
        blocks.push({ type: 'gallery', images: galleryImages })
      }
      continue
    }

    paragraphBuffer.push(line)
  }

  flushParagraph()

  return blocks
}

function replaceBrokenImageSources(blocks, storySlug) {
  const fallbackPool = IMAGE_FALLBACKS[storySlug] ?? []
  let fallbackIndex = 0

  const nextFallback = () => {
    if (!fallbackPool.length) {
      return ''
    }

    const value = fallbackPool[fallbackIndex % fallbackPool.length]
    fallbackIndex += 1
    return value
  }

  return blocks.map((block) => {
    if (block.type === 'image' && block.src.includes('feishu.cn')) {
      return { ...block, src: nextFallback() }
    }

    if (block.type === 'gallery') {
      return {
        ...block,
        images: block.images.map((image) =>
          image.src.includes('feishu.cn')
            ? { ...image, src: nextFallback() }
            : image,
        ),
      }
    }

    return block
  })
}

function createStoryDefinition(config) {
  const filePath = path.join(SOURCE_DIR, config.file)
  const markdown = readFileSync(filePath, 'utf8')
  const blocks = replaceBrokenImageSources(parseMarkdown(markdown), config.slug)
  const firstParagraph = blocks.find((block) => block.type === 'paragraph')?.text ?? ''
  const firstImage = blocks.find((block) => block.type === 'image')
  const firstGallery = blocks.find((block) => block.type === 'gallery')
  const cardImage = firstGallery?.images?.[0]?.src ?? firstImage?.src ?? ''

  return {
    slug: config.slug,
    kicker: config.kicker,
    title: normalizeTitle(config.file),
    shortTitle: config.shortTitle,
    location: config.location,
    lead: firstParagraph,
    summary: firstParagraph,
    cardImage,
    blocks,
  }
}

const stories = STORIES.map(createStoryDefinition)

const output = `export const SACRED_STORIES = ${JSON.stringify(stories, null, 2)}

export const SACRED_STORIES_BY_SLUG = Object.fromEntries(
  SACRED_STORIES.map((story) => [story.slug, story]),
)

export function getStoryHref(slug) {
  return \`/?story=\${slug}\`
}
`

writeFileSync(OUTPUT_FILE, output)
console.log(`Generated sacred stories: ${OUTPUT_FILE}`)
