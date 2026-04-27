import type { DeviceCategory, DeviceInstance, DevicePreset } from '../lib/types';

export const DEVICE_CATEGORY_LABELS: Record<DeviceCategory, string> = {
  mobile: '모바일',
  foldable: '폴더블',
  tablet: '태블릿',
  desktop: '데스크톱',
};

export const DEVICE_CATEGORY_ORDER = ['mobile', 'foldable', 'tablet', 'desktop'] as const satisfies readonly DeviceCategory[];

export const DEFAULT_DEVICE_PRESETS = [
  { presetId: 'kr-mobile-galaxy-s26', name: 'Galaxy S26', width: 360, height: 780, category: 'mobile' },
  { presetId: 'kr-mobile-galaxy-s26-plus', name: 'Galaxy S26+', width: 384, height: 832, category: 'mobile' },
  { presetId: 'kr-mobile-galaxy-s26-ultra', name: 'Galaxy S26 Ultra', width: 412, height: 891, category: 'mobile' },
  { presetId: 'kr-mobile-iphone-17', name: 'iPhone 17', width: 402, height: 874, category: 'mobile' },
  { presetId: 'kr-mobile-iphone-17-air', name: 'iPhone Air', width: 420, height: 912, category: 'mobile' },
  { presetId: 'kr-mobile-iphone-17-pro-max', name: 'iPhone 17 Pro Max', width: 440, height: 956, category: 'mobile' },
  { presetId: 'kr-foldable-galaxy-z-flip7', name: 'Galaxy Z Flip7', width: 393, height: 916, category: 'foldable' },
  { presetId: 'kr-foldable-galaxy-z-fold7-cover', name: 'Galaxy Z Fold7 외부', width: 360, height: 840, category: 'foldable' },
  { presetId: 'kr-foldable-galaxy-z-fold7-main', name: 'Galaxy Z Fold7 내부', width: 656, height: 728, category: 'foldable' },
] as const satisfies readonly DevicePreset[];

