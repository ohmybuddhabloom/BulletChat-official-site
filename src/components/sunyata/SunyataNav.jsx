function SunyataNav({ nav }) {
  return (
    <nav className="sunyata-nav" aria-label="Primary">
      <div className="sunyata-logo">{nav.logo}</div>
      <div className="sunyata-nav-links">
        {nav.links.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default SunyataNav
