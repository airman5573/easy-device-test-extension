const POSLOG_ENDPOINT = 'https://poslog.anydo.cloud/api/logs';
const POSLOG_NAMESPACE = 'chrome-responsive-ui-extension';

const poslog = (scenario: string, isError: boolean, message: string, detail?: unknown) => {
  const body = {
    logtype: isError ? 'ERROR' : 'INFO',
    namespace: POSLOG_NAMESPACE,
    scenario,
    message,
    context: detail,
  };

  console.debug('[poslog]', scenario, message, detail);

  fetch(POSLOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
};

const CONTENT_MESSAGE_SOURCE = 'responsive-lab-content';
const APP_MESSAGE_SOURCE = 'responsive-lab-app';
const SCROLL_THROTTLE_MS = 80;
const SUPPRESS_AFTER_REMOTE_SCROLL_MS = 250;
const TOP_SCROLL_RATIO_THRESHOLD = 0.01;
const SCROLL_POSITION_EPSILON_PX = 1;
const MIN_VERTICAL_SCROLL_SYNC_DELTA_PX = 30;

let lastSentAt = 0;
let lastSentRatio = -1;
let lastObservedScrollTop = 0;
let lastObservedScrollLeft = 0;
let lastSyncedScrollTop = 0;
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
  const targetTop = ratio <= TOP_SCROLL_RATIO_THRESHOLD ? 0 : maxScroll * ratio;
  const _log_beforeRemoteScroll = {
    href: window.location.href,
    ratio,
    targetTop,
    maxScroll,
    scrollTop: scrollElement.scrollTop,
    scrollLeft: scrollElement.scrollLeft,
    documentElementScrollTop: document.documentElement.scrollTop,
    documentElementScrollLeft: document.documentElement.scrollLeft,
    bodyScrollTop: document.body.scrollTop,
    bodyScrollLeft: document.body.scrollLeft,
    scrollHeight: scrollElement.scrollHeight,
    clientHeight: scrollElement.clientHeight,
    scrollWidth: scrollElement.scrollWidth,
    clientWidth: scrollElement.clientWidth,
    suppressScrollUntil,
    lastSentRatio,
    lastSentAt,
  };
  // poslog-start
  poslog('content-scroll-to-ratio-before', false, 'remote scrollTo command about to apply inside frame', _log_beforeRemoteScroll);
  // poslog-end

  const appliedAt = Date.now();
  suppressScrollUntil = appliedAt + SUPPRESS_AFTER_REMOTE_SCROLL_MS;

  // Use both document and window scrolling so top sync is more reliable across
  // pages that attach scrolling to slightly different root elements.
  scrollElement.scrollTop = targetTop;
  document.documentElement.scrollTop = targetTop;
  document.body.scrollTop = targetTop;
  window.scrollTo({ top: targetTop, behavior: 'auto' });
  lastObservedScrollTop = scrollElement.scrollTop;
  lastObservedScrollLeft = scrollElement.scrollLeft;
  lastSyncedScrollTop = scrollElement.scrollTop;
  lastSentAt = appliedAt;
  lastSentRatio = ratio;

  const _log_afterRemoteScroll = {
    href: window.location.href,
    ratio,
    targetTop,
    maxScroll,
    scrollTop: scrollElement.scrollTop,
    scrollLeft: scrollElement.scrollLeft,
    documentElementScrollTop: document.documentElement.scrollTop,
    documentElementScrollLeft: document.documentElement.scrollLeft,
    bodyScrollTop: document.body.scrollTop,
    bodyScrollLeft: document.body.scrollLeft,
    scrollHeight: scrollElement.scrollHeight,
    clientHeight: scrollElement.clientHeight,
    scrollWidth: scrollElement.scrollWidth,
    clientWidth: scrollElement.clientWidth,
    lastObservedScrollTop,
    lastObservedScrollLeft,
    lastSyncedScrollTop,
    suppressScrollUntil,
    lastSentRatio,
    lastSentAt,
  };
  // poslog-start
  poslog('content-scroll-to-ratio-after', false, 'remote scrollTo command applied inside frame', _log_afterRemoteScroll);
  // poslog-end
};

