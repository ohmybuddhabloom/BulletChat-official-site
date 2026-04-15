import { useEffect, useRef, useState } from 'react'

const imageIds = [
  '1493246507139-91e8fad9978e',
  '1516035069371-29a1b244cc32',
  '1507643179173-39db30be83d3',
  '1519750783826-e2420f4d687f',
  '1494438639946-1ebd1d20bf85',
  '1500462918059-b1a0cb512f1d',
  '1486718448742-1643916ef44d',
  '1493514789931-5f7514745154',
  '1530099486328-e021101a494a',
  '1496747611176-843222e1e57c',
  '1491895200230-24e84424a737',
  '1520698115663-8a9d060f606e',
  '1449247709948-96350937c885',
  '1462331940187-285b04fb854f',
  '1464822759023-fed622ff2c3b',
]

const CARD_WIDTH = 240
const AUTO_SCROLL_SPEED = 0.35

function buildImageSrc(id) {
  return `https://images.unsplash.com/photo-${id}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`
}

function SunyataArchive() {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const rafRef = useRef(0)
  const currentScrollRef = useRef(0)
  const targetScrollRef = useRef(0)
  const velocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const activeStatesRef = useRef(new Array(imageIds.length).fill(false))
  const isVisibleRef = useRef(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dragCursor, setDragCursor] = useState('grab')

  useEffect(() => {
    const animate = () => {
      if (!isVisibleRef.current) {
        rafRef.current = 0
        return
      }

      if (!isDraggingRef.current) {
        targetScrollRef.current += velocityRef.current
        velocityRef.current *= 0.96
        targetScrollRef.current += AUTO_SCROLL_SPEED
      }

      const diff = targetScrollRef.current - currentScrollRef.current
      currentScrollRef.current += diff * 0.08

      const totalSetWidth = imageIds.length * CARD_WIDTH

      cardRefs.current.forEach((card, index) => {
        if (!card) {
          return
        }

        let virtualIndex = index * CARD_WIDTH - currentScrollRef.current

        while (virtualIndex < -totalSetWidth / 2) {
          virtualIndex += totalSetWidth
        }

        while (virtualIndex > totalSetWidth / 2) {
          virtualIndex -= totalSetWidth
        }

        if (Math.abs(virtualIndex) < window.innerWidth) {
          card.style.display = 'block'

          const progress = virtualIndex / (window.innerWidth / 1.5)
          const x = virtualIndex
          const z = -Math.pow(Math.abs(progress), 1.8) * 600
          const rotateY = progress * 40
          const opacity = Math.max(0, 1 - Math.pow(Math.abs(progress), 2.5))

          card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg)`
          card.style.opacity = String(opacity)

          const isActive = Math.abs(virtualIndex) < CARD_WIDTH / 2

          if (isActive !== activeStatesRef.current[index]) {
            activeStatesRef.current[index] = isActive
            card.classList.toggle('is-active', isActive)
          }
        } else {
          card.style.display = 'none'
        }
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    const startLoop = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          startLoop()
        }
      },
      { threshold: 0 },
    )

    const overlayTimer = window.setTimeout(() => {
      setOverlayVisible(false)
      if (sectionRef.current) {
        observer.observe(sectionRef.current)
      }
    }, 1500)

    return () => {
      window.clearTimeout(overlayTimer)
      observer.disconnect()

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [])

  useEffect(() => {
    const releaseDrag = () => {
      isDraggingRef.current = false
      setDragCursor('grab')
    }

    const handlePointerMove = (event) => {
      if (!isDraggingRef.current) {
        return
      }

      const delta = event.clientX - lastPointerXRef.current
      lastPointerXRef.current = event.clientX
      targetScrollRef.current -= delta * 1.2
      velocityRef.current = -delta * 0.4
    }

    window.addEventListener('pointerup', releaseDrag)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      window.removeEventListener('pointerup', releaseDrag)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  const handlePointerDown = (event) => {
    isDraggingRef.current = true
    lastPointerXRef.current = event.clientX
    velocityRef.current = 0
    setDragCursor('grabbing')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section ref={sectionRef} className="archive-section" data-testid="archive-section">
      <header className="archive-header">
        <div className="archive-brand">LUMIERE ARCHIVE</div>
        <div className="archive-meta">
          COLLECTION 01
          <br />
          SACRED DIMENSIONS
        </div>
      </header>

      <div
        className="archive-gallery-viewport"
        onPointerDown={handlePointerDown}
        style={{ cursor: dragCursor }}
      >
        <div className="archive-strip-container">
          {imageIds.map((id, index) => (
            <article
              key={id}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              className="archive-card"
              data-index={index}
            >
              <img
                src={buildImageSrc(id)}
                alt=""
                loading="lazy"
                draggable="false"
              />
              <div className="archive-card-overlay" />
            </article>
          ))}
        </div>
      </div>

      <div className="archive-waitlist-container">
        <span className="archive-waitlist-label">Request Access</span>

        {submitted ? (
          <div className="archive-waitlist-success">ACCESS REQUESTED</div>
        ) : (
          <form className="archive-input-group" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" className="archive-submit-btn">
              Enter
            </button>
          </form>
        )}
      </div>

      <div
        className={`archive-overlay${overlayVisible ? ' is-visible' : ''}`}
        aria-hidden="true"
      >
        <div className="archive-loader-text">AWAKENING ARCHIVE...</div>
      </div>
    </section>
  )
}

export default SunyataArchive
