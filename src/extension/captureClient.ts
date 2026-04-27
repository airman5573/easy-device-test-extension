import { createCaptureViewportRequest, type CaptureViewportResponse } from './captureMessaging';

type CaptureViewportInput = {
  url: string;
  width: number;
  height: number;
  deviceName: string;
};

const hasRuntimeMessaging = (): boolean =>
  typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id) && typeof chrome.runtime.sendMessage === 'function';

export const captureViewport = async (input: CaptureViewportInput): Promise<CaptureViewportResponse> => {
  if (!hasRuntimeMessaging()) {
    return {
      source: 'responsive-lab-background',
      type: 'captureViewportResult',
      requestId: 'dev-mode-unavailable',
      ok: false,
      error: '캡처 모드는 빌드된 확장 프로그램을 크롬에 불러온 뒤에만 작동합니다.',
    };
  }

  const request = createCaptureViewportRequest(input);

  try {
    const response = (await chrome.runtime.sendMessage(request)) as CaptureViewportResponse | undefined;

    if (!response || response.source !== 'responsive-lab-background' || response.type !== 'captureViewportResult') {
      return {
        source: 'responsive-lab-background',
        type: 'captureViewportResult',
        requestId: request.requestId,
        ok: false,
        error: '캡처 모드가 올바르지 않은 응답을 반환했습니다.',
      };
    }

    return response;
  } catch (error) {
    return {
      source: 'responsive-lab-background',
      type: 'captureViewportResult',
      requestId: request.requestId,
      ok: false,
      error: error instanceof Error ? error.message : '캡처 모드가 실패했습니다.',
    };
  }
};
