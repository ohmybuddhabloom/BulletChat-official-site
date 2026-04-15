import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SunyataFooter from './SunyataFooter.jsx'
import { createSceneSnapshot } from '../../content/sunyata.js'

describe('SunyataFooter', () => {
  it('renders the footer heading and cta without copyright text', () => {
    const scene = createSceneSnapshot()

    render(<SunyataFooter footer={scene.footer} />)

    expect(
      screen.getByRole('heading', {
        name: /Seek and\s*it is given/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: scene.footer.ctaLabel }),
    ).toBeInTheDocument()
  })
})
