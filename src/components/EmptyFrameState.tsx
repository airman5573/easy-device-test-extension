export function EmptyFrameState() {
  return (
    <div className="flex flex-col items-center gap-2" data-ai-id="device-frame-empty-state">
      <div
        className="mb-1 flex h-6 w-6 items-center justify-center text-[24px] leading-none text-slate-500 opacity-60"
        data-ai-id="device-frame-empty-state-icon-wrapper"
      >
        ↑
      </div>
      <span className="text-[14px] font-medium tracking-wide text-slate-500" data-ai-id="device-frame-empty-state-message-text">
        위에 주소를 입력하면 미리보기가 표시됩니다
      </span>
    </div>
  );
}
