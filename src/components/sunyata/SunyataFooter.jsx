function SunyataFooter({ footer }) {
  return (
    <footer className="sunyata-footer">
      <div className="footer-left">
        <h2>
          {footer.titleLine1}
          <br />
          {footer.titleLine2}
        </h2>
        <a href="#path" className="cta-button">
          {footer.ctaLabel}
        </a>
      </div>

    </footer>
  )
}

export default SunyataFooter
