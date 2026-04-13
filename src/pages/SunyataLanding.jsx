import { useEffect, useRef, useState } from 'react'
import NoiseOverlay from '../components/sunyata/NoiseOverlay.jsx'
import ScrollVideoBackground from '../components/sunyata/ScrollVideoBackground.jsx'
import SunyataCards from '../components/sunyata/SunyataCards.jsx'
import SunyataArchive from '../components/sunyata/SunyataArchive.jsx'
import SunyataEditor from '../components/sunyata/SunyataEditor.jsx'
import SunyataFooter from '../components/sunyata/SunyataFooter.jsx'
import SunyataHero from '../components/sunyata/SunyataHero.jsx'
import SunyataInterlude from '../components/sunyata/SunyataInterlude.jsx'
import SunyataNav from '../components/sunyata/SunyataNav.jsx'
import SunyataVisual from '../components/sunyata/SunyataVisual.jsx'
import SunyataWildernessJournal from '../components/sunyata/SunyataWildernessJournal.jsx'
import {
  MIGRATION_FLAG_KEY,
  STORAGE_KEY,
  createRecoveredLegacyScene,
  createSceneSnapshot,
  isSceneDefaultLike,
  normalizeJournalItems,
} from '../content/sunyata.js'

function mergeScene(fallback, parsed) {
  return {
    ...fallback,
    ...parsed,
    nav: {
      ...fallback.nav,
      ...parsed.nav,
      links: parsed.nav?.links ?? fallback.nav.links,
    },
    hero: {
      ...fallback.hero,
      ...parsed.hero,
    },
    interlude: {
      ...fallback.interlude,
      ...parsed.interlude,
    },
    buddha: {
      ...fallback.buddha,
      ...parsed.buddha,
    },
    cards: parsed.cards ?? fallback.cards,
    journal: {
      ...fallback.journal,
      ...parsed.journal,
      links: parsed.journal?.links ?? fallback.journal.links,
      theme: {
        ...fallback.journal.theme,
        ...parsed.journal?.theme,
      },
      items: normalizeJournalItems(parsed.journal?.items),
    },
    visual: {
      ...fallback.visual,
      ...parsed.visual,
    },
    quote: {
      ...fallback.quote,
      ...parsed.quote,
    },
    footer: {
      ...fallback.footer,
      ...parsed.footer,
    },
  }
}

function loadInitialScene() {
  if (typeof window === 'undefined') {
    return createSceneSnapshot()
  }

  const fallback = createSceneSnapshot()
  const saved = window.localStorage.getItem(STORAGE_KEY)
  const migrationComplete =
    window.localStorage.getItem(MIGRATION_FLAG_KEY) === '1'

  if (!saved) {
    const recovered = createRecoveredLegacyScene()

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered))
    window.localStorage.setItem(MIGRATION_FLAG_KEY, '1')
    return recovered
  }

  try {
    const parsed = JSON.parse(saved)
    const merged = mergeScene(fallback, parsed)

    if (!migrationComplete && isSceneDefaultLike(merged)) {
      const recovered = createRecoveredLegacyScene()

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered))
      window.localStorage.setItem(MIGRATION_FLAG_KEY, '1')
      return recovered
    }

    return merged
  } catch {
    return fallback
  }
}

