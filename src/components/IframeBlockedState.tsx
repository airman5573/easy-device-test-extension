type IframeBlockedStateProps = {
  url: string;
  onRetry: () => void;
  onCapture: () => void;
};

export function IframeBlockedState({ url, onRetry, onCapture }: IframeBlockedStateProps) {
  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-vpbg px-8 text-center" data-ai-id="iframe-blocked-state">
      <div className="text-[15px] font-semibold text-[#333333]" data-ai-id="iframe-blocked-state-title-text">
        미리보기가 차단되었을 수 있습니다
      </div>
      <p className="max-w-[420px] text-[13px] leading-5 text-[#666666]" data-ai-id="iframe-blocked-state-description-text">
        이 사이트는 보안 설정 때문에 프레임 삽입을 차단할 수 있습니다. 캡처 모드를 사용하면
        임시 크롬 탭에서 페이지를 열고 반응형 화면 캡처로 대신 보여줍니다.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2" data-ai-id="iframe-blocked-state-actions">
        <button
          type="button"
          className="rounded border border-[#333333] bg-[#333333] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#111111]"
          onClick={onCapture}
          data-ai-id="iframe-blocked-state-actions-capture-button"
        >
          <span data-ai-id="iframe-blocked-state-actions-capture-button-label-text">화면 캡처</span>
        </button>
        <button
          type="button"
          className="rounded border border-bordercol bg-white px-3 py-1.5 text-[13px] text-[#333333] transition-colors hover:bg-btnhover"
          onClick={openInNewTab}
          data-ai-id="iframe-blocked-state-actions-open-tab-button"
        >
          <span data-ai-id="iframe-blocked-state-actions-open-tab-button-label-text">새 탭에서 열기</span>
        </button>
        <button
          type="button"
          className="rounded border border-bordercol bg-transparent px-3 py-1.5 text-[13px] text-[#666666] transition-colors hover:bg-btnhover hover:text-[#333333]"
          onClick={onRetry}
          data-ai-id="iframe-blocked-state-actions-retry-frame-button"
        >
          <span data-ai-id="iframe-blocked-state-actions-retry-frame-button-label-text">프레임 다시 시도</span>
        </button>
      </div>
    </div>
  );
}
