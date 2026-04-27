import { type KeyboardEvent, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { IconButton } from './IconButton';

const iconClassName = 'inline-flex h-3.5 w-3.5 items-center justify-center text-[12px] leading-none';
const tailwindBreakpoints = [
  { prefix: 'sm', width: '640px' },
  { prefix: 'md', width: '768px' },
  { prefix: 'lg', width: '1024px' },
  { prefix: 'xl', width: '1280px' },
  { prefix: '2xl', width: '1536px' },
];

export function HeaderToolbar() {
  const [isBreakpointModalOpen, setIsBreakpointModalOpen] = useState(false);
  const urlInput = useAppStore((state) => state.urlInput);
  const urlError = useAppStore((state) => state.urlError);
  const zoom = useAppStore((state) => state.zoom);
  const syncScroll = useAppStore((state) => state.syncScroll);
  const setUrlInput = useAppStore((state) => state.setUrlInput);
  const loadUrl = useAppStore((state) => state.loadUrl);
  const openAddModal = useAppStore((state) => state.openAddModal);
  const resetLayout = useAppStore((state) => state.resetLayout);
  const setSyncScroll = useAppStore((state) => state.setSyncScroll);
  const rotateAll = useAppStore((state) => state.rotateAll);
  const setZoom = useAppStore((state) => state.setZoom);
  const reloadAll = useAppStore((state) => state.reloadAll);
  const applyRecommendedDeviceSet = useAppStore((state) => state.applyRecommendedDeviceSet);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      loadUrl();
    }
  };

  return (
    <>
    <header
      className="flex h-[52px] min-w-max shrink-0 flex-nowrap items-center justify-between border-b border-bordercol bg-headerbg px-4"
      data-ai-id="header-toolbar"
    >
      <div className="flex flex-1 items-center gap-6" data-ai-id="header-toolbar-primary-section">
        <div className="flex items-center gap-2.5" data-ai-id="header-toolbar-brand">
          <div className="flex h-6 w-6 items-center justify-center border border-bordercol bg-white text-xs font-bold text-[#333333]" data-ai-id="header-toolbar-brand-icon-wrapper">
            기
          </div>
          <span className="text-[15px] font-semibold tracking-wide text-[#333333]" data-ai-id="header-toolbar-brand-title-text">
            쉬운 기기 테스트
          </span>
        </div>

        <div className="relative flex w-[360px] items-center" data-ai-id="header-toolbar-url-form">
          <input
            type="text"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-[30px] flex-1 border border-r-0 border-bordercol bg-white px-3 py-1.5 text-[13px] text-[#333333] focus:border-[#999999] focus:outline-none"
            aria-invalid={Boolean(urlError)}
            aria-label="미리 볼 주소"
            data-ai-id="header-toolbar-url-form-input"
          />
          <button
            type="button"
            onClick={() => loadUrl()}
            className="h-[30px] border border-bordercol bg-btnbg px-4 py-1.5 text-[13px] font-medium text-[#333333] hover:bg-btnhover"
            data-ai-id="header-toolbar-url-form-submit-button"
          >
            <span data-ai-id="header-toolbar-url-form-submit-button-label-text">이동</span>
          </button>
          {urlError ? (
            <div
              className="absolute left-0 top-[38px] z-10 rounded border border-red-900/70 bg-red-950/95 px-2 py-1 text-[11px] text-red-200 shadow-lg"
              data-ai-id="header-toolbar-url-form-error-text"
            >
              {urlError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2" data-ai-id="header-toolbar-actions">
        <IconButton icon={<span className={iconClassName} data-ai-id="header-toolbar-actions-add-button-icon">＋</span>} onClick={openAddModal} aiId="header-toolbar-actions-add-button">
          <span className="font-medium text-[#333333]" data-ai-id="header-toolbar-actions-add-button-label-inner-text">
            추가
          </span>
        </IconButton>

        <IconButton onClick={() => applyRecommendedDeviceSet('mobile')} aiId="header-toolbar-actions-mobile-comparison-button">
          모바일 비교
        </IconButton>

        <IconButton onClick={() => applyRecommendedDeviceSet('tablet')} aiId="header-toolbar-actions-tablet-comparison-button">
          태블릿 비교
        </IconButton>

        <IconButton onClick={() => applyRecommendedDeviceSet('desktop')} aiId="header-toolbar-actions-desktop-comparison-button">
          데스크톱 비교
        </IconButton>

        <IconButton onClick={() => setIsBreakpointModalOpen(true)} aiId="header-toolbar-actions-tailwind-breakpoints-button">
          Tailwind Breakpoints
        </IconButton>

        <IconButton onClick={resetLayout} aiId="header-toolbar-actions-reset-button">
          초기화
        </IconButton>

        <label
          className="flex h-[30px] cursor-pointer items-center gap-2 border border-bordercol bg-btnbg px-3 text-[13px] text-[#333333] transition-colors hover:bg-btnhover"
          data-ai-id="header-toolbar-actions-sync-scroll-field-label"
        >
          <input
            type="checkbox"
            checked={syncScroll}
            onChange={(event) => setSyncScroll(event.target.checked)}
            className="h-[14px] w-[14px] cursor-pointer border-bordercol bg-appbg accent-[#333333]"
            data-ai-id="header-toolbar-actions-sync-scroll-field-input"
          />
          <span data-ai-id="header-toolbar-actions-sync-scroll-field-label-text">스크롤 동기화</span>
        </label>

        <IconButton icon={<span className={iconClassName} data-ai-id="header-toolbar-actions-rotate-all-button-icon">↻</span>} onClick={rotateAll} aiId="header-toolbar-actions-rotate-all-button">
          회전
        </IconButton>

        <div className="flex h-[30px] min-w-[120px] items-center gap-3 px-2" data-ai-id="header-toolbar-actions-zoom-field">
          <span className="w-8 text-right text-[13px] font-medium text-[#666666]" data-ai-id="header-toolbar-actions-zoom-field-value-text">
            {zoom}%
          </span>
          <input
            type="range"
            className="w-16 cursor-pointer"
            min="10"
            max="200"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="확대 비율"
            data-ai-id="header-toolbar-actions-zoom-field-input"
          />
        </div>

        <IconButton icon={<span className={iconClassName} data-ai-id="header-toolbar-actions-reload-all-button-icon">⟳</span>} onClick={reloadAll} aiId="header-toolbar-actions-reload-all-button">
          새로고침
        </IconButton>

      </div>
    </header>
    {isBreakpointModalOpen ? <TailwindBreakpointModal onClose={() => setIsBreakpointModalOpen(false)} /> : null}
    </>
  );
}

type TailwindBreakpointModalProps = {
  onClose: () => void;
};

function TailwindBreakpointModal({ onClose }: TailwindBreakpointModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailwind-breakpoint-title"
      onMouseDown={onClose}
      data-ai-id="tailwind-breakpoint-modal-overlay"
    >
      <main
        className="w-full max-w-[540px] border border-bordercol bg-[#f4f4f4] text-[#333333] shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        data-ai-id="tailwind-breakpoint-modal"
      >
        <header className="flex items-center justify-between border-b border-bordercol px-6 py-4" data-ai-id="tailwind-breakpoint-modal-header">
          <h2 id="tailwind-breakpoint-title" className="text-[18px] font-bold" data-ai-id="tailwind-breakpoint-modal-header-title-text">
            Tailwind Breakpoints
          </h2>
          <button
            type="button"
            className="text-[20px] text-[#666666] hover:text-[#333333]"
            aria-label="닫기"
            onClick={onClose}
            data-ai-id="tailwind-breakpoint-modal-header-close-button"
          >
            <span data-ai-id="tailwind-breakpoint-modal-header-close-button-label-text">×</span>
          </button>
        </header>

        <section className="px-6 py-5" data-ai-id="tailwind-breakpoint-modal-content">
          <p className="mb-4 text-[13px] leading-5 text-[#555555]" data-ai-id="tailwind-breakpoint-modal-description-text">
            테일윈드는 기본적으로 모바일 화면을 먼저 기준으로 스타일을 작성하고, 화면이 넓어질 때 필요한 스타일을
            중단점 접두사로 추가하는 방식입니다.
          </p>

          <div className="overflow-hidden border border-bordercol bg-white" data-ai-id="tailwind-breakpoint-modal-table-wrapper">
            <table className="w-full border-collapse text-left text-[13px]" data-ai-id="tailwind-breakpoint-modal-table">
              <thead className="bg-[#e8e8e8]" data-ai-id="tailwind-breakpoint-modal-table-head">
                <tr data-ai-id="tailwind-breakpoint-modal-table-head-row">
                  <th className="border-b border-bordercol px-4 py-2 font-semibold" data-ai-id="tailwind-breakpoint-modal-table-head-prefix-cell">
                    접두사
                  </th>
                  <th className="border-b border-bordercol px-4 py-2 font-semibold" data-ai-id="tailwind-breakpoint-modal-table-head-width-cell">
                    최소 너비
                  </th>
                </tr>
              </thead>
              <tbody data-ai-id="tailwind-breakpoint-modal-table-body">
                {tailwindBreakpoints.map((breakpoint) => (
                  <tr key={breakpoint.prefix} className="border-b border-[#e0e0e0] last:border-b-0" data-ai-id="tailwind-breakpoint-modal-table-body-row">
                    <td className="px-4 py-2 font-mono font-semibold" data-ai-id="tailwind-breakpoint-modal-table-body-row-prefix-cell">
                      {breakpoint.prefix}
                    </td>
                    <td className="px-4 py-2" data-ai-id="tailwind-breakpoint-modal-table-body-row-width-cell">
                      {breakpoint.width}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="mt-4 rounded border border-bordercol bg-white px-4 py-3 text-[13px] leading-5 text-[#555555]"
            data-ai-id="tailwind-breakpoint-modal-example"
          >
            예를 들어 기본 스타일은 모바일에 적용되고,{' '}
            <span className="font-mono font-semibold" data-ai-id="tailwind-breakpoint-modal-example-prefix-text">
              md
            </span>
            는 화면 너비가
            <span className="font-semibold" data-ai-id="tailwind-breakpoint-modal-example-width-text">
              {' '}
              768px 이상
            </span>
            일 때부터 적용됩니다.
          </div>
        </section>
      </main>
    </div>
  );
}
