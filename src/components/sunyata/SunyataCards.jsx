import FeatureCard from './FeatureCard.jsx'

function SunyataCards({ cards }) {
  return (
    <section className="content-section" id="sanctuary" data-testid="cards-section">
      <div className="content-grid">
        {cards.map((card, index) => (
          <FeatureCard key={`${card.title}-${index}`} {...card} />
        ))}
      </div>
    </section>
  )
}

export default SunyataCards
