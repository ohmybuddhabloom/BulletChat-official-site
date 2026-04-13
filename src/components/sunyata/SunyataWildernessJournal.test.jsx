import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SunyataWildernessJournal from './SunyataWildernessJournal.jsx'
import { createSceneSnapshot } from '../../content/sunyata.js'

vi.mock('../../lib/journalAssetStore.js', () => ({
  resolveJournalImageSource: vi.fn(async (source) => ({
    src: source,
    revoke() {},
  })),
}))

describe('SunyataWildernessJournal', () => {
  it('does not render the request access form anymore', () => {
    const scene = createSceneSnapshot()

    render(<SunyataWildernessJournal journal={scene.journal} />)

    expect(
      screen.queryByTestId('journal-request-access'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText(scene.journal.requestPlaceholder),
    ).not.toBeInTheDocument()
  })

  it('applies the journal background color and opacity variables', () => {
    const scene = createSceneSnapshot()
    scene.journal.theme.base = '#123456'
    scene.journal.theme.overlayOpacity = 54

    render(<SunyataWildernessJournal journal={scene.journal} />)

    expect(screen.getByTestId('wilderness-journal-section')).toHaveStyle({
      '--journal-bg': '#123456',
      '--journal-overlay-opacity': '0.54',
    })
  })
})
