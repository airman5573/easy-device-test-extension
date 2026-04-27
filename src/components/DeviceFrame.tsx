import { useEffect, useState } from 'react';
import { captureViewport } from '../extension/captureClient';
import { getDeviceWrapperSize, getZoomScale } from '../lib/deviceMath';
import type { DeviceInstance } from '../lib/types';
import { EmptyFrameState } from './EmptyFrameState';
import { IframeBlockedState } from './IframeBlockedState';

type DeviceFrameProps = {
  device: DeviceInstance;
  zoom: number;
  activeUrl: string | null;
  onRotate: (deviceId: string) => void;
  onReload: (deviceId: string) => void;
  index: number;
  onClose: (deviceId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onIframeRef: (deviceId: string, iframe: HTMLIFrameElement | null) => void;
};

type FrameLoadStatus = 'idle' | 'loading' | 'loaded' | 'maybe-blocked';
type CaptureState =
  | { status: 'idle' }
  | { status: 'capturing' }
  | { status: 'captured'; imageDataUrl: string; capturedAt: number }
  | { status: 'failed'; error: string };

const IFRAME_TIMEOUT_MS = 8000;
const FRAME_HEADER_HEIGHT = 40;

export function DeviceFrame({ device, zoom, activeUrl, index, onRotate, onReload, onClose, onMove, onIframeRef }: DeviceFrameProps) {
  const wrapperSize = getDeviceWrapperSize(device, zoom);
  const scale = getZoomScale(zoom);
  const [loadStatus, setLoadStatus] = useState<FrameLoadStatus>('idle');
  const [captureState, setCaptureState] = useState<CaptureState>({ status: 'idle' });
  const iframeKey = activeUrl ? `${device.id}-${device.reloadKey}-${activeUrl}` : `${device.id}-empty`;
  const viewportHeight = Math.max(100, device.height - FRAME_HEADER_HEIGHT);

  useEffect(() => {
    setCaptureState({ status: 'idle' });

    if (!activeUrl) {
      setLoadStatus('idle');
      return;
    }

    setLoadStatus('loading');
    const timeoutId = window.setTimeout(() => {
      setLoadStatus((currentStatus) => (currentStatus === 'loading' ? 'maybe-blocked' : currentStatus));
    }, IFRAME_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activeUrl, device.reloadKey, device.width, device.height]);

  const retryIframe = () => {
    setCaptureState({ status: 'idle' });
    setLoadStatus('loading');
    onReload(device.id);
  };

  const captureFallback = async () => {
    if (!activeUrl || captureState.status === 'capturing') {
      return;
    }

    setCaptureState({ status: 'capturing' });
    const result = await captureViewport({
      url: activeUrl,
      width: device.width,
      height: viewportHeight,
      deviceName: device.name,
    });

    if (result.ok) {
      setCaptureState({ status: 'captured', imageDataUrl: result.imageDataUrl, capturedAt: Date.now() });
      return;
    }

    setCaptureState({ status: 'failed', error: result.error });
  };

  const openInNewTab = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="shrink-0"
      data-device-id={device.id}
      data-ai-id="device-frame-wrapper"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData('text/plain'));
        if (Number.isInteger(fromIndex)) {
          onMove(fromIndex, index);
        }
      }}
      style={{ width: `${wrapperSize.width}px`, height: `${wrapperSize.height}px` }}
    >
      <div
        className="flex flex-col overflow-hidden border border-bordercol bg-white"
        data-ai-id="device-frame"
        style={{
          width: `${device.width}px`,
          height: `${device.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-bordercol bg-vphead px-4" data-ai-id="device-frame-header">
          <div className="flex items-center gap-4" data-ai-id="device-frame-header-info-section">
            <span
              aria-label="드래그 손잡이"
              className="flex h-6 w-4 cursor-move items-center justify-center text-[20px] leading-none text-slate-400 opacity-80"
              title="끌어서 순서 변경"
              draggable
              data-ai-id="device-frame-header-drag-handle"
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(index));
              }}
            >
              ⋮
            </span>
            <div className="flex items-center gap-3.5" data-ai-id="device-frame-header-metadata">
              <span className="text-[15px] font-semibold tracking-wide text-[#333333]" data-ai-id="device-frame-header-name-text">
                {device.name}
              </span>
              <span className="text-[13px] font-medium text-[#666666]" data-ai-id="device-frame-header-size-text">
                {device.width} × {device.height}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2" data-ai-id="device-frame-header-actions">
            <button
              type="button"
              aria-label={`${device.name} 회전`}
              className="flex h-8 w-8 items-center justify-center text-[18px] text-[#666666] transition-colors hover:text-[#333333]"
              onClick={() => onRotate(device.id)}
              data-ai-id="device-frame-header-actions-rotate-button"
            >
              <span data-ai-id="device-frame-header-actions-rotate-button-icon">↻</span>
            </button>
            <button
              type="button"
              aria-label={`${device.name} 새로고침`}
              className="flex h-8 w-8 items-center justify-center text-[18px] text-[#666666] transition-colors hover:text-[#333333]"
              onClick={() => onReload(device.id)}
              data-ai-id="device-frame-header-actions-reload-button"
            >
              <span data-ai-id="device-frame-header-actions-reload-button-icon">⟳</span>
            </button>
            <button
              type="button"
              aria-label={`${device.name} 닫기`}
              className="flex h-8 w-8 items-center justify-center text-[20px] text-[#666666] transition-colors hover:text-[#333333]"
              onClick={() => onClose(device.id)}
              data-ai-id="device-frame-header-actions-close-button"
            >
              <span data-ai-id="device-frame-header-actions-close-button-icon">×</span>
            </button>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-white" data-ai-id="device-frame-viewport">
          {!activeUrl ? <EmptyFrameState /> : null}
          {activeUrl && captureState.status === 'capturing' ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-vpbg px-8 text-center" data-ai-id="device-frame-capturing-state">
              <div className="text-[15px] font-semibold text-white" data-ai-id="device-frame-capturing-state-title-text">
                화면을 캡처하는 중…
              </div>
              <p className="text-[13px] leading-5 text-slate-400" data-ai-id="device-frame-capturing-state-description-text">
                임시 크롬 탭을 {device.width} × {viewportHeight} 크기로 열고 표시된 페이지를 캡처합니다.
              </p>
            </div>
          ) : null}
          {activeUrl && captureState.status === 'captured' ? (
            <div className="relative h-full w-full bg-white" data-ai-id="device-frame-captured-state">
              <img
                src={captureState.imageDataUrl}
                alt={`${device.name} 캡처 미리보기`}
                className="block h-full w-full object-contain object-top"
                draggable={false}
                data-ai-id="device-frame-captured-state-preview-image"
              />
              <div
                className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200 shadow"
                data-ai-id="device-frame-captured-state-timestamp-badge"
              >
                캡처 대체 화면 · {new Date(captureState.capturedAt).toLocaleTimeString()}
              </div>
              <button
                type="button"
                className="absolute bottom-2 right-2 rounded border border-bordercol bg-slate-950/80 px-2 py-1 text-[11px] text-white shadow transition-colors hover:bg-slate-800"
                onClick={captureFallback}
                data-ai-id="device-frame-captured-state-recapture-button"
              >
                <span data-ai-id="device-frame-captured-state-recapture-button-label-text">다시 캡처</span>
              </button>
            </div>
          ) : null}
          {activeUrl && captureState.status === 'failed' ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-vpbg px-8 text-center" data-ai-id="device-frame-capture-failed-state">
              <div className="text-[15px] font-semibold text-white" data-ai-id="device-frame-capture-failed-state-title-text">
                캡처 실패
              </div>
              <p className="max-w-[420px] text-[13px] leading-5 text-slate-400" data-ai-id="device-frame-capture-failed-state-error-text">
                {captureState.error}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2" data-ai-id="device-frame-capture-failed-state-actions">
                <button
                  type="button"
                  className="rounded border border-brand bg-brand px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-indigo-500"
                  onClick={captureFallback}
                  data-ai-id="device-frame-capture-failed-state-actions-recapture-button"
                >
                  <span data-ai-id="device-frame-capture-failed-state-actions-recapture-button-label-text">캡처 다시 시도</span>
                </button>
                <button
                  type="button"
                  className="rounded border border-bordercol bg-btnbg px-3 py-1.5 text-[13px] text-white transition-colors hover:bg-btnhover"
                  onClick={openInNewTab}
                  data-ai-id="device-frame-capture-failed-state-actions-open-tab-button"
                >
                  <span data-ai-id="device-frame-capture-failed-state-actions-open-tab-button-label-text">새 탭에서 열기</span>
                </button>
                <button
                  type="button"
                  className="rounded border border-bordercol bg-transparent px-3 py-1.5 text-[13px] text-slate-300 transition-colors hover:bg-btnhover hover:text-white"
                  onClick={retryIframe}
                  data-ai-id="device-frame-capture-failed-state-actions-retry-frame-button"
                >
                  <span data-ai-id="device-frame-capture-failed-state-actions-retry-frame-button-label-text">프레임 다시 시도</span>
                </button>
              </div>
            </div>
          ) : null}
          {activeUrl && loadStatus === 'maybe-blocked' && captureState.status === 'idle' ? (
            <IframeBlockedState url={activeUrl} onRetry={retryIframe} onCapture={captureFallback} />
          ) : null}
          {activeUrl && loadStatus !== 'maybe-blocked' && captureState.status === 'idle' ? (
            <>
              {loadStatus === 'loading' ? (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-vpbg text-[13px] font-medium text-slate-400"
                  data-ai-id="device-frame-loading-state"
                >
                  미리보기를 불러오는 중…
                </div>
              ) : null}
              <iframe
                key={iframeKey}
                title={`${device.name} 미리보기`}
                src={activeUrl}
                className="block border-0 bg-white"
                style={{ width: `${device.width}px`, height: `${viewportHeight}px` }}
                onLoad={() => setLoadStatus('loaded')}
                onError={() => setLoadStatus('maybe-blocked')}
                ref={(iframe) => onIframeRef(device.id, iframe)}
                referrerPolicy="no-referrer-when-downgrade"
                data-ai-id="device-frame-iframe"
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
