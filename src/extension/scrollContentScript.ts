const CONTENT_MESSAGE_SOURCE = 'responsive-lab-content';
const APP_MESSAGE_SOURCE = 'responsive-lab-app';
const SCROLL_THROTTLE_MS = 80;
const SUPPRESS_AFTER_REMOTE_SCROLL_MS = 250;

let lastSentAt = 0;
let lastSentRatio = -1;
let suppressScrollUntil = 0;
let pendingAnimationFrame: number | null = null;

const isEmbeddedFrame = () => window.top !== window;

const isAppScrollToMessage = (value: unknown): value is { source: typeof APP_MESSAGE_SOURCE; type: 'scrollTo'; ratio: number } => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeMessage = value as { source?: unknown; type?: unknown; ratio?: unknown };
  return (
    maybeMessage.source === APP_MESSAGE_SOURCE &&
    maybeMessage.type === 'scrollTo' &&
    typeof maybeMessage.ratio === 'number' &&
    maybeMessage.ratio >= 0 &&
    maybeMessage.ratio <= 1
  );
};

const getScrollElement = () => document.scrollingElement ?? document.documentElement;

const getScrollRatio = () => {
  const scrollElement = getScrollElement();
  const maxScroll = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);

  if (maxScroll === 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollElement.scrollTop / maxScroll));
};

const scrollToRatio = (ratio: number) => {
  const scrollElement = getScrollElement();
  const maxScroll = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
  suppressScrollUntil = Date.now() + SUPPRESS_AFTER_REMOTE_SCROLL_MS;
  window.scrollTo({ top: maxScroll * ratio, behavior: 'auto' });
};

const postScrollRatio = () => {
  pendingAnimationFrame = null;

  if (!isEmbeddedFrame() || Date.now() < suppressScrollUntil) {
    return;
  }

  const now = Date.now();
  const ratio = getScrollRatio();

  if (now - lastSentAt < SCROLL_THROTTLE_MS && Math.abs(ratio - lastSentRatio) < 0.01) {
    return;
  }

  lastSentAt = now;
  lastSentRatio = ratio;
  window.parent.postMessage({ source: CONTENT_MESSAGE_SOURCE, type: 'scroll', ratio }, '*');
};

const scheduleScrollRatioPost = () => {
  if (pendingAnimationFrame !== null) {
    return;
  }

  pendingAnimationFrame = window.requestAnimationFrame(postScrollRatio);
};

if (isEmbeddedFrame()) {
  window.parent.postMessage({ source: CONTENT_MESSAGE_SOURCE, type: 'ready' }, '*');
  window.addEventListener('scroll', scheduleScrollRatioPost, { passive: true });
  window.addEventListener('message', (event) => {
    if (!isAppScrollToMessage(event.data)) {
      return;
    }

    scrollToRatio(event.data.ratio);
  });
}
