import { create } from 'zustand';
import { DEFAULT_PERSISTED_STATE, ADD_DEVICE_PRESETS, getRecommendedDeviceSet } from '../data/devices';
import { clampZoom, rotateDevice } from '../lib/deviceMath';
import { createCustomPresetId, createDeviceInstanceId } from '../lib/ids';
import { customDeviceInputSchema, persistedAppStateSchema } from '../lib/schemas';
import type { CustomDeviceInput, DeviceInstance, DevicePreset, PersistedAppState } from '../lib/types';
import type { RecommendedDeviceSetName } from '../data/devices';
import { normalizeUrl } from '../lib/url';
import { debounce } from '../lib/debounce';
import { readStoredAppState, writeStoredAppState } from './chromeStorage';

const cloneDefaultState = (): PersistedAppState => ({
  urlInput: DEFAULT_PERSISTED_STATE.urlInput,
  activeUrl: DEFAULT_PERSISTED_STATE.activeUrl,
  zoom: DEFAULT_PERSISTED_STATE.zoom,
  syncScroll: DEFAULT_PERSISTED_STATE.syncScroll,
  devices: DEFAULT_PERSISTED_STATE.devices.map((device) => ({ ...device })),
  customDevices: [...DEFAULT_PERSISTED_STATE.customDevices],
});

const toPersistedState = (state: AppState): PersistedAppState => ({
  urlInput: state.urlInput,
  activeUrl: state.activeUrl,
  zoom: state.zoom,
  syncScroll: state.syncScroll,
  devices: state.devices,
  customDevices: state.customDevices,
});

const LEGACY_DEFAULT_DEVICE_IDS = ['default-iphone-se', 'default-iphone-14', 'default-ipad-air', 'default-macbook-pro'];

const isLegacyDefaultDeviceLayout = (devices: DeviceInstance[]): boolean =>
  devices.length === LEGACY_DEFAULT_DEVICE_IDS.length &&
  devices.every((device, index) => device.id === LEGACY_DEFAULT_DEVICE_IDS[index]);

const DEVICE_NAME_BY_PRESET_ID = new Map(
  [...DEFAULT_PERSISTED_STATE.devices, ...ADD_DEVICE_PRESETS].map((device) => [device.presetId, device.name]),
);

const localizeDeviceNames = (devices: DeviceInstance[]): DeviceInstance[] =>
  devices.map((device) => {
    if (!device.presetId) {
      return device;
    }

    const localizedName = DEVICE_NAME_BY_PRESET_ID.get(device.presetId);
    return localizedName && localizedName !== device.name ? { ...device, name: localizedName } : device;
  });

const migratePersistedState = (state: PersistedAppState): PersistedAppState => {
  if (!isLegacyDefaultDeviceLayout(state.devices)) {
    return {
      ...state,
      devices: localizeDeviceNames(state.devices),
      customDevices: localizeDeviceNames(
        state.customDevices.map((device) => ({
          ...device,
          id: device.presetId,
          baseWidth: device.width,
          baseHeight: device.height,
          category: device.category,
          source: 'custom' as const,
          reloadKey: 0,
        })),
      ).map(({ presetId, name, width, height, category }) => ({ presetId: presetId ?? name, name, width, height, category })),
    };
  }

  return {
    ...state,
    devices: cloneDefaultState().devices,
  };
};

const savePersistedState = async (state: AppState): Promise<void> => {
  await writeStoredAppState(toPersistedState(state));
};

const schedulePersist = debounce((state: AppState) => {
  void savePersistedState(state);
}, 250);

const persistSoon = (state: AppState, immediate = false) => {
  if (!state.hasHydrated) {
    return;
  }

  if (immediate) {
    schedulePersist.cancel();
    void savePersistedState(state);
    return;
  }

  schedulePersist(state);
};

const createDeviceFromPreset = (
  preset: DevicePreset,
  existingIds: Iterable<string>,
  source: DeviceInstance['source'] = 'preset',
): DeviceInstance => ({
  id: createDeviceInstanceId(preset.presetId, existingIds),
  presetId: preset.presetId,
  name: preset.name,
  width: preset.width,
  height: preset.height,
  baseWidth: preset.width,
  baseHeight: preset.height,
  category: preset.category,
  source,
  reloadKey: 0,
});

