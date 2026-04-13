import { useState } from 'react'

const previewItems = [
  {
    key: 'home',
    eyebrow: 'Daily ritual',
    title: 'A centered home that opens the day softly.',
    description:
      'The landing flow balances practice, morning tone, and a clear path into the calmest next action.',
    imageSrc: '/app-previews/foshuo-home.png',
    imageAlt: 'Buddha Chat home screen with practice and Q&A states',
    className: 'app-preview-home',
  },
  {
    key: 'feed',
    eyebrow: 'Living updates',
    title: 'A warmer feed with masters, prompts, and quiet depth.',
    description:
      'The waterfall feed lets the product feel alive without becoming noisy or losing the ritual atmosphere.',
    imageSrc: '/app-previews/master-updates.png',
    imageAlt: 'Buddha Chat master updates waterfall feed',
    className: 'app-preview-feed',
  },
  {
    key: 'detail',
    eyebrow: 'Q&A detail',
    title: 'Answers hold space instead of rushing the user forward.',
    description:
      'Long-form response states, social proof, and comments stay readable while keeping the product grounded.',
    imageSrc: '/app-previews/qa-detail.png',
    imageAlt: 'Buddha Chat question and answer detail screen',
    className: 'app-preview-detail',
  },
  {
    key: 'device',
    eyebrow: 'Device companion',
    title: 'A ritual device page with one strong focal object.',
    description:
      'Hardware, breath rhythm, mantra mode, and action flow are presented like a calm artifact rather than a gadget.',
    imageSrc: '/app-previews/deepin-device.png',
    imageAlt: 'Buddha Chat ritual device product page',
    className: 'app-preview-device',
  },
]

function AppPreviewCard({ eyebrow, title, description, imageSrc, imageAlt, className }) {
  return (
    <article className={`app-preview-card ${className}`}>
      <div className="app-preview-meta">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="app-preview-device-frame">
        <div className="app-preview-device-notch" aria-hidden="true" />
        <img src={imageSrc} alt={imageAlt} loading="lazy" />
      </div>
    </article>
  )
}

function SunyataAppPreviews() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section className="app-previews-section" data-testid="app-previews-section">
      <div className="app-previews-shell">
        <div className="app-previews-copy">
          <p className="app-previews-kicker">App ritual preview</p>
          <h2>From first light to the quiet answer.</h2>
          <p className="app-previews-lead">
            These screens show how Buddha Chat can move from a soft morning
            ritual, into living updates, into thoughtful Q&amp;A, and finally
            into a device experience that feels ceremonial rather than technical.
          </p>
        </div>

        <div className="app-previews-gallery">
          {previewItems.map((item) => (
            <AppPreviewCard key={item.key} {...item} />
          ))}
        </div>

        <div className="app-previews-reserve">
          <div className="app-previews-reserve-copy">
            <p>预约内测</p>
            <span>Leave an email and we will hold a place for early access.</span>
          </div>

          {submitted ? (
            <div className="app-previews-reserve-confirmed">
              Reservation received
            </div>
          ) : (
            <form className="app-previews-reserve-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="app-preview-email">
                Enter your email for early access
              </label>
              <input
                id="app-preview-email"
                type="email"
                value={email}
                placeholder="Enter your email for early access"
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit">Reserve</button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default SunyataAppPreviews
