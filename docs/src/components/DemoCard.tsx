import type { ReactNode } from "react";

interface DemoCardProps {
  children: ReactNode;
  code?: string;
  lang?: string;
  title?: string;
  className?: string;
}

export function DemoCard({ children, code, title, className = "" }: DemoCardProps) {
  return (
    <div className={`demo-card border-2 border-[#3a2f27] bg-[#181411] ${className}`}>
      <div className="p-4 border-b border-[#3a2f27] bg-[#231b15]">{children}</div>
      {code && (
        <div className="overflow-x-auto">
          {title && (
            <div className="px-4 py-2 bg-[#222] border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-white/30">
              {title}
            </div>
          )}
          <pre className="p-4 bg-[#161616] font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
