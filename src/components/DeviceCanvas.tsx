import { useCallback, useEffect, useRef } from 'react';
import { createScrollToMessage, parseResponsiveLabMessage } from '../extension/messaging';
import { useAppStore } from '../store/appStore';
import { poslog } from '../services/pos-logger';
import { DeviceFrame } from './DeviceFrame';

const ACTIVE_SCROLL_SOURCE_LOCK_MS = 800;
const TOP_SCROLL_RATIO_THRESHOLD = 0.01;

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

  const registerIframe = useCallback((deviceId: string, iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      iframeRefs.current.set(deviceId, iframe);
      return;
    }

    iframeRefs.current.delete(deviceId);
  }, []);

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

      const scrollCommand = createScrollToMessage(targetRatio);
      const _log_targets = [...iframeRefs.current.keys()].filter((deviceId) => deviceId !== sourceDeviceId);
      const _log_sendContext = {
        ..._log_broadcastContext,
        scrollCommand,
        targetDeviceIds: _log_targets,
        lastBroadcastAtAfter: lastBroadcastAtRef.current,
      };
      // poslog-start
      poslog('app-scroll-sync-broadcast', false, 'broadcasting scrollTo command to sibling frames', _log_sendContext);
      // poslog-end

      iframeRefs.current.forEach((iframe, deviceId) => {
        if (deviceId === sourceDeviceId) {
          return;
        }

        const _log_targetContext = {
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
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeUrl, syncScroll]);

  const handleCanvasScroll = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const previousScroll = lastCanvasScrollRef.current;
    const _log_canvasScroll = {
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
      deltaLeft: canvas.scrollLeft - previousScroll.left,
      deltaTop: canvas.scrollTop - previousScroll.top,
      previousScroll,
      activeUrl,
      syncScroll,
      activeScrollSource: activeScrollSourceRef.current,
      iframeDeviceIds: [...iframeRefs.current.keys()],
    };
    lastCanvasScrollRef.current = { left: canvas.scrollLeft, top: canvas.scrollTop };
    // poslog-start
    poslog('app-device-canvas-scroll', false, 'outer device canvas scrolled', _log_canvasScroll);
    // poslog-end
  };

  return (
    <main
      ref={canvasRef}
      className="relative w-full flex-1 overflow-auto bg-appbg p-6 select-none"
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
  );
}