const postScrollRatio = () => {
  pendingAnimationFrame = null;

  const now = Date.now();
  const scrollElement = getScrollElement();
  const previousObservedScrollTop = lastObservedScrollTop;
  const previousObservedScrollLeft = lastObservedScrollLeft;
  const currentScrollTop = scrollElement.scrollTop;
  const currentScrollLeft = scrollElement.scrollLeft;
  const scrollTopDelta = currentScrollTop - previousObservedScrollTop;
  const scrollLeftDelta = currentScrollLeft - previousObservedScrollLeft;
  const scrollTopDeltaFromLastSync = currentScrollTop - lastSyncedScrollTop;
  const verticalMoved = Math.abs(scrollTopDelta) >= SCROLL_POSITION_EPSILON_PX;
  const horizontalMoved = Math.abs(scrollLeftDelta) >= SCROLL_POSITION_EPSILON_PX;
  const horizontalOnlyScroll = !verticalMoved && horizontalMoved;
  const reachedDocumentTop = currentScrollTop <= SCROLL_POSITION_EPSILON_PX;
  const enoughVerticalMovementForSync = Math.abs(scrollTopDeltaFromLastSync) >= MIN_VERTICAL_SCROLL_SYNC_DELTA_PX;
  const shouldSyncReachedTop = verticalMoved && reachedDocumentTop && lastSentRatio !== 0;
  const _log_scrollState = {
    href: window.location.href,
    embeddedFrame: isEmbeddedFrame(),
    now,
    suppressScrollUntil,
    suppressedByRemoteScroll: now < suppressScrollUntil,
    scrollTop: currentScrollTop,
    scrollLeft: currentScrollLeft,
    previousObservedScrollTop,
    previousObservedScrollLeft,
    lastSyncedScrollTop,
    scrollTopDelta,
    scrollLeftDelta,
    scrollTopDeltaFromLastSync,
    verticalMoved,
    horizontalMoved,
    horizontalOnlyScroll,
    reachedDocumentTop,
    enoughVerticalMovementForSync,
    shouldSyncReachedTop,
    minVerticalScrollSyncDeltaPx: MIN_VERTICAL_SCROLL_SYNC_DELTA_PX,
    documentElementScrollTop: document.documentElement.scrollTop,
    documentElementScrollLeft: document.documentElement.scrollLeft,
    bodyScrollTop: document.body.scrollTop,
    bodyScrollLeft: document.body.scrollLeft,
    scrollHeight: scrollElement.scrollHeight,
    clientHeight: scrollElement.clientHeight,
    maxScroll: Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight),
    scrollWidth: scrollElement.scrollWidth,
    clientWidth: scrollElement.clientWidth,
    maxScrollLeft: Math.max(0, scrollElement.scrollWidth - scrollElement.clientWidth),
    lastSentRatio,
    lastSentAt,
  };
  // poslog-start
  poslog('content-scroll-event-measured', false, 'frame scroll event measured before deciding whether to post ratio', _log_scrollState);
  // poslog-end

  lastObservedScrollTop = currentScrollTop;
  lastObservedScrollLeft = currentScrollLeft;

  if (!isEmbeddedFrame() || now < suppressScrollUntil) {
    // poslog-start
    poslog('content-scroll-event-suppressed', false, 'frame scroll event suppressed before posting to parent', _log_scrollState);
    // poslog-end
    return;
  }

  if (horizontalOnlyScroll) {
    // poslog-start
    poslog('content-scroll-horizontal-only-skipped', false, 'horizontal-only frame scroll ignored for vertical scroll sync', _log_scrollState);
    // poslog-end
    return;
  }

  if (!enoughVerticalMovementForSync && !shouldSyncReachedTop) {
    // poslog-start
    poslog('content-scroll-vertical-delta-too-small', false, 'frame vertical scroll ignored until cumulative movement reaches threshold', _log_scrollState);
    // poslog-end
    return;
  }

  const measuredRatio = getScrollRatio();
  const ratio = measuredRatio <= TOP_SCROLL_RATIO_THRESHOLD ? 0 : measuredRatio;
  const reachedTop = ratio === 0;
  const alreadySentTop = lastSentRatio === 0;
  const _log_ratioDecision = {
    ..._log_scrollState,
    measuredRatio,
    ratio,
    reachedTop,
    alreadySentTop,
    throttleWindowMs: SCROLL_THROTTLE_MS,
    ratioDeltaFromLastSent: Math.abs(ratio - lastSentRatio),
  };

  if (!reachedTop && now - lastSentAt < SCROLL_THROTTLE_MS && Math.abs(ratio - lastSentRatio) < 0.01) {
    // poslog-start
    poslog('content-scroll-post-throttled', false, 'non-top frame scroll ratio post throttled', _log_ratioDecision);
    // poslog-end
    return;
  }

  if (reachedTop && alreadySentTop) {
    lastSyncedScrollTop = currentScrollTop;
    // poslog-start
    poslog('content-scroll-top-duplicate-skipped', false, 'duplicate top ratio skipped', _log_ratioDecision);
    // poslog-end
    return;
  }

  lastSentAt = now;
  lastSentRatio = ratio;
  lastSyncedScrollTop = currentScrollTop;
  const _log_postMessage = {
    ..._log_ratioDecision,
    lastSyncedScrollTopAfter: lastSyncedScrollTop,
    lastSentAtAfter: lastSentAt,
    lastSentRatioAfter: lastSentRatio,
  };
  // poslog-start
  poslog('content-scroll-ratio-posted', false, 'posting frame scroll ratio to parent', _log_postMessage);
  // poslog-end
  window.parent.postMessage({ source: CONTENT_MESSAGE_SOURCE, type: 'scroll', ratio }, '*');
};

