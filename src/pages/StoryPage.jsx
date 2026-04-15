import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { layout, prepare } from '@chenglou/pretext'
import NoiseOverlay from '../components/sunyata/NoiseOverlay.jsx'
import SunyataNav from '../components/sunyata/SunyataNav.jsx'
import { SACRED_STORIES } from '../content/sacredStories.js'

const STORY_MEDIA_LAYOUT_KEY = 'sacred-story-media-layout-v1'

function loadStoryMediaLayout() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORY_MEDIA_LAYOUT_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function renderInlineMarkdown(text) {
  const normalized = text.replace(/\u00a0/g, ' ')
  const tokens = normalized.split(/(\*\*.*?\*\*|_.*?_)/g).filter(Boolean)

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('_') && token.endsWith('_')) {
      return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>
    }

    return <span key={`${token}-${index}`}>{token}</span>
  })
}

function splitStoryTitle(title) {
  const separatorIndex = title.indexOf(':')

  if (separatorIndex === -1) {
    return { title, subtitle: '' }
  }

  return {
    title: title.slice(0, separatorIndex).trim(),
    subtitle: title.slice(separatorIndex + 1).trim(),
  }
}

function renderTextBlock(block, index) {
  if (block.type === 'paragraph') {
    return (
      <p key={`${block.type}-${index}`} className="story-block-paragraph">
        {renderInlineMarkdown(block.text)}
      </p>
    )
  }

  if (block.type === 'quote') {
    return (
      <blockquote key={`${block.type}-${index}`} className="story-block-quote">
        {renderInlineMarkdown(block.text)}
      </blockquote>
    )
  }

  if (block.type === 'list') {
    return (
      <ul key={`${block.type}-${index}`} className="story-block-list">
        {block.items.map((item) => (
          <li key={item}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    )
  }

  return null
}

function DraggableStoryMedia({
  mediaKey,
  editable,
  offset,
  onOffsetChange,
  children,
}) {
  const dragStateRef = useRef(null)

  useEffect(() => {
    if (!editable) {
      return undefined
    }

    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current

      if (!dragState) {
        return
      }

      onOffsetChange(mediaKey, {
        x: dragState.startOffset.x + (event.clientX - dragState.pointerX),
        y: dragState.startOffset.y + (event.clientY - dragState.pointerY),
      })
    }

    const handlePointerUp = () => {
      dragStateRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [editable, mediaKey, onOffsetChange])

  const handlePointerDown = (event) => {
    if (!editable) {
      return
    }

    dragStateRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startOffset: offset,
    }
  }

  return (
    <div
      className={`story-draggable-media${editable ? ' is-editable' : ''}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0px)` }}
      onPointerDown={handlePointerDown}
    >
      {editable ? <span className="story-media-handle">Drag</span> : null}
      {children}
    </div>
  )
}

function renderMediaBlock(block, index, editable, getOffset, onOffsetChange) {
  if (block.type === 'image') {
    return (
      <DraggableStoryMedia
        key={`${block.type}-${index}`}
        mediaKey={`media-${index}`}
        editable={editable}
        offset={getOffset(`media-${index}`)}
        onOffsetChange={onOffsetChange}
      >
        <figure className="story-block-image">
          <img src={block.src} alt={block.alt} loading="lazy" />
        </figure>
      </DraggableStoryMedia>
    )
  }

  if (block.type === 'gallery') {
    return (
      <div
        key={`${block.type}-${index}`}
        className={`story-block-gallery story-gallery-count-${Math.min(
          block.images.length,
          3,
        )}`}
      >
        {block.images.map((image, imageIndex) => (
          <DraggableStoryMedia
            key={image.src}
            mediaKey={`media-${index}-${imageIndex}`}
            editable={editable}
            offset={getOffset(`media-${index}-${imageIndex}`)}
            onOffsetChange={onOffsetChange}
          >
            <figure className="story-block-image">
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          </DraggableStoryMedia>
        ))}
      </div>
    )
  }

  return null
}

function groupStorySections(blocks) {
  const sections = []
  let currentSection = {
    heading: '',
    blocks: [],
  }

  const pushSection = () => {
    if (
      currentSection.heading ||
      currentSection.blocks.length
    ) {
      sections.push(currentSection)
    }
  }

  for (const block of blocks) {
    if (block.type === 'heading') {
      pushSection()
      currentSection = {
        heading: block.text,
        blocks: [],
      }
      continue
    }

    currentSection.blocks.push(block)
  }

  pushSection()
  return sections
}

function normalizeSectionBlocks(blocks) {
  const normalized = []

  for (const block of blocks) {
    const previous = normalized[normalized.length - 1]

    if (block.type === 'list' && previous?.type === 'list') {
      previous.items.push(...block.items)
      continue
    }

    normalized.push(
      block.type === 'list'
        ? { ...block, items: [...block.items] }
        : block,
    )
  }

  return normalized
}

function buildStoryFlow(blocks) {
  const flow = []
  const normalizedBlocks = normalizeSectionBlocks(blocks)
  let currentTextGroup = []

  const flushTextGroup = () => {
    if (currentTextGroup.length) {
      flow.push({ type: 'text', blocks: currentTextGroup })
      currentTextGroup = []
    }
  }

  for (const block of normalizedBlocks) {
    if (block.type === 'image' || block.type === 'gallery') {
      flushTextGroup()
      flow.push({ type: 'media', block })
      continue
    }

    if (block.type === 'heading') {
      flushTextGroup()
      flow.push({ type: 'heading', text: block.text })
      continue
    }

    currentTextGroup.push(block)
  }

  flushTextGroup()
  return flow
}

function StoryTextGroup({ blocks }) {
  const density = useMemo(() => {
    const text = blocks
      .map((block) =>
        block.type === 'list' ? block.items.join(' ') : block.text ?? '',
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) {
      return 'media'
    }

    try {
      const prepared = prepare(text, '400 16px Inter')
      const stats = layout(prepared, 480, 30)

      if (stats.lineCount >= 12) {
        return 'dense'
      }

      if (stats.lineCount <= 5) {
        return 'airy'
      }

      return 'balanced'
    } catch {
      return 'balanced'
    }
  }, [blocks])

  return (
    <div className={`story-flow-copy is-${density}`}>
      {blocks.map((block, blockIndex) => renderTextBlock(block, blockIndex))}
    </div>
  )
}

function StoryFlowItem({
  item,
  index,
  editable,
  getOffset,
  onOffsetChange,
}) {
  if (item.type === 'heading') {
    return <h2 className="story-block-heading">{item.text}</h2>
  }

  if (item.type === 'text') {
    return <StoryTextGroup blocks={item.blocks} />
  }

  return (
    <div className={`story-flow-media${index % 2 === 0 ? ' is-wide' : ''}`}>
      {renderMediaBlock(item.block, index, editable, getOffset, onOffsetChange)}
    </div>
  )
}

function StoryPage({ nav, story }) {
  const sections = groupStorySections(story.blocks)
  const { title, subtitle } = splitStoryTitle(story.title)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [mediaLayout, setMediaLayout] = useState(loadStoryMediaLayout)
  const storyFlow = sections.flatMap((section) => [
    { type: 'heading', text: section.heading },
    ...buildStoryFlow(section.blocks),
  ])
  const titleMetrics = useMemo(() => {
    try {
      const prepared = prepare(title, '400 42px Playfair Display')
      return layout(prepared, 720, 48)
    } catch {
      return { lineCount: 2 }
    }
  }, [title])

  useEffect(() => {
    window.localStorage.setItem(STORY_MEDIA_LAYOUT_KEY, JSON.stringify(mediaLayout))
  }, [mediaLayout])

  const handleMediaOffsetChange = useCallback((mediaKey, nextOffset) => {
    setMediaLayout((current) => ({
      ...current,
      [story.slug]: {
        ...(current[story.slug] ?? {}),
        [mediaKey]: nextOffset,
      },
    }))
  }, [story.slug])

  const getMediaOffset = useCallback((mediaKey) => {
    const storyOffsets = mediaLayout[story.slug] ?? {}
    return storyOffsets[mediaKey] ?? { x: 0, y: 0 }
  }, [mediaLayout, story.slug])

  const resetStoryMediaLayout = () => {
    setMediaLayout((current) => ({
      ...current,
      [story.slug]: {},
    }))
  }

  return (
    <main className="story-page">
      <div className="void-bg" aria-hidden="true" />
      <NoiseOverlay />
      <SunyataNav nav={nav} stories={SACRED_STORIES} currentStorySlug={story.slug} />

      <div className="story-shell">
        <header
          className={`story-header${
            titleMetrics.lineCount >= 3 ? ' is-compact' : ''
          }`}
        >
          <div className="story-editor-actions">
            <button
              type="button"
              className="story-editor-button"
              onClick={() => setImageEditorOpen((current) => !current)}
            >
              {imageEditorOpen ? '完成编辑' : '编辑图片'}
            </button>
            {imageEditorOpen ? (
              <button
                type="button"
                className="story-editor-button is-ghost"
                onClick={resetStoryMediaLayout}
              >
                重置位置
              </button>
            ) : null}
          </div>
          <a href="/#sanctuary" className="story-back-link">
            Return to journal
          </a>
          <span className="story-kicker">{story.kicker}</span>
          <div className="story-title-group">
            <h1 className="story-title">{title}</h1>
            {subtitle ? <p className="story-subtitle">{subtitle}</p> : null}
          </div>
          <div className="story-meta">
            <span>{story.location}</span>
          </div>
        </header>

        <section className="story-body">
          <article className="story-article">
            {storyFlow.map((item, index) => (
              <StoryFlowItem
                key={`${item.type}-${index}`}
                item={item}
                index={index}
                editable={imageEditorOpen}
                getOffset={getMediaOffset}
                onOffsetChange={handleMediaOffsetChange}
              />
            ))}
          </article>
        </section>
      </div>
    </main>
  )
}

export default StoryPage
