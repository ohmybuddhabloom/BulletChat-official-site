// Static noise overlay using CSS background-image instead of SVG feTurbulence.
// The SVG feTurbulence filter ran on the CPU every frame when composited over
// animated layers. A pre-tiled static image has zero runtime computation cost.
function NoiseOverlay() {
  return <div className="grain" aria-hidden="true" />
}

export default NoiseOverlay
