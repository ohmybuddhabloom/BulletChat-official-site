import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SunyataEditor from './SunyataEditor.jsx'
import { createSceneSnapshot } from '../../content/sunyata.js'

vi.mock('../../lib/journalAssetStore.js', () => ({
  isJournalAssetRef: vi.fn(
    (value) => typeof value === 'string' && value.startsWith('asset:'),
  ),
  saveJournalImageFile: vi.fn(async () => 'asset:uploaded-image'),
  resolveJournalImageSource: vi.fn(async (source) => ({
    src: source,
    revoke() {},
  })),
}))

function noop() {}

function renderEditor(overrides = {}) {
  const scene = createSceneSnapshot()
  const updateJournalItem = vi.fn()
  const updateVisual = vi.fn()

  render(
    <SunyataEditor
      editorOpen
      onToggle={noop}
      scene={scene}
      updateNavLogo={noop}
      updateNavLink={noop}
      updateHero={noop}
      updateInterlude={noop}
      updateBuddha={noop}
      updateCard={noop}
      updateJournal={noop}
      updateJournalLink={noop}
      updateJournalTheme={noop}
      updateJournalItem={updateJournalItem}
      updateVisual={updateVisual}
      updateQuote={noop}
      updateFooter={noop}
      onReset={noop}
      {...overrides}
    />,
  )

  return { updateJournalItem, updateVisual }
}

describe('SunyataEditor image uploads', () => {
  it('shows a journal background opacity control and only three journal card groups', () => {
    renderEditor()

    expect(screen.getByLabelText('期刊背景透明度')).toBeInTheDocument()
    expect(screen.getAllByText(/期刊卡片 /)).toHaveLength(3)
  })

  it('stores an uploaded foreground image as a journal asset reference', async () => {
    const { updateJournalItem } = renderEditor()
    const input = screen.getByLabelText('卡片 1 前景图 上传')
    const file = new File(['foreground'], 'foreground.png', { type: 'image/png' })

    fireEvent.change(input, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(updateJournalItem).toHaveBeenCalledWith(
        0,
        'cardUrl',
        'asset:uploaded-image',
      )
    })
  })

  it('stores an uploaded background image as a journal asset reference', async () => {
    const { updateJournalItem } = renderEditor()
    const input = screen.getByLabelText('卡片 2 背景图 上传')
    const file = new File(['background'], 'background.jpg', {
      type: 'image/jpeg',
    })

    fireEvent.change(input, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(updateJournalItem).toHaveBeenCalledWith(
        1,
        'backgroundUrl',
        'asset:uploaded-image',
      )
    })
  })

  it('stores an uploaded visual image as an asset reference', async () => {
    const { updateVisual } = renderEditor()
    const input = screen.getByLabelText('视觉图地址 上传')
    const file = new File(['visual'], 'visual.png', { type: 'image/png' })

    fireEvent.change(input, {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(updateVisual).toHaveBeenCalledWith(
        'imageSrc',
        'asset:uploaded-image',
      )
    })
  })
})
