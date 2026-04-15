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
  it('renders the quote content as an overlay inside the visual anchor', () => {
    const scene = createSceneSnapshot()
    scene.visual.imageX = 7.5
    scene.quote.x = 48
    scene.quote.y = -24
    scene.donation.layout = {
      copyWidthPercent: 40,
      topSpacing: 118,
      gap: 36,
      cardRadius: 24,
    }
    scene.donation = {
      ...scene.donation,
      kicker: 'Circle of Giving',
      note: 'Offer a small blessing to help the app take root.',
      emailPlaceholder: 'your@email.com',
      actionLabel: 'Support',
      successMessage: 'Donation link reserved.',
      tiers: [
        { amount: '0.99', label: '$0.99' },
        { amount: '5.99', label: '$5.99' },
        { amount: '12.99', label: '$12.99' },
      ],
    }

    const { container } = render(
      <SunyataVisual
        sectionRef={null}
        ghostLabelRef={null}
        visual={scene.visual}
        quote={scene.quote}
        donation={scene.donation}
        quoteThemeColor="#20352c"
      />,
    )

    expect(
      screen.getByRole('img', { name: scene.visual.imageAlt }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: scene.visual.imageAlt }),
    ).toHaveStyle('transform: translate3d(7.5%, 0px, 0px)')

    const quoteOverlay = screen.getByTestId('visual-quote-overlay')
    expect(screen.getByText(scene.quote.text)).toBeInTheDocument()
    expect(screen.getByText(scene.quote.studioLabel)).toBeInTheDocument()
    expect(screen.getByText(scene.quote.philosophyLabel)).toBeInTheDocument()
    expect(quoteOverlay).toHaveStyle('transform: translate3d(48px, -24px, 0px)')
    expect(quoteOverlay).toHaveStyle(`max-width: ${scene.quote.maxWidth}px`)
    expect(quoteOverlay.closest('.visual-anchor')).not.toBeNull()
    expect(container.querySelector('.visual-quote-wrap')).toBe(quoteOverlay)
    expect(screen.getByTestId('donation-shell')).toHaveStyle('--donation-copy-width: 40%')
    expect(screen.getByTestId('donation-shell')).toHaveStyle('--donation-top-spacing: 118px')
    expect(screen.getByTestId('donation-shell')).toHaveStyle('--donation-gap: 36px')
    expect(screen.getByTestId('donation-shell')).toHaveStyle('--donation-card-radius: 24px')
  })

  it('renders the donation section below the quote as an editorial offering layout', () => {
    const scene = createSceneSnapshot()
    scene.donation = {
      ...scene.donation,
      eyebrow: 'Sacred Offering',
      heading: 'Manifest Compassion Through Dana',
      kicker: 'Circle of Giving',
      note: 'Offer a small blessing to help the app take root.',
      panelNote: 'Every contribution ripples outward, bringing light and peace to the Sangha.',
      emailPlaceholder: 'your@email.com',
      customPlaceholder: 'Custom',
      actionLabel: 'Support',
      successMessage: 'Donation link reserved.',
      supportNote: 'Your offering supports the maintenance of this digital sanctuary.',
      tiers: [
        { amount: '0.99', label: '$0.99' },
        { amount: '5.99', label: '$5.99' },
        { amount: '12.99', label: '$12.99' },
      ],
      gallery: scene.donation.gallery,
    }

    render(
      <SunyataVisual
        sectionRef={null}
        ghostLabelRef={null}
        visual={scene.visual}
        quote={scene.quote}
        donation={scene.donation}
        quoteThemeColor="#20352c"
      />,
    )

    expect(screen.getByText('Manifest Compassion Through Dana')).toBeInTheDocument()
    expect(screen.getByText(scene.donation.note)).toBeInTheDocument()
    expect(screen.getByText('Sacred Offering')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$0.99' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$5.99' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$12.99' })).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(scene.donation.emailPlaceholder),
    ).toBeInTheDocument()
    expect(screen.getByText('Bodhi Seed Mala')).toBeInTheDocument()
    expect(screen.getByText('Lapis Wisdom')).toBeInTheDocument()
    expect(screen.queryByText('Onyx Silence')).not.toBeInTheDocument()
    expect(screen.queryByText('Lotus Heart')).not.toBeInTheDocument()
  })
})
