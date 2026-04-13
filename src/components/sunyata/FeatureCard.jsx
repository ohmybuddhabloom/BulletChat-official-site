function FeatureCard({ number, title, description, offsetY = 0 }) {
  return (
    <article className="feature-card" style={{ marginTop: `${offsetY}px` }}>
      <span className="card-num">{number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default FeatureCard