const scheduleScrollRatioPost = () => {
  if (pendingAnimationFrame !== null) {
    return;
  }

  const scrollElement = getScrollElement();
  const _log_scheduleState = {
    href: window.location.href,
    scrollTop: scrollElement.scrollTop,
    scrollLeft: scrollElement.scrollLeft,
    documentElementScrollTop: document.documentElement.scrollTop,
    documentElementScrollLeft: document.documentElement.scrollLeft,
    bodyScrollTop: document.body.scrollTop,
    bodyScrollLeft: document.body.scrollLeft,
    suppressScrollUntil,
    lastSentRatio,
    lastSentAt,
  };
  // poslog-start
  poslog('content-scroll-event-scheduled', false, 'frame scroll event scheduled for ratio measurement', _log_scheduleState);
  // poslog-end
  pendingAnimationFrame = window.requestAnimationFrame(postScrollRatio);
};

if (isEmbeddedFrame()) {
  const scrollElement = getScrollElement();
  lastObservedScrollTop = scrollElement.scrollTop;
  lastObservedScrollLeft = scrollElement.scrollLeft;
  lastSyncedScrollTop = scrollElement.scrollTop;
  const _log_readyState = {
    href: window.location.href,
    scrollTop: scrollElement.scrollTop,
    scrollLeft: scrollElement.scrollLeft,
    lastObservedScrollTop,
    lastObservedScrollLeft,
    lastSyncedScrollTop,
    documentElementScrollTop: document.documentElement.scrollTop,
    documentElementScrollLeft: document.documentElement.scrollLeft,
    bodyScrollTop: document.body.scrollTop,
    bodyScrollLeft: document.body.scrollLeft,
    scrollHeight: scrollElement.scrollHeight,
    clientHeight: scrollElement.clientHeight,
    scrollWidth: scrollElement.scrollWidth,
    clientWidth: scrollElement.clientWidth,
  };
  // poslog-start
  poslog('content-scroll-script-ready', false, 'content scroll script initialized in embedded frame', _log_readyState);
  // poslog-end
  window.parent.postMessage({ source: CONTENT_MESSAGE_SOURCE, type: 'ready' }, '*');
  window.addEventListener('scroll', scheduleScrollRatioPost, { passive: true });
  window.addEventListener('message', (event) => {
    if (!isAppScrollToMessage(event.data)) {
      return;
    }

    const _log_scrollToMessage = {
      href: window.location.href,
      message: event.data,
      scrollTop: getScrollElement().scrollTop,
      scrollLeft: getScrollElement().scrollLeft,
      documentElementScrollTop: document.documentElement.scrollTop,
      documentElementScrollLeft: document.documentElement.scrollLeft,
      bodyScrollTop: document.body.scrollTop,
      bodyScrollLeft: document.body.scrollLeft,
      suppressScrollUntil,
      lastSentRatio,
      lastSentAt,
    };
    // poslog-start
    poslog('content-scroll-to-message-received', false, 'frame received scrollTo command from parent app', _log_scrollToMessage);
    // poslog-end
    scrollToRatio(event.data.ratio);
  });
}
