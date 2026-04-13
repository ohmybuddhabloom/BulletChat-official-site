function SunyataQuote({ quote }) {
  return (
    <section className="quote-section" id="silence">
      <div className="quote-wrap" style={{ maxWidth: `${quote.maxWidth}px` }}>
        <p className="quote-copy">{quote.text}</p>

        <div className="quote-details">
          <div>
            <h4>{quote.studioLabel}</h4>
            <p>{quote.studioText}</p>
          </div>
          <div>
            <h4>{quote.philosophyLabel}</h4>
            <p>{quote.philosophyText}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SunyataQuote
