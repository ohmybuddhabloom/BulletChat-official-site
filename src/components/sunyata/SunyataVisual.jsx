import { useEffect, useState } from 'react'
import { resolveJournalImageSource } from '../../lib/journalAssetStore.js'

function SunyataVisual({
  sectionRef,
  visualAnchorRef = null,
  ghostLabelRef,
  visual,
  quote,
  donation,
}) {
  const [resolvedImageSrc, setResolvedImageSrc] = useState(visual.imageSrc)
  const [selectedTier, setSelectedTier] = useState(donation?.tiers?.[0]?.amount ?? '0.99')
  const [customAmount, setCustomAmount] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const donationGallery = donation?.gallery ?? []
  const detailGroups = [
    {
      label: quote.studioLabel,
      text: quote.studioText,
    },
    {
      label: quote.philosophyLabel,
      text: quote.philosophyText,
    },
  ].filter((item) => item.label || item.text)

  useEffect(() => {
    let active = true
    let revoke = () => {}

    const hydrateImage = async () => {
      const resolved = await resolveJournalImageSource(visual.imageSrc)

      if (!active) {
        resolved.revoke()
        return
      }

      revoke = resolved.revoke
      setResolvedImageSrc(resolved.src)
    }

    hydrateImage()

    return () => {
      active = false
      revoke()
    }
  }, [visual.imageSrc])

  const handleDonationSubmit = (event) => {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    setSubmitted(true)
  }

  const selectedTierLabel =
    customAmount.trim()
      ? `$${customAmount.trim()}`
      : donation?.tiers?.find((tier) => tier.amount === selectedTier)?.label ??
        selectedTier

  return (
    <section ref={sectionRef} className="visual-quote-section" id="vessels">
      <div ref={visualAnchorRef} className="visual-anchor">
        <div
          ref={ghostLabelRef}
          className="ghost-label"
          aria-hidden="true"
          style={{
            right: `${visual.ghostRight}%`,
            bottom: `${visual.ghostBottom}%`,
          }}
        >
          {visual.ghostLabel}
        </div>
        <img
          src={resolvedImageSrc}
          alt={visual.imageAlt}
          className="main-visual"
          style={{
            width: `${visual.imageWidth}%`,
            transform: `translate3d(${visual.imageX ?? 0}%, 0px, 0px)`,
          }}
        />
        <div
          className="quote-wrap visual-quote-wrap"
          id="silence"
          data-testid="visual-quote-overlay"
          style={{
            maxWidth: `${quote.maxWidth}px`,
            transform: `translate3d(${quote.x ?? 0}px, ${quote.y ?? 0}px, 0px)`,
          }}
        >
          <p className="quote-copy">{quote.text}</p>

          {detailGroups.length ? (
            <div className="quote-details">
              {detailGroups.map((item) => (
                <div key={`${item.label}-${item.text}`}>
                  {item.label ? <h4>{item.label}</h4> : null}
                  {item.text ? <p>{item.text}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="donation-shell"
        data-testid="donation-shell"
        style={{
          '--donation-copy-width': `${donation.layout?.copyWidthPercent ?? 36}%`,
          '--donation-top-spacing': `${donation.layout?.topSpacing ?? 92}px`,
          '--donation-gap': `${donation.layout?.gap ?? 40}px`,
          '--donation-card-radius': `${donation.layout?.cardRadius ?? 28}px`,
        }}
      >
        <div className="donation-layout">
          <div className="donation-copy">
            <span className="donation-kicker">{donation.eyebrow}</span>
            <h2 className="donation-heading">{donation.heading}</h2>
            <p>{donation.note}</p>
          </div>

          <div className="donation-gallery" aria-label="Sacred artifacts gallery">
            {donationGallery.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={`donation-gallery-card${
                  index === 1 ? ' is-tall' : ''
                }`}
              >
                <div className="donation-gallery-media">
                  <img src={item.imageSrc} alt={item.imageAlt} />
                  <div className="donation-gallery-overlay">
                    <span>{item.overlay}</span>
                  </div>
                </div>
                <div className="donation-gallery-copy">
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="donation-entry">
          <div className="donation-panel">
            <div className="donation-panel-copy">
              <span>{donation.kicker}</span>
              <p>{donation.panelNote}</p>
            </div>

            <div className="donation-tier-row" role="group" aria-label="Donation tiers">
              {donation.tiers.map((tier) => (
                <button
                  key={tier.amount}
                  type="button"
                  className={`donation-tier${
                    !customAmount.trim() && selectedTier === tier.amount
                      ? ' is-selected'
                      : ''
                  }`}
                  onClick={() => {
                    setCustomAmount('')
                    setSelectedTier(tier.amount)
                  }}
                >
                  <strong>{tier.label}</strong>
                </button>
              ))}
              <label className="donation-custom">
                <span className="donation-custom-symbol">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={donation.customPlaceholder}
                  value={customAmount}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^\d.]/g, '')
                    setCustomAmount(value)
                    if (value.trim()) {
                      setSelectedTier(value.trim())
                    }
                  }}
                  aria-label="Custom donation amount"
                />
              </label>
            </div>

            {submitted ? (
              <div className="donation-confirmed">
                {donation.successMessage}
                {` (${selectedTierLabel})`}
              </div>
            ) : (
              <form className="donation-form" onSubmit={handleDonationSubmit}>
                <label className="sr-only" htmlFor="donation-email">
                  Leave your email for the donation link
                </label>
                <input
                  id="donation-email"
                  type="email"
                  value={email}
                  placeholder={donation.emailPlaceholder}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button type="submit">{donation.actionLabel}</button>
              </form>
            )}

            <p className="donation-support-note">
              {donation.supportNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SunyataVisual
