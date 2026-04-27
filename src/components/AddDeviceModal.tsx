import { type FormEvent, type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useState } from 'react';
import { ADD_DEVICE_PRESETS, DEVICE_CATEGORY_LABELS, DEVICE_CATEGORY_ORDER } from '../data/devices';
import type { DeviceCategory } from '../lib/types';
import { useAppStore } from '../store/appStore';

export function AddDeviceModal() {
  const isOpen = useAppStore((state) => state.isAddModalOpen);
  const closeAddModal = useAppStore((state) => state.closeAddModal);
  const addPresetDevice = useAppStore((state) => state.addPresetDevice);
  const addCustomDevice = useAppStore((state) => state.addCustomDevice);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('mobile');
  const [customName, setCustomName] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAddModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAddModal, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setCustomError(null);
    }
  }, [isOpen]);

  const filteredPresets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return ADD_DEVICE_PRESETS.filter((preset) => {
      if (preset.category !== activeCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = `${preset.name} ${preset.presetId} ${preset.width} ${preset.height} ${DEVICE_CATEGORY_LABELS[preset.category]}`.toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [activeCategory, search]);

  if (!isOpen) {
    return null;
  }

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addCustomDevice({
      name: customName,
      width: Number(customWidth),
      height: Number(customHeight),
      category: activeCategory,
    });

    if (!result.ok) {
      setCustomError(result.error);
      return;
    }

    setCustomName('');
    setCustomWidth('');
    setCustomHeight('');
    setCustomError(null);
  };

  const handleModalKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-device-title"
      onMouseDown={closeAddModal}
      data-ai-id="add-device-modal-overlay"
    >
      <main
        className="flex w-full max-w-[460px] flex-col border border-bordercol bg-[#f4f4f4]"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        data-ai-id="add-device-modal"
      >
        <header className="px-6 pb-4 pt-6" data-ai-id="add-device-modal-header">
          <div className="mb-4 flex items-center justify-between" data-ai-id="add-device-modal-header-title-row">
            <h1 id="add-device-title" className="text-[1.125rem] font-bold text-[#333333]" data-ai-id="add-device-modal-header-title-text">
              기기 추가
            </h1>
            <button
              type="button"
              className="text-[#666666] transition-colors hover:text-[#333333]"
              aria-label="닫기"
              onClick={closeAddModal}
              data-ai-id="add-device-modal-header-close-button"
            >
              <span data-ai-id="add-device-modal-header-close-button-label-text">×</span>
            </button>
          </div>

          <div className="relative" data-ai-id="add-device-modal-search-field">
            <input
              type="text"
              placeholder="기기 검색..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border border-bordercol bg-white px-4 py-[10px] text-[0.9rem] text-[#333333] outline-none focus:border-[#999999] transition-all placeholder:text-[#999999]"
              autoFocus
              data-ai-id="add-device-modal-search-field-input"
            />
          </div>


          <div className="mt-3 grid grid-cols-4 border border-bordercol bg-[#e8e8e8]" data-ai-id="add-device-modal-category-tabs">
            {DEVICE_CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                type="button"
                className={`border-r border-bordercol px-2 py-2 text-[12px] font-semibold transition-colors last:border-r-0 ${
                  activeCategory === category ? 'bg-white text-[#333333]' : 'text-[#666666] hover:bg-white/70 hover:text-[#333333]'
                }`}
                onClick={() => setActiveCategory(category)}
                data-ai-id="add-device-modal-category-tabs-tab-button"
              >
                <span data-ai-id="add-device-modal-category-tabs-tab-button-label-text">{DEVICE_CATEGORY_LABELS[category]}</span>
              </button>
            ))}
          </div>
        </header>

        <section className="modal-scrollbar ml-2 mt-1 h-[320px] overflow-y-auto px-3 pb-2" data-ai-id="add-device-modal-presets-section">
          <ul className="flex flex-col gap-[2px] pr-2" data-ai-id="add-device-modal-presets-list">
            {filteredPresets.map((preset) => (
              <li key={preset.presetId} data-ai-id="add-device-modal-presets-list-item">
                <button
                  type="button"
                  className="group flex w-full cursor-pointer items-center justify-between border-b border-[#e0e0e0] px-4 py-[10px] text-left text-[0.9rem] text-[#333333] transition-colors hover:bg-white"
                  onClick={() => addPresetDevice(preset.presetId)}
                  data-ai-id="add-device-modal-presets-list-item-select-button"
                >
                  <span className="flex flex-col gap-0.5" data-ai-id="add-device-modal-presets-list-item-select-button-info-wrapper">
                    <span className="font-medium" data-ai-id="add-device-modal-presets-list-item-select-button-name-text">
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-[#888888]" data-ai-id="add-device-modal-presets-list-item-select-button-category-text">
                      {DEVICE_CATEGORY_LABELS[preset.category]}
                    </span>
                  </span>
                  <span className="text-[0.8rem] text-[#666666] group-hover:text-[#333333]" data-ai-id="add-device-modal-presets-list-item-select-button-size-text">
                    {preset.width} × {preset.height}
                  </span>
                </button>
              </li>
            ))}
            {filteredPresets.length === 0 ? (
              <li className="px-4 py-[10px] text-[0.9rem] text-[#666666]" data-ai-id="add-device-modal-presets-empty-state">
                검색된 기기가 없습니다.
              </li>
            ) : null}
          </ul>
        </section>

        <div className="mx-6 mb-2 mt-1 h-px bg-[#cccccc]" data-ai-id="add-device-modal-divider" />

        <footer className="px-6 pb-6 pt-3" data-ai-id="add-device-modal-custom-size-footer">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-[#333333]" data-ai-id="add-device-modal-custom-size-footer-title-text">
            사용자 지정 크기
          </h3>
          <form className="flex items-stretch gap-[10px]" onSubmit={handleCustomSubmit} data-ai-id="add-device-modal-custom-size-form">
            <input
              type="text"
              placeholder="이름"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              className="min-w-[100px] flex-grow border border-bordercol bg-white px-3 py-2.5 text-sm text-[#333333] transition-all placeholder:text-[#999999] focus:border-[#999999] focus:outline-none"
              data-ai-id="add-device-modal-custom-size-form-name-input"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="너비"
              value={customWidth}
              onChange={(event) => setCustomWidth(event.target.value)}
              className="w-20 border border-bordercol bg-white px-3 py-2.5 text-sm text-[#333333] transition-all placeholder:text-[#999999] focus:border-[#999999] focus:outline-none"
              data-ai-id="add-device-modal-custom-size-form-width-input"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="높이"
              value={customHeight}
              onChange={(event) => setCustomHeight(event.target.value)}
              className="w-20 border border-bordercol bg-white px-3 py-2.5 text-sm text-[#333333] transition-all placeholder:text-[#999999] focus:border-[#999999] focus:outline-none"
              data-ai-id="add-device-modal-custom-size-form-height-input"
            />
            <button
              type="submit"
              className="border border-bordercol bg-[#e0e0e0] px-5 py-2.5 text-sm font-semibold text-[#333333] transition-colors duration-200 hover:bg-[#d0d0d0]"
              data-ai-id="add-device-modal-custom-size-form-submit-button"
            >
              <span data-ai-id="add-device-modal-custom-size-form-submit-button-label-text">추가</span>
            </button>
          </form>
          {customError ? (
            <p className="mt-2 text-xs text-red-300" data-ai-id="add-device-modal-custom-size-form-error-text">
              {customError}
            </p>
          ) : null}
        </footer>
      </main>
    </div>
  );
}
