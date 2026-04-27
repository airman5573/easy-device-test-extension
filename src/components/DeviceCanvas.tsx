import { useCallback, useEffect, useRef } from 'react';
import { createScrollToMessage, parseResponsiveLabMessage } from '../extension/messaging';
import { useAppStore } from '../store/appStore';
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
        return;
      }

      if (message.type === 'ready') {
        return;
      }

      if (!syncScroll || message.type !== 'scroll') {
        return;
      }

      const now = Date.now();
      const [sourceDeviceId] = sourceDeviceEntry;
      const activeScrollSource = activeScrollSourceRef.current;

      if (activeScrollSource && activeScrollSource.until > now && activeScrollSource.deviceId !== sourceDeviceId) {
        return;
      }

      activeScrollSourceRef.current = {
        deviceId: sourceDeviceId,
        until: now + ACTIVE_SCROLL_SOURCE_LOCK_MS,
      };

      const targetRatio = message.ratio <= TOP_SCROLL_RATIO_THRESHOLD ? 0 : message.ratio;
      const reachedTop = targetRatio === 0;

      if (!reachedTop && now - lastBroadcastAtRef.current < 50) {
        return;
      }
      lastBroadcastAtRef.current = now;

      const scrollCommand = createScrollToMessage(targetRatio);

      iframeRefs.current.forEach((iframe, deviceId) => {
        if (deviceId === sourceDeviceId) {
          return;
        }

        iframe.contentWindow?.postMessage(scrollCommand, '*');
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [syncScroll]);

  return (
    <main className="relative w-full flex-1 overflow-auto bg-appbg p-6 select-none" data-ai-id="device-canvas">
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
