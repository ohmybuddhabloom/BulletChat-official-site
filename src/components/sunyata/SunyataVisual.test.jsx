import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SunyataVisual from './SunyataVisual.jsx'
import { createSceneSnapshot } from '../../content/sunyata.js'

vi.mock('../../lib/journalAssetStore.js', () => ({
  resolveJournalImageSource: vi.fn(async (source) => ({
    src: source,
    revoke() {},
  })),
}))

describe('SunyataVisual', () => {
  it('renders the quote content inside the visual section', () => {
    const scene = createSceneSnapshot()

    render(
      <SunyataVisual
        sectionRef={null}
        ghostLabelRef={null}
        visual={scene.visual}
        quote={scene.quote}
      />,
    )

    expect(
      screen.getByRole('img', { name: scene.visual.imageAlt }),
    ).toBeInTheDocument()
    expect(screen.getByText(scene.quote.text)).toBeInTheDocument()
    expect(screen.getByText(scene.quote.studioLabel)).toBeInTheDocument()
    expect(screen.getByText(scene.quote.philosophyLabel)).toBeInTheDocument()
  })
})
