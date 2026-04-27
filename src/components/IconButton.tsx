import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  children: ReactNode;
  aiId?: string;
};

export function IconButton({ icon, children, className = '', aiId, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-[30px] items-center gap-1.5 border border-bordercol bg-btnbg px-3 text-[13px] text-[#333333] transition-colors hover:bg-btnhover ${className}`}
      data-ai-id={aiId}
      {...props}
    >
      {icon ? (
        <span className="flex h-3.5 w-3.5 items-center justify-center opacity-80" data-ai-id={aiId ? `${aiId}-icon-wrapper` : undefined}>
          {icon}
        </span>
      ) : null}
      <span data-ai-id={aiId ? `${aiId}-label-text` : undefined}>{children}</span>
    </button>
  );
}
