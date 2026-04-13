function SunyataHero({
  sectionRef,
  heroTitleRef,
  devotionalRef,
  hero,
  media,
}) {
  return (
    <section ref={sectionRef} className="hero-container" id="path">
      <div
        className="hero-left"
        data-testid="hero-copy-column"
        data-layer="title"
        style={{
          width: `${hero.leftWidth}%`,
          paddingLeft: `${hero.leftPadding}%`,
          transform: `translate3d(${hero.copyX}px, ${hero.copyY}px, 0px)`,
        }}
      >
        <h1 ref={heroTitleRef} className="hero-title">
          {hero.title}
        </h1>
        <p className="subtitle">{hero.subtitle}</p>
        <div className="scroll-indicator">{hero.scrollLabel}</div>
      </div>

      <div
        className="hero-right"
        aria-hidden="true"
        style={{ width: `${100 - hero.leftWidth}%` }}
      >
        <div ref={devotionalRef} className="devotional-space">
          <div className="gold-circle" />
          {media}
          <div className="fog-frame" />
        </div>
      </div>
    </section>
  )
}

export default SunyataHero
