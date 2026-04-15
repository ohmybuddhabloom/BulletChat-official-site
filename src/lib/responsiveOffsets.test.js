import { describe, expect, it } from 'vitest'
import { createSceneSnapshot } from '../content/sunyata.js'
import {
  getResponsiveProfileForWidth,
  getProfiledFieldValue,
  MOBILE_LARGE_RESPONSIVE_PROFILE,
  MOBILE_MEDIUM_RESPONSIVE_PROFILE,
  MOBILE_SMALL_RESPONSIVE_PROFILE,
  materializeResponsiveOffsets,
  migrateLegacyPixelOffsets,
  percentToPixel,
  pixelToPercent,
  seedMobileResponsiveProfiles,
  setProfiledFieldValue,
  stripLegacyPixelOffsets,
} from './responsiveOffsets.js'

describe('responsiveOffsets', () => {
  it('migrates legacy pixel offsets into percentage offsets using measured section sizes', () => {
    const scene = createSceneSnapshot()
    scene.hero.copyX = 180
    scene.hero.copyY = -36
    scene.interlude.chatY = 24
    scene.journal.imageX = 120
    scene.quote.x = -96

    const migrated = migrateLegacyPixelOffsets(scene, {
      hero: { width: 1440, height: 900 },
      interlude: { width: 1200, height: 800 },
      journal: { width: 1280, height: 900 },
      quote: { width: 960, height: 700 },
    })

    expect(migrated.hero.copyXPercent).toBe(12.5)
    expect(migrated.hero.copyYPercent).toBe(-4)
    expect(migrated.interlude.chatYPercent).toBe(3)
    expect(migrated.journal.imageXPercent).toBe(9.375)
    expect(migrated.quote.xPercent).toBe(-10)
  })

  it('materializes percentage offsets back into render-time pixels', () => {
    const scene = createSceneSnapshot()
    scene.hero.copyXPercent = 12.5
    scene.hero.copyYPercent = -4
    scene.interlude.textXPercent = 5
    scene.interlude.chatYPercent = 3
    scene.journal.imageXPercent = 9.375
    scene.quote.xPercent = -10
    scene.quote.yPercent = 2

    const rendered = materializeResponsiveOffsets(scene, {
      hero: { width: 1440, height: 900 },
      interlude: { width: 1200, height: 800 },
      journal: { width: 1280, height: 900 },
      quote: { width: 960, height: 700 },
    })

    expect(rendered.hero.copyX).toBe(180)
    expect(rendered.hero.copyY).toBe(-36)
    expect(rendered.interlude.textX).toBe(60)
    expect(rendered.interlude.chatY).toBe(24)
    expect(rendered.journal.imageX).toBe(120)
    expect(rendered.quote.x).toBe(-96)
    expect(rendered.quote.y).toBe(14)
  })

  it('prefers profile-specific values when rendering a matched mobile profile', () => {
    const scene = createSceneSnapshot()
    scene.hero.copyXPercent = 12.5
    scene.hero.profiles = {
      [MOBILE_MEDIUM_RESPONSIVE_PROFILE]: {
        copyXPercent: 4,
      },
    }

    const rendered = materializeResponsiveOffsets(
      scene,
      {
        hero: { width: 1000, height: 800 },
      },
      MOBILE_MEDIUM_RESPONSIVE_PROFILE,
    )

    expect(rendered.hero.copyX).toBe(40)
  })

  it('removes legacy pixel fields once percentage offsets exist', () => {
    const scene = createSceneSnapshot()
    scene.hero.copyX = 180
    scene.hero.copyXPercent = 12.5
    scene.quote.x = -96
    scene.quote.xPercent = -10

    const stripped = stripLegacyPixelOffsets(scene)

    expect(stripped.hero).not.toHaveProperty('copyX')
    expect(stripped.quote).not.toHaveProperty('x')
    expect(stripped.hero.copyXPercent).toBe(12.5)
    expect(stripped.quote.xPercent).toBe(-10)
  })

  it('keeps percentage conversion math predictable', () => {
    expect(pixelToPercent(180, 1440)).toBe(12.5)
    expect(pixelToPercent(-24, 800)).toBe(-3)
    expect(percentToPixel(12.5, 1440)).toBe(180)
    expect(percentToPixel(-3, 800)).toBe(-24)
  })

  it('reads and writes mobile profile fields independently from desktop fields', () => {
    const section = {
      copyXPercent: 12.5,
      profiles: {
        [MOBILE_MEDIUM_RESPONSIVE_PROFILE]: {
          copyXPercent: 4,
        },
      },
    }

    expect(getProfiledFieldValue(section, 'copyXPercent', 'desktop')).toBe(12.5)
    expect(
      getProfiledFieldValue(
        section,
        'copyXPercent',
        MOBILE_MEDIUM_RESPONSIVE_PROFILE,
      ),
    ).toBe(4)

    const updated = setProfiledFieldValue(
      section,
      'copyXPercent',
      7.5,
      MOBILE_MEDIUM_RESPONSIVE_PROFILE,
    )

    expect(updated.copyXPercent).toBe(12.5)
    expect(updated.profiles[MOBILE_MEDIUM_RESPONSIVE_PROFILE].copyXPercent).toBe(
      7.5,
    )
  })

  it('seeds all mobile tiers and preserves the legacy mobile profile as standard mobile', () => {
    const scene = createSceneSnapshot()
    scene.hero.copyXPercent = 12.5
    scene.hero.profiles = {
      mobile: {
        copyXPercent: 6,
      },
    }

    const seeded = seedMobileResponsiveProfiles(scene)

    expect(seeded.hero.profiles[MOBILE_MEDIUM_RESPONSIVE_PROFILE].copyXPercent).toBe(
      6,
    )
    expect(seeded.hero.profiles[MOBILE_SMALL_RESPONSIVE_PROFILE].copyYPercent).toBe(
      10,
    )
    expect(seeded.visual.profiles[MOBILE_LARGE_RESPONSIVE_PROFILE].imageWidth).toBe(
      80,
    )
    expect(seeded.hero.profiles.mobile).toBeUndefined()
  })

  it('maps viewport widths into desktop, small, standard, and large mobile profiles', () => {
    expect(getResponsiveProfileForWidth(1200)).toBe('desktop')
    expect(getResponsiveProfileForWidth(375)).toBe(MOBILE_SMALL_RESPONSIVE_PROFILE)
    expect(getResponsiveProfileForWidth(390)).toBe(MOBILE_MEDIUM_RESPONSIVE_PROFILE)
    expect(getResponsiveProfileForWidth(430)).toBe(MOBILE_LARGE_RESPONSIVE_PROFILE)
  })
})
