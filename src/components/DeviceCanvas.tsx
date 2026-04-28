import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';
import { createScrollToMessage, parseResponsiveLabMessage } from '../extension/messaging';
import { useAppStore } from '../store/appStore';
import { poslog } from '../services/pos-logger';
import { DeviceFrame } from './DeviceFrame';

const ACTIVE_SCROLL_SOURCE_LOCK_MS = 800;
const TOP_SCROLL_RATIO_THRESHOLD = 0.01;
const CANVAS_HORIZONTAL_SCROLL_LOCK_MS = 1200;
const CANVAS_HORIZONTAL_SHIELD_VISIBLE_MS = 300;

type AcceptedScrollSync = {
  deviceId: string;
  ratio: number;
  acceptedAt: number;
};

export function DeviceCanvas() {
  const devices = useAppStore((state) => state.devices);
  const zoom = useAppStore((state) => state.zoom);
  const activeUrl = useAppStore((state) => state.activeUrl);
  const syncScroll = useAppStore((state) => state.syncScroll);
  const rotateDevice = useAppStore((state) => state.rotateDevice);
  const reloadDevice = useAppStore((state) => state.reloadDevice);
  const closeDevice = useAppStore((state) => state.closeDevice);
  const reorderDevices = useAppStore((state) => state.reorderDevices);
  const iframeRefs = useRef(new Map<string, HTMLIFrameElement>());
  const canvasRef = useRef<HTMLElement | null>(null);
  const lastCanvasScrollRef = useRef({ left: 0, top: 0 });
  const lastBroadcastAtRef = useRef(0);
  const activeScrollSourceRef = useRef<{ deviceId: string; until: number } | null>(null);
  const canvasHorizontalLockUntilRef = useRef(0);
  const canvasHorizontalUnlockTimerRef = useRef<number | null>(null);
  const canvasHorizontalShieldTimerRef = useRef<number | null>(null);
  const lastAcceptedScrollSyncRef = useRef<AcceptedScrollSync | null>(null);
  const syncScrollRef = useRef(syncScroll);
  const [isCanvasHorizontalShieldVisible, setIsCanvasHorizontalShieldVisible] = useState(false);

  const registerIframe = useCallback((deviceId: string, iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      iframeRefs.current.set(deviceId, iframe);
      return;
    }

    iframeRefs.current.delete(deviceId);
  }, []);

  useEffect(() => {
    syncScrollRef.current = syncScroll;
  }, [syncScroll]);

  useEffect(() => () => {
    if (canvasHorizontalUnlockTimerRef.current !== null) {
      window.clearTimeout(canvasHorizontalUnlockTimerRef.current);
    }

    if (canvasHorizontalShieldTimerRef.current !== null) {
      window.clearTimeout(canvasHorizontalShieldTimerRef.current);
    }
  }, []);

  const broadcastScrollRatio = useCallback((sourceDeviceId: string, ratio: number, reason: string) => {
    const scrollCommand = createScrollToMessage(ratio);
    const _log_targets = [...iframeRefs.current.keys()].filter((deviceId) => deviceId !== sourceDeviceId);
    const _log_broadcast = {
      reason,
      sourceDeviceId,
      ratio,
      scrollCommand,
      targetDeviceIds: _log_targets,
      iframeDeviceIds: [...iframeRefs.current.keys()],
      canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
      canvasScrollTop: canvasRef.current?.scrollTop ?? null,
      canvasHorizontalLockUntil: canvasHorizontalLockUntilRef.current,
      lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
    };
    // poslog-start
    poslog('app-scroll-sync-broadcast', false, 'broadcasting scrollTo command to sibling frames', _log_broadcast);
    // poslog-end

    iframeRefs.current.forEach((iframe, deviceId) => {
      if (deviceId === sourceDeviceId) {
        return;
      }

      const _log_targetContext = {
        reason,
        scrollCommand,
        sourceDeviceId,
        targetDeviceId: deviceId,
        iframeSrc: iframe.src,
      };
      // poslog-start
      poslog('app-scroll-sync-target-posted', false, 'posted scrollTo command to target frame', _log_targetContext);
      // poslog-end
      iframe.contentWindow?.postMessage(scrollCommand, '*');
    });
  }, []);


  const scheduleCanvasHorizontalShieldHide = useCallback(() => {
    if (canvasHorizontalShieldTimerRef.current !== null) {
      window.clearTimeout(canvasHorizontalShieldTimerRef.current);
    }

    canvasHorizontalShieldTimerRef.current = window.setTimeout(() => {
      canvasHorizontalShieldTimerRef.current = null;
      setIsCanvasHorizontalShieldVisible(false);

      const _log_shieldHidden = {
        shieldVisibleMs: CANVAS_HORIZONTAL_SHIELD_VISIBLE_MS,
        canvasHorizontalLockUntil: canvasHorizontalLockUntilRef.current,
        remainingLockMs: Math.max(0, canvasHorizontalLockUntilRef.current - Date.now()),
        lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
        canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
        canvasScrollTop: canvasRef.current?.scrollTop ?? null,
      };
      // poslog-start
      poslog('app-canvas-horizontal-shield-hidden', false, 'canvas horizontal shield hidden before sync lock ends', _log_shieldHidden);
      // poslog-end
    }, CANVAS_HORIZONTAL_SHIELD_VISIBLE_MS);
  }, []);

  const scheduleCanvasHorizontalUnlock = useCallback(() => {
    if (canvasHorizontalUnlockTimerRef.current !== null) {
      window.clearTimeout(canvasHorizontalUnlockTimerRef.current);
    }

    canvasHorizontalUnlockTimerRef.current = window.setTimeout(() => {
      canvasHorizontalUnlockTimerRef.current = null;
      const now = Date.now();

      if (now < canvasHorizontalLockUntilRef.current) {
        scheduleCanvasHorizontalUnlock();
        return;
      }

      const lastAcceptedScrollSync = lastAcceptedScrollSyncRef.current;
      const _log_unlockContext = {
        now,
        syncScroll: syncScrollRef.current,
        lastAcceptedScrollSync,
        canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
        canvasScrollTop: canvasRef.current?.scrollTop ?? null,
        iframeDeviceIds: [...iframeRefs.current.keys()],
      };
      // poslog-start
      poslog('app-canvas-horizontal-lock-ended', false, 'canvas horizontal scroll lock ended', _log_unlockContext);
      // poslog-end

      if (!syncScrollRef.current || !lastAcceptedScrollSync) {
        return;
      }

      // poslog-start
      poslog('app-canvas-horizontal-lock-resync-broadcast', false, 'resyncing siblings after canvas horizontal lock ended', _log_unlockContext);
      // poslog-end
      broadcastScrollRatio(lastAcceptedScrollSync.deviceId, lastAcceptedScrollSync.ratio, 'post-canvas-horizontal-lock-resync');
    }, CANVAS_HORIZONTAL_SCROLL_LOCK_MS);
  }, [broadcastScrollRatio]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = parseResponsiveLabMessage(event.data);

      if (!message || message.source !== 'responsive-lab-content') {
        return;
      }

      const sourceDeviceEntry = [...iframeRefs.current.entries()].find(([, iframe]) => iframe.contentWindow === event.source);

      if (!sourceDeviceEntry) {
        const _log_unmatchedMessage = {
          message,
          iframeCount: iframeRefs.current.size,
          activeUrl,
          syncScroll,
          canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
          canvasScrollTop: canvasRef.current?.scrollTop ?? null,
        };
        // poslog-start
        poslog('app-scroll-message-unmatched-source', false, 'content scroll message had no matching iframe', _log_unmatchedMessage);
        // poslog-end
        return;
      }

      const now = Date.now();
      const [sourceDeviceId] = sourceDeviceEntry;
      const activeScrollSource = activeScrollSourceRef.current;
      const _log_messageContext = {
        message,
        sourceDeviceId,
        syncScroll,
        activeScrollSource,
        lastBroadcastAt: lastBroadcastAtRef.current,
        iframeDeviceIds: [...iframeRefs.current.keys()],
        canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
        canvasScrollTop: canvasRef.current?.scrollTop ?? null,
      };
      // poslog-start
      poslog('app-scroll-message-received', false, 'content scroll message received by app', _log_messageContext);
      // poslog-end

      if (message.type === 'ready') {
        // poslog-start
        poslog('app-scroll-ready-message-ignored', false, 'ready message ignored for scroll sync', _log_messageContext);
        // poslog-end
        return;
      }

      if (!syncScroll || message.type !== 'scroll') {
        // poslog-start
        poslog('app-scroll-message-sync-disabled', false, 'scroll message ignored because sync is disabled or type is not scroll', _log_messageContext);
        // poslog-end
        return;
      }

      if (now < canvasHorizontalLockUntilRef.current) {
        const _log_lockIgnoredContext = {
          ..._log_messageContext,
          canvasHorizontalLockUntil: canvasHorizontalLockUntilRef.current,
          remainingLockMs: canvasHorizontalLockUntilRef.current - now,
          lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
        };
        // poslog-start
        poslog('app-scroll-message-canvas-horizontal-lock-ignored', false, 'scroll message ignored during canvas horizontal lock', _log_lockIgnoredContext);
        // poslog-end
        return;
      }

      if (activeScrollSource && activeScrollSource.until > now && activeScrollSource.deviceId !== sourceDeviceId) {
        // poslog-start
        poslog('app-scroll-source-lock-rejected', false, 'scroll message rejected by active source lock', _log_messageContext);
        // poslog-end
        return;
      }

      activeScrollSourceRef.current = {
        deviceId: sourceDeviceId,
        until: now + ACTIVE_SCROLL_SOURCE_LOCK_MS,
      };

      const targetRatio = message.ratio <= TOP_SCROLL_RATIO_THRESHOLD ? 0 : message.ratio;
      const reachedTop = targetRatio === 0;
      const _log_broadcastContext = {
        message,
        sourceDeviceId,
        targetRatio,
        reachedTop,
        activeScrollSourceBefore: activeScrollSource,
        activeScrollSourceAfter: activeScrollSourceRef.current,
        lastBroadcastAtBefore: lastBroadcastAtRef.current,
        iframeDeviceIds: [...iframeRefs.current.keys()],
        canvasScrollLeft: canvasRef.current?.scrollLeft ?? null,
        canvasScrollTop: canvasRef.current?.scrollTop ?? null,
      };

      if (!reachedTop && now - lastBroadcastAtRef.current < 50) {
        // poslog-start
        poslog('app-scroll-broadcast-throttled', false, 'non-top scroll broadcast throttled', _log_broadcastContext);
        // poslog-end
        return;
      }
      lastBroadcastAtRef.current = now;

      lastAcceptedScrollSyncRef.current = {
        deviceId: sourceDeviceId,
        ratio: targetRatio,
        acceptedAt: now,
      };
      const _log_acceptContext = {
        ..._log_broadcastContext,
        lastBroadcastAtAfter: lastBroadcastAtRef.current,
        lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
      };
      // poslog-start
      poslog('app-scroll-sync-accepted', false, 'accepted stable iframe scroll sync source', _log_acceptContext);
      // poslog-end
      broadcastScrollRatio(sourceDeviceId, targetRatio, 'live-scroll');
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeUrl, broadcastScrollRatio, syncScroll]);

  const handleCanvasScroll = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const previousScroll = lastCanvasScrollRef.current;
    const deltaLeft = canvas.scrollLeft - previousScroll.left;
    const deltaTop = canvas.scrollTop - previousScroll.top;
    const now = Date.now();

    if (deltaLeft !== 0) {
      canvasHorizontalLockUntilRef.current = now + CANVAS_HORIZONTAL_SCROLL_LOCK_MS;
      setIsCanvasHorizontalShieldVisible(true);
      scheduleCanvasHorizontalShieldHide();
      scheduleCanvasHorizontalUnlock();
    }

    const _log_canvasScroll = {
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
      deltaLeft,
      deltaTop,
      previousScroll,
      activeUrl,
      syncScroll,
      activeScrollSource: activeScrollSourceRef.current,
      canvasHorizontalLockUntil: canvasHorizontalLockUntilRef.current,
      horizontalLockDurationMs: CANVAS_HORIZONTAL_SCROLL_LOCK_MS,
      horizontalShieldVisibleMs: CANVAS_HORIZONTAL_SHIELD_VISIBLE_MS,
      lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
      iframeDeviceIds: [...iframeRefs.current.keys()],
    };
    lastCanvasScrollRef.current = { left: canvas.scrollLeft, top: canvas.scrollTop };
    // poslog-start
    poslog('app-device-canvas-scroll', false, 'outer device canvas scrolled', _log_canvasScroll);
    // poslog-end

    if (deltaLeft !== 0) {
      // poslog-start
      poslog('app-canvas-horizontal-lock-started', false, 'canvas horizontal scroll lock started or extended', _log_canvasScroll);
      // poslog-end
    }
  };

  const handleCanvasShieldWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const deltaLeft = event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    const deltaTop = event.shiftKey ? 0 : event.deltaY;

    if (deltaLeft === 0 && deltaTop === 0) {
      return;
    }

    canvas.scrollLeft += deltaLeft;
    canvas.scrollTop += deltaTop;

    const _log_shieldWheel = {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      shiftKey: event.shiftKey,
      forwardedDeltaLeft: deltaLeft,
      forwardedDeltaTop: deltaTop,
      canvasScrollLeft: canvas.scrollLeft,
      canvasScrollTop: canvas.scrollTop,
      canvasHorizontalLockUntil: canvasHorizontalLockUntilRef.current,
      lastAcceptedScrollSync: lastAcceptedScrollSyncRef.current,
    };
    // poslog-start
    poslog('app-canvas-horizontal-shield-wheel-forwarded', false, 'horizontal shield forwarded wheel input to canvas', _log_shieldWheel);
    // poslog-end
  }, []);

  return (
    <section className="relative min-h-0 flex-1 overflow-hidden" data-ai-id="device-canvas-shell">
      <main
        ref={canvasRef}
        className="relative h-full w-full overflow-auto bg-appbg p-6 select-none"
        data-ai-id="device-canvas"
        onScroll={handleCanvasScroll}
      >
        <div className="flex h-full w-max items-start gap-6" data-ai-id="device-canvas-content">
          {devices.length === 0 ? (
            <div
              className="flex h-full min-w-[360px] items-center justify-center rounded-md border border-dashed border-bordercol bg-vpbg px-8 text-sm text-slate-500"
              data-ai-id="device-canvas-empty-state"
            >
              선택된 기기가 없습니다. 추가 버튼으로 미리보기 프레임을 만드세요.
            </div>
          ) : null}
          {devices.map((device, index) => (
            <DeviceFrame
              key={device.id}
              device={device}
              index={index}
              zoom={zoom}
              activeUrl={activeUrl}
              onRotate={rotateDevice}
              onReload={reloadDevice}
              onClose={closeDevice}
              onMove={reorderDevices}
              onIframeRef={registerIframe}
            />
          ))}
        </div>
      </main>
      {isCanvasHorizontalShieldVisible ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-50 cursor-ew-resize bg-transparent"
          data-ai-id="device-canvas-horizontal-scroll-shield"
          onPointerDown={(event) => event.preventDefault()}
          onWheel={handleCanvasShieldWheel}
        />
      ) : null}
    </section>
  );
}