export type AppState = PersistedAppState & {
  urlError: string | null;
  isAddModalOpen: boolean;
  hasHydrated: boolean;

  setUrlInput: (value: string) => void;
  loadUrl: () => boolean;
  setZoom: (value: number) => void;
  setSyncScroll: (value: boolean) => void;
  toggleSyncScroll: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  addPresetDevice: (presetId: string) => boolean;
  addCustomDevice: (input: CustomDeviceInput) => { ok: true } | { ok: false; error: string };
  applyRecommendedDeviceSet: (setName: RecommendedDeviceSetName) => void;
  closeDevice: (deviceId: string) => void;
  rotateDevice: (deviceId: string) => void;
  rotateAll: () => void;
  reloadDevice: (deviceId: string) => void;
  reloadAll: () => void;
  reorderDevices: (fromIndex: number, toIndex: number) => void;
  resetLayout: () => void;
  hydrate: (initialUrl?: string | null) => Promise<void>;
  persistNow: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  ...cloneDefaultState(),
  urlError: null,
  isAddModalOpen: false,
  hasHydrated: false,

  setUrlInput: (value) => {
    set({ urlInput: value, urlError: null });
    persistSoon(get());
  },

  loadUrl: () => {
    const result = normalizeUrl(get().urlInput);

    if (!result.ok) {
      set({ activeUrl: null, urlError: result.error });
      persistSoon(get(), true);
      return false;
    }

    set({ activeUrl: result.url, urlInput: result.url, urlError: null });
    persistSoon(get(), true);
    return true;
  },

  setZoom: (value) => {
    set({ zoom: clampZoom(value) });
    persistSoon(get());
  },

  setSyncScroll: (value) => {
    set({ syncScroll: value });
    persistSoon(get(), true);
  },

  toggleSyncScroll: () => {
    set((state) => ({ syncScroll: !state.syncScroll }));
    persistSoon(get(), true);
  },

  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  addPresetDevice: (presetId) => {
    const preset = ADD_DEVICE_PRESETS.find((candidate) => candidate.presetId === presetId);

    if (!preset) {
      return false;
    }

    const existingIds = get().devices.map((device) => device.id);
    const device = createDeviceFromPreset(preset, existingIds, 'preset');
    set((state) => ({ devices: [...state.devices, device], isAddModalOpen: false }));
    persistSoon(get(), true);
    return true;
  },

  addCustomDevice: (input) => {
    const result = customDeviceInputSchema.safeParse(input);

    if (!result.success) {
      return { ok: false, error: result.error.issues[0]?.message ?? '올바른 사용자 지정 기기가 아닙니다.' };
    }

    const existingPresetIds = [...ADD_DEVICE_PRESETS, ...get().customDevices].map((preset) => preset.presetId);
    const preset: DevicePreset = {
      presetId: createCustomPresetId(result.data.name, existingPresetIds),
      name: result.data.name.trim(),
      width: result.data.width,
      height: result.data.height,
      category: result.data.category,
    };
    const device = createDeviceFromPreset(preset, get().devices.map((candidate) => candidate.id), 'custom');

    set((state) => ({
      customDevices: [...state.customDevices, preset],
      devices: [...state.devices, device],
      isAddModalOpen: false,
    }));
    persistSoon(get(), true);
    return { ok: true };
  },


  applyRecommendedDeviceSet: (setName) => {
    const presets = getRecommendedDeviceSet(setName);
    const devices = presets.map((preset, index) =>
      createDeviceFromPreset(preset, presets.slice(0, index).map((candidate) => candidate.presetId), 'preset'),
    );

    set({ devices });
    persistSoon(get(), true);
  },

  closeDevice: (deviceId) => {
    set((state) => ({ devices: state.devices.filter((device) => device.id !== deviceId) }));
    persistSoon(get(), true);
  },

  rotateDevice: (deviceId) => {
    set((state) => ({
      devices: state.devices.map((device) => (device.id === deviceId ? rotateDevice(device) : device)),
    }));
    persistSoon(get(), true);
  },

  rotateAll: () => {
    set((state) => ({ devices: state.devices.map((device) => rotateDevice(device)) }));
    persistSoon(get(), true);
  },

  reloadDevice: (deviceId) => {
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === deviceId ? { ...device, reloadKey: device.reloadKey + 1 } : device,
      ),
    }));
    persistSoon(get(), true);
  },

  reloadAll: () => {
    set((state) => ({
      devices: state.devices.map((device) => ({ ...device, reloadKey: device.reloadKey + 1 })),
    }));
    persistSoon(get(), true);
  },

  reorderDevices: (fromIndex, toIndex) => {
    const devices = [...get().devices];

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= devices.length ||
      toIndex >= devices.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [moved] = devices.splice(fromIndex, 1);
    devices.splice(toIndex, 0, moved);
    set({ devices });
    persistSoon(get(), true);
  },

  resetLayout: () => {
    set({
      ...cloneDefaultState(),
      urlError: null,
      isAddModalOpen: false,
    });
    persistSoon(get(), true);
  },

  hydrate: async (initialUrl) => {
    const stored = await readStoredAppState();
    const result = persistedAppStateSchema.safeParse(stored);
    const nextState = result.success ? migratePersistedState(result.data) : cloneDefaultState();
    const initialUrlInput = initialUrl?.trim();

    if (initialUrlInput) {
      const normalizedInitialUrl = normalizeUrl(initialUrlInput);

      set({
        ...nextState,
        urlInput: normalizedInitialUrl.ok ? normalizedInitialUrl.url : initialUrlInput,
        activeUrl: normalizedInitialUrl.ok ? normalizedInitialUrl.url : null,
        urlError: normalizedInitialUrl.ok ? null : normalizedInitialUrl.error,
        hasHydrated: true,
      });
      await savePersistedState(get());
      return;
    }

    set({
      ...nextState,
      urlError: null,
      hasHydrated: true,
    });

    if (!result.success || nextState !== result.data) {
      await savePersistedState(get());
    }
  },

  persistNow: async () => {
    schedulePersist.flush();
    await savePersistedState(get());
  },
}));

export const hydrateAppStore = (initialUrl?: string | null) => useAppStore.getState().hydrate(initialUrl);