function SunyataLanding() {
  const cursorRef = useRef(null)
  const heroSectionRef = useRef(null)
  const heroTitleRef = useRef(null)
  const devotionalRef = useRef(null)
  const ghostLabelRef = useRef(null)
  const interludeSectionRef = useRef(null)
  const interludeChatBarRef = useRef(null)
  const visualSectionRef = useRef(null)
  const [scene, setScene] = useState(loadInitialScene)
  const [editorOpen, setEditorOpen] = useState(false)

  useEffect(() => {
    if (
      typeof window.matchMedia === 'function' &&
      !window.matchMedia('(pointer: fine)').matches
    ) {
      return undefined
    }

    let pointerFrame = 0

    const updatePointer = (event) => {
      if (!cursorRef.current) {
        return
      }

      if (pointerFrame) {
        cancelAnimationFrame(pointerFrame)
      }

      pointerFrame = requestAnimationFrame(() => {
        if (!cursorRef.current) {
          return
        }

        cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      })
    }

    const expandCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.width = '250px'
        cursorRef.current.style.height = '250px'
      }
    }

    const resetCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.width = '150px'
        cursorRef.current.style.height = '150px'
      }
    }

    document.addEventListener('mousemove', updatePointer)
    document.addEventListener('mousedown', expandCursor)
    document.addEventListener('mouseup', resetCursor)

    return () => {
      if (pointerFrame) {
        cancelAnimationFrame(pointerFrame)
      }

      document.removeEventListener('mousemove', updatePointer)
      document.removeEventListener('mousedown', expandCursor)
      document.removeEventListener('mouseup', resetCursor)
    }
  }, [])

  useEffect(() => {
    let scrollFrame = 0

    const applyScrollEffects = () => {
      const scrolled = window.pageYOffset

      if (ghostLabelRef.current) {
        ghostLabelRef.current.style.transform = `translate3d(${scrolled * 0.2}px, 0, 0)`
      }

      if (heroTitleRef.current) {
        heroTitleRef.current.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`
        heroTitleRef.current.style.opacity = `${Math.max(0, 1 - scrolled / 700)}`
      }

      scrollFrame = 0
    }

    const handleScroll = () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(applyScrollEffects)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (scrollFrame) {
        cancelAnimationFrame(scrollFrame)
      }

      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scene))
  }, [scene])

  const updateNavLogo = (value) => {
    setScene((current) => ({
      ...current,
      nav: {
        ...current.nav,
        logo: value,
      },
    }))
  }

  const updateNavLink = (index, value) => {
    setScene((current) => ({
      ...current,
      nav: {
        ...current.nav,
        links: current.nav.links.map((link, linkIndex) =>
          linkIndex === index ? { ...link, label: value } : link,
        ),
      },
    }))
  }

  const updateHero = (field, value) => {
    setScene((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [field]: value,
      },
    }))
  }

  const updateInterlude = (field, value) => {
    setScene((current) => ({
      ...current,
      interlude: {
        ...current.interlude,
        [field]: value,
      },
    }))
  }

  const updateBuddha = (field, value) => {
    setScene((current) => ({
      ...current,
      buddha: {
        ...current.buddha,
        [field]: value,
      },
    }))
  }

  const updateCard = (index, field, value) => {
    setScene((current) => ({
      ...current,
      cards: current.cards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, [field]: value } : card,
      ),
    }))
  }

  const updateVisual = (field, value) => {
    setScene((current) => ({
      ...current,
      visual: {
        ...current.visual,
        [field]: value,
      },
    }))
  }

  const updateJournal = (field, value) => {
    setScene((current) => ({
      ...current,
      journal: {
        ...current.journal,
        [field]: value,
      },
    }))
  }

  const updateJournalLink = (index, value) => {
    setScene((current) => ({
      ...current,
      journal: {
        ...current.journal,
        links: current.journal.links.map((link, linkIndex) =>
          linkIndex === index ? value : link,
        ),
      },
    }))
  }

  const updateJournalTheme = (field, value) => {
    setScene((current) => ({
      ...current,
      journal: {
        ...current.journal,
        theme: {
          ...current.journal.theme,
          [field]: value,
        },
      },
    }))
  }

  const updateJournalItem = (index, field, value) => {
    setScene((current) => ({
      ...current,
      journal: {
        ...current.journal,
        items: current.journal.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }))
  }

  const updateQuote = (field, value) => {
    setScene((current) => ({
      ...current,
      quote: {
        ...current.quote,
        [field]: value,
      },
    }))
  }

  const updateFooter = (field, value) => {
    setScene((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [field]: value,
      },
    }))
  }

  const resetScene = () => {
    setScene(createSceneSnapshot())
  }

  return (
    <main className={`sunyata-page${editorOpen ? ' editor-open' : ''}`}>
      <div ref={cursorRef} className="sunyata-cursor" aria-hidden="true" />
      <NoiseOverlay />
      <div className="void-bg" aria-hidden="true" />

      <SunyataEditor
        editorOpen={editorOpen}
        onToggle={() => setEditorOpen((current) => !current)}
        scene={scene}
        updateNavLogo={updateNavLogo}
        updateNavLink={updateNavLink}
        updateHero={updateHero}
        updateInterlude={updateInterlude}
        updateBuddha={updateBuddha}
        updateCard={updateCard}
        updateJournal={updateJournal}
        updateJournalLink={updateJournalLink}
        updateJournalTheme={updateJournalTheme}
        updateJournalItem={updateJournalItem}
        updateVisual={updateVisual}
        updateQuote={updateQuote}
        updateFooter={updateFooter}
        onReset={resetScene}
      />

      <div className="sunyata-preview">
        <SunyataNav nav={scene.nav} />
        <SunyataHero
          sectionRef={heroSectionRef}
          heroTitleRef={heroTitleRef}
          devotionalRef={devotionalRef}
          hero={scene.hero}
          media={
            <ScrollVideoBackground
              heroSectionRef={heroSectionRef}
              endSectionRef={interludeSectionRef}
              stopTargetRef={interludeChatBarRef}
              rangeKey={`${scene.interlude.chatX}:${scene.interlude.chatY}:${scene.buddha.stopViewportY}`}
              scrollEndId="dialogue"
              buddha={scene.buddha}
            />
          }
        />
        <SunyataInterlude
          sectionRef={interludeSectionRef}
          chatBarRef={interludeChatBarRef}
          interlude={scene.interlude}
        />
        <SunyataWildernessJournal journal={scene.journal} />
        <SunyataCards cards={scene.cards} />
        <SunyataVisual
          sectionRef={visualSectionRef}
          ghostLabelRef={ghostLabelRef}
          visual={scene.visual}
          quote={scene.quote}
        />
        <SunyataFooter footer={scene.footer} />
        <SunyataArchive />
      </div>
    </main>
  )
}

export default SunyataLanding
