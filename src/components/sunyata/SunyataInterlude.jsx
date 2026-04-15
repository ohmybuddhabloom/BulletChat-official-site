import { useEffect, useRef, useState } from 'react'

function SunyataInterlude({ sectionRef, chatBarRef, interlude }) {
  const [message, setMessage] = useState('')
  const [exchanges, setExchanges] = useState([])
  const timersRef = useRef([])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      timersRef.current = []
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    const prompt = message.trim()

    if (!prompt) {
      return
    }

    const exchangeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`

    setExchanges((current) => [
      ...current.slice(-2),
      {
        id: exchangeId,
        prompt,
        responded: false,
      },
    ])
    setMessage('')

    const timerId = window.setTimeout(() => {
      setExchanges((current) =>
        current.map((item) =>
          item.id === exchangeId ? { ...item, responded: true } : item,
        ),
      )
    }, interlude.responseDelayMs ?? 420)

    timersRef.current.push(timerId)
  }

  return (
    <section
      ref={sectionRef}
      className="interlude-section"
      id="dialogue"
      data-stack="foreground"
      data-testid="conversation-interlude"
    >
      <div
        className="interlude-copy"
        data-testid="interlude-copy"
        style={{
          transform: `translate3d(${interlude.textX ?? 0}px, ${interlude.textY ?? 0}px, 0px)`,
        }}
      >
        <p className="interlude-kicker">{interlude.kicker}</p>
        <h2 className="interlude-title">{interlude.title}</h2>
        <p className="interlude-note">{interlude.note}</p>
      </div>

      <div className="interlude-thread" data-testid="interlude-thread">
        {exchanges.map((exchange) => (
          <div className="interlude-exchange" key={exchange.id}>
            <article className="interlude-bubble is-user">
              <span className="interlude-bubble-label">{interlude.actionLabel}</span>
              <p>{exchange.prompt}</p>
            </article>

            {exchange.responded ? (
              <article className="interlude-bubble is-buddha">
                <span className="interlude-bubble-label">
                  {interlude.responseLabel}
                </span>
                <p>{interlude.responseText}</p>
              </article>
            ) : null}
          </div>
        ))}
      </div>

      <form
        ref={chatBarRef}
        className="interlude-chat-bar"
        data-testid="interlude-chat-bar"
        data-layer="top"
        style={{
          transform: `translate3d(${interlude.chatX ?? 0}px, ${interlude.chatY ?? 0}px, 0px)`,
        }}
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="buddha-question">
          Ask Buddha a question
        </label>
        <input
          id="buddha-question"
          className="interlude-input"
          type="text"
          value={message}
          placeholder={interlude.placeholder}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" className="interlude-submit" disabled={!message.trim()}>
          {interlude.actionLabel}
        </button>
      </form>
    </section>
  )
}

export default SunyataInterlude
