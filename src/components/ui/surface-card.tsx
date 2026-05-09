import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  tone?: "default" | "subtle";
};

const toneClasses = {
  default: "bg-surface shadow-[0_24px_70px_rgba(1,9,18,0.46)] backdrop-blur-xl",
  subtle: "bg-surface-muted shadow-[0_18px_44px_rgba(1,9,18,0.34)] backdrop-blur-xl",
};

export function SurfaceCard({ children, tone = "default" }: SurfaceCardProps) {
  return (
    <section
      className={`w-full rounded-[28px] border border-border p-6 sm:p-8 ${toneClasses[tone]}`}
    >
      {children}
    </section>
  );
}
