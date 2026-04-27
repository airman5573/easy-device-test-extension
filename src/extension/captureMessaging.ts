export type CaptureViewportRequest = {
  source: 'responsive-lab-app';
  type: 'captureViewport';
  requestId: string;
  url: string;
  width: number;
  height: number;
  deviceName: string;
};

export type CaptureViewportSuccess = {
  source: 'responsive-lab-background';
  type: 'captureViewportResult';
  requestId: string;
  ok: true;
  imageDataUrl: string;
};

export type CaptureViewportFailure = {
  source: 'responsive-lab-background';
  type: 'captureViewportResult';
  requestId: string;
  ok: false;
  error: string;
};

export type CaptureViewportResponse = CaptureViewportSuccess | CaptureViewportFailure;

export const isCaptureViewportRequest = (value: unknown): value is CaptureViewportRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CaptureViewportRequest>;

  const { width, height } = candidate;

  return (
    candidate.source === 'responsive-lab-app' &&
    candidate.type === 'captureViewport' &&
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 0 &&
    typeof candidate.url === 'string' &&
    /^https?:\/\//i.test(candidate.url) &&
    typeof width === 'number' &&
    Number.isInteger(width) &&
    width > 0 &&
    width <= 10000 &&
    typeof height === 'number' &&
    Number.isInteger(height) &&
    height > 0 &&
    height <= 10000 &&
    typeof candidate.deviceName === 'string' &&
    candidate.deviceName.length > 0
  );
};

export const createCaptureViewportRequest = (
  input: Omit<CaptureViewportRequest, 'source' | 'type' | 'requestId'>,
): CaptureViewportRequest => ({
  source: 'responsive-lab-app',
  type: 'captureViewport',
  requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  ...input,
});
