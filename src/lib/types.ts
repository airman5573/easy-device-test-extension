export type DeviceSource = 'default' | 'preset' | 'custom';

export type DeviceCategory = 'mobile' | 'foldable' | 'tablet' | 'desktop';

export type DevicePreset = {
  presetId: string;
  name: string;
  width: number;
  height: number;
  category: DeviceCategory;
};

export type DeviceInstance = {
  id: string;
  presetId?: string;
  name: string;
  width: number;
  height: number;
  baseWidth: number;
  baseHeight: number;
  category: DeviceCategory;
  source: DeviceSource;
  reloadKey: number;
};

export type CustomDeviceInput = {
  name: string;
  width: number;
  height: number;
  category?: DeviceCategory;
};

export type PersistedAppState = {
  urlInput: string;
  activeUrl: string | null;
  zoom: number;
  syncScroll: boolean;
  devices: DeviceInstance[];
  customDevices: DevicePreset[];
};

export type ResponsiveLabReadyMessage = {
  source: 'responsive-lab-content';
  type: 'ready';
};

export type ResponsiveLabScrollMessage = {
  source: 'responsive-lab-content';
  type: 'scroll';
  ratio: number;
};

export type ResponsiveLabScrollToMessage = {
  source: 'responsive-lab-app';
  type: 'scrollTo';
  ratio: number;
};

export type ResponsiveLabMessage =
  | ResponsiveLabReadyMessage
  | ResponsiveLabScrollMessage
  | ResponsiveLabScrollToMessage;
