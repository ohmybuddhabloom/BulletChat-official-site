export function getScrollVideoRange(startScroll, endTop, endHeight) {
  if (
    !Number.isFinite(startScroll) ||
    !Number.isFinite(endTop) ||
    !Number.isFinite(endHeight) ||
    endHeight <= 0
  ) {
    return {
      startScroll: 0,
      endScroll: 0,
    }
  }

  const endScroll = endTop + endHeight

  if (endScroll <= startScroll) {
    return {
      startScroll: 0,
      endScroll: 0,
    }
  }

  return {
    startScroll,
    endScroll,
  }
}

export function getScrollStopAtViewportPosition(
  targetTop,
  targetHeight,
  viewportHeight,
  viewportRatio = 0.5,
) {
  if (
    !Number.isFinite(targetTop) ||
    !Number.isFinite(targetHeight) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(viewportRatio) ||
    targetHeight <= 0 ||
    viewportHeight <= 0
  ) {
    return 0
  }

  const clampedViewportRatio = Math.min(Math.max(viewportRatio, 0), 2)

  return targetTop + targetHeight / 2 - viewportHeight * clampedViewportRatio
}

export function getScrollVideoProgress(scrollY, startScroll, endScroll) {
  if (
    !Number.isFinite(startScroll) ||
    !Number.isFinite(endScroll) ||
    endScroll <= startScroll
  ) {
    return 0
  }

  const clampedScroll = Math.min(Math.max(scrollY, startScroll), endScroll)

  return (clampedScroll - startScroll) / (endScroll - startScroll)
}

export function getScrollVideoTime(
  scrollY,
  startScroll,
  endScroll,
  duration,
) {
  if (!duration || duration <= 0) {
    return 0
  }

  return getScrollVideoProgress(scrollY, startScroll, endScroll) * duration
}

export function getScrollFollowOffset(scrollY, startScroll, endScroll) {
  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(startScroll) ||
    !Number.isFinite(endScroll) ||
    endScroll <= startScroll
  ) {
    return 0
  }

  const clampedScroll = Math.min(Math.max(scrollY, startScroll), endScroll)

  return clampedScroll - startScroll
}

export function getFrameSelection(progress, frameCount) {
  if (!frameCount || frameCount <= 0) {
    return {
      currentIndex: 0,
      nextIndex: 0,
      blend: 0,
    }
  }

  const safeProgress = Math.min(Math.max(progress, 0), 1)
  const exactIndex = safeProgress * Math.max(frameCount - 1, 0)
  const currentIndex = Math.floor(exactIndex)
  const nextIndex = Math.min(currentIndex + 1, frameCount - 1)

  return {
    currentIndex,
    nextIndex,
    blend: exactIndex - currentIndex,
  }
}
