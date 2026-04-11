import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  tone?: "default" | "subtle";
};

const toneClasses = {
  default: "bg-[color:var(--color-surface)] shadow-[0_24px_60px_rgba(13,59,57,0.12)]",
  subtle: "bg-[color:var(--color-surface-muted)] shadow-[0_18px_40px_rgba(13,59,57,0.08)]",
};

export function SurfaceCard({ children, tone = "default" }: SurfaceCardProps) {
  return (
    <section
      className={`w-full rounded-[28px] border border-[color:var(--color-border)] p-6 sm:p-8 ${toneClasses[tone]}`}
    >
      {children}
    </section>
  );
}
