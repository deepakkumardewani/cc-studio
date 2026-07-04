const SCROLL_DURATION_MS = 220;

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export function getScrollParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
}

export function animateScrollTo(
  container: HTMLElement,
  targetTop: number,
  duration = SCROLL_DURATION_MS,
): Promise<void> {
  const start = container.scrollTop;
  const change = targetTop - start;

  if (change === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = start + change * easeOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }

      resolve();
    }

    requestAnimationFrame(step);
  });
}

export function scrollElementIntoView(
  element: HTMLElement,
  offset = 24,
  container?: HTMLElement,
): Promise<void> {
  const scrollContainer = container ?? getScrollParent(element);
  const containerRect = scrollContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const targetTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - offset;

  return animateScrollTo(scrollContainer, Math.max(0, targetTop));
}

export function scrollToTop(container: HTMLElement): Promise<void> {
  return animateScrollTo(container, 0);
}

export { SCROLL_DURATION_MS };
