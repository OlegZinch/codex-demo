import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  align?: "start" | "center";
  width?: "default" | "wide" | "narrow";
};

const widthClasses = {
  default: "max-w-5xl",
  wide: "max-w-6xl",
  narrow: "max-w-3xl",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
};

export function PageShell({ children, align = "start", width = "default" }: PageShellProps) {
  return (
    <main className="min-h-[calc(100svh-5rem)] px-6 py-10 sm:px-8 lg:px-10">
      <div
        className={`mx-auto flex w-full flex-col gap-8 ${alignClasses[align]} ${widthClasses[width]}`}
      >
        {children}
      </div>
    </main>
  );
}