export const ADD_DEVICE_PRESETS = [
  { presetId: 'galaxy-s26', name: 'Galaxy S26', width: 360, height: 780, category: 'mobile' },
  { presetId: 'galaxy-s26-plus', name: 'Galaxy S26+', width: 384, height: 832, category: 'mobile' },
  { presetId: 'galaxy-s26-ultra', name: 'Galaxy S26 Ultra', width: 412, height: 891, category: 'mobile' },
  { presetId: 'galaxy-s25', name: 'Galaxy S25', width: 360, height: 780, category: 'mobile' },
  { presetId: 'galaxy-s25-plus', name: 'Galaxy S25+', width: 384, height: 832, category: 'mobile' },
  { presetId: 'galaxy-s25-edge', name: 'Galaxy S25 Edge', width: 384, height: 832, category: 'mobile' },
  { presetId: 'galaxy-s25-ultra', name: 'Galaxy S25 Ultra', width: 412, height: 891, category: 'mobile' },
  { presetId: 'galaxy-s25-fe', name: 'Galaxy S25 FE', width: 360, height: 780, category: 'mobile' },
  { presetId: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780, category: 'mobile' },
  { presetId: 'galaxy-s24-plus', name: 'Galaxy S24+', width: 384, height: 854, category: 'mobile' },
  { presetId: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', width: 412, height: 915, category: 'mobile' },
  { presetId: 'iphone-se-3', name: 'iPhone SE 3세대', width: 375, height: 667, category: 'mobile' },
  { presetId: 'iphone-15', name: 'iPhone 15', width: 393, height: 852, category: 'mobile' },
  { presetId: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 852, category: 'mobile' },
  { presetId: 'iphone-15-plus', name: 'iPhone 15 Plus', width: 430, height: 932, category: 'mobile' },
  { presetId: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', width: 430, height: 932, category: 'mobile' },
  { presetId: 'iphone-16e', name: 'iPhone 16e', width: 390, height: 844, category: 'mobile' },
  { presetId: 'iphone-16', name: 'iPhone 16', width: 390, height: 844, category: 'mobile' },
  { presetId: 'iphone-16-pro', name: 'iPhone 16 Pro', width: 393, height: 852, category: 'mobile' },
  { presetId: 'iphone-16-plus', name: 'iPhone 16 Plus', width: 428, height: 926, category: 'mobile' },
  { presetId: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 430, height: 932, category: 'mobile' },
  { presetId: 'iphone-17', name: 'iPhone 17', width: 402, height: 874, category: 'mobile' },
  { presetId: 'iphone-17-air', name: 'iPhone Air', width: 420, height: 912, category: 'mobile' },
  { presetId: 'iphone-17-pro', name: 'iPhone 17 Pro', width: 402, height: 874, category: 'mobile' },
  { presetId: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', width: 440, height: 956, category: 'mobile' },

  { presetId: 'galaxy-z-fold7-cover', name: 'Galaxy Z Fold7 외부', width: 360, height: 840, category: 'foldable' },
  { presetId: 'galaxy-z-fold7-main', name: 'Galaxy Z Fold7 내부', width: 656, height: 728, category: 'foldable' },
  { presetId: 'galaxy-z-fold6-cover', name: 'Galaxy Z Fold6 외부', width: 323, height: 792, category: 'foldable' },
  { presetId: 'galaxy-z-fold6-main', name: 'Galaxy Z Fold6 내부', width: 619, height: 720, category: 'foldable' },
  { presetId: 'galaxy-z-flip7', name: 'Galaxy Z Flip7', width: 393, height: 916, category: 'foldable' },
  { presetId: 'galaxy-z-flip7-fe', name: 'Galaxy Z Flip7 FE', width: 393, height: 960, category: 'foldable' },
  { presetId: 'galaxy-z-flip6', name: 'Galaxy Z Flip6', width: 393, height: 960, category: 'foldable' },

  { presetId: 'galaxy-tab-s10-ultra', name: 'Galaxy Tab S10 Ultra', width: 960, height: 1536, category: 'tablet' },
  { presetId: 'galaxy-tab-s10-plus', name: 'Galaxy Tab S10+', width: 900, height: 1440, category: 'tablet' },
  { presetId: 'galaxy-tab-s9', name: 'Galaxy Tab S9', width: 800, height: 1280, category: 'tablet' },
  { presetId: 'ipad-10th', name: 'iPad 10세대', width: 820, height: 1180, category: 'tablet' },
  { presetId: 'ipad-air-11', name: 'iPad Air 11', width: 820, height: 1180, category: 'tablet' },
  { presetId: 'ipad-air-13', name: 'iPad Air 13', width: 1024, height: 1366, category: 'tablet' },
  { presetId: 'ipad-pro-11', name: 'iPad Pro 11', width: 834, height: 1194, category: 'tablet' },
  { presetId: 'ipad-pro-13', name: 'iPad Pro 13', width: 1024, height: 1366, category: 'tablet' },

  { presetId: 'desktop-hd', name: 'Desktop HD', width: 1280, height: 720, category: 'desktop' },
  { presetId: 'desktop-laptop', name: 'Laptop 1366', width: 1366, height: 768, category: 'desktop' },
  { presetId: 'desktop-macbook-air-13', name: 'MacBook Air 13', width: 1440, height: 900, category: 'desktop' },
  { presetId: 'desktop-macbook-pro-14', name: 'MacBook Pro 14', width: 1512, height: 982, category: 'desktop' },
  { presetId: 'desktop-fhd', name: 'Desktop FHD', width: 1920, height: 1080, category: 'desktop' },
] as const satisfies readonly DevicePreset[];

const RECOMMENDED_SET_PRESET_IDS = {
  mobile: [
    'galaxy-s26',
    'galaxy-s26-plus',
    'galaxy-s26-ultra',
    'galaxy-s25',
    'galaxy-s25-plus',
    'galaxy-s25-edge',
    'galaxy-s25-ultra',
    'galaxy-s25-fe',
    'iphone-17',
    'iphone-17-air',
    'iphone-17-pro',
    'iphone-17-pro-max',
    'iphone-16e',
    'iphone-16',
    'iphone-16-pro',
    'iphone-16-pro-max',
    'iphone-se-3',
    'galaxy-z-flip7',
    'galaxy-z-fold7-cover',
    'galaxy-z-fold7-main',
    'galaxy-z-fold6-cover',
    'galaxy-z-fold6-main',
  ],
  tablet: ['galaxy-tab-s10-plus', 'galaxy-tab-s10-ultra', 'ipad-air-11', 'ipad-air-13', 'ipad-pro-11', 'ipad-pro-13'],
  desktop: ['desktop-hd', 'desktop-laptop', 'desktop-macbook-air-13', 'desktop-macbook-pro-14', 'desktop-fhd'],
} as const;

const PRESET_BY_ID = new Map(ADD_DEVICE_PRESETS.map((preset) => [preset.presetId, preset]));

export const getRecommendedDeviceSet = (setName: keyof typeof RECOMMENDED_SET_PRESET_IDS): DevicePreset[] =>
  RECOMMENDED_SET_PRESET_IDS[setName].map((presetId) => {
    const preset = PRESET_BY_ID.get(presetId);

    if (!preset) {
      throw new Error(`Missing recommended device preset: ${presetId}`);
    }

    return preset;
  });

export type RecommendedDeviceSetName = keyof typeof RECOMMENDED_SET_PRESET_IDS;

export const createDefaultDeviceInstances = (): DeviceInstance[] =>
  DEFAULT_DEVICE_PRESETS.map((preset) => ({
    id: `default-${preset.presetId}`,
    presetId: preset.presetId,
    name: preset.name,
    width: preset.width,
    height: preset.height,
    baseWidth: preset.width,
    baseHeight: preset.height,
    category: preset.category,
    source: 'default',
    reloadKey: 0,
  }));

export const DEFAULT_PERSISTED_STATE = {
  urlInput: '',
  activeUrl: null,
  zoom: 75,
  syncScroll: true,
  devices: createDefaultDeviceInstances(),
  customDevices: [],
} as const;
