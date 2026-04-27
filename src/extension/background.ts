import { isCaptureViewportRequest, type CaptureViewportRequest, type CaptureViewportResponse } from './captureMessaging';

const CAPTURE_TIMEOUT_MS = 30000;
const POST_LOAD_SETTLE_MS = 1500;

const createExtensionUrl = (currentTabUrl?: string): string => {
  const extensionUrl = new URL(chrome.runtime.getURL('index.html'));

  if (currentTabUrl) {
    extensionUrl.searchParams.set('url', currentTabUrl);
  }

  return extensionUrl.toString();
};

chrome.action.onClicked.addListener((tab) => {
  void chrome.tabs.create({
    url: createExtensionUrl(tab.url ?? tab.pendingUrl),
  });
});

const delay = (milliseconds: number) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

const withTimeout = async <T>(promise: Promise<T>, timeoutMessage: string, timeoutMs = CAPTURE_TIMEOUT_MS): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = globalThis.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
};

const getDeviceScaleFactor = (width: number): number => {
  if (width <= 430) {
    return 2;
  }

  if (width <= 1024) {
    return 1.5;
  }

  return 1;
};

const waitForPageLoad = async (tabId: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    let resolved = false;
    const timeoutId = globalThis.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.debugger.onEvent.removeListener(listener);
        resolve();
      }
    }, 10000);

    const listener = (source: chrome.debugger.Debuggee, method: string) => {
      if (source.tabId !== tabId || method !== 'Page.loadEventFired' || resolved) {
        return;
      }

      resolved = true;
      globalThis.clearTimeout(timeoutId);
      chrome.debugger.onEvent.removeListener(listener);
      resolve();
    };

    chrome.debugger.onEvent.addListener(listener);
  });
};

const captureViewportWithDebugger = async (request: CaptureViewportRequest): Promise<string> => {
  let tabId: number | undefined;
  let attached = false;

  try {
    const tab = await chrome.tabs.create({ url: 'about:blank', active: false });

    if (typeof tab.id !== 'number') {
      throw new Error('Could not create a capture tab.');
    }

    tabId = tab.id;
    const debuggee: chrome.debugger.Debuggee = { tabId };

    await chrome.debugger.attach(debuggee, '1.3');
    attached = true;
    await chrome.debugger.sendCommand(debuggee, 'Page.enable');
    await chrome.debugger.sendCommand(debuggee, 'Network.enable');
    await chrome.debugger.sendCommand(debuggee, 'Emulation.setDeviceMetricsOverride', {
      width: request.width,
      height: request.height,
      deviceScaleFactor: getDeviceScaleFactor(request.width),
      mobile: request.width <= 820,
      screenWidth: request.width,
      screenHeight: request.height,
    });

    const loadPromise = waitForPageLoad(tabId);
    await chrome.debugger.sendCommand(debuggee, 'Page.navigate', { url: request.url });
    await withTimeout(loadPromise, `Timed out while loading ${request.url}.`, 12000);
    await delay(POST_LOAD_SETTLE_MS);

    const screenshot = (await chrome.debugger.sendCommand(debuggee, 'Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    })) as { data?: string };

    if (!screenshot.data) {
      throw new Error('Chrome did not return screenshot data.');
    }

    return `data:image/png;base64,${screenshot.data}`;
  } finally {
    if (tabId !== undefined && attached) {
      await chrome.debugger.detach({ tabId }).catch(() => undefined);
    }

    if (tabId !== undefined) {
      await chrome.tabs.remove(tabId).catch(() => undefined);
    }
  }
};

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isCaptureViewportRequest(message)) {
    return false;
  }

  void withTimeout(
    captureViewportWithDebugger(message).then<CaptureViewportResponse>((imageDataUrl) => ({
      source: 'responsive-lab-background',
      type: 'captureViewportResult',
      requestId: message.requestId,
      ok: true,
      imageDataUrl,
    })),
    '캡처 모드 시간이 초과되었습니다.',
  )
    .catch<CaptureViewportResponse>((error) => ({
      source: 'responsive-lab-background',
      type: 'captureViewportResult',
      requestId: message.requestId,
      ok: false,
      error: error instanceof Error ? error.message : '캡처 모드가 실패했습니다.',
    }))
    .then(sendResponse);

  return true;
});
