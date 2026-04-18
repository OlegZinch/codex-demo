import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  align?: "start" | "center";
  justify?: "start" | "center";
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

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
};

export function PageShell({
  children,
  align = "start",
  justify = "start",
  width = "default",
}: PageShellProps) {
  return (
    <main className="flex min-h-[calc(100svh-5rem)] bg-[linear-gradient(180deg,rgba(5,18,30,0.7),rgba(4,17,28,0.94))] px-6 py-10 sm:px-8 lg:px-10">
      <div
        className={`mx-auto flex w-full flex-1 flex-col gap-8 ${alignClasses[align]} ${justifyClasses[justify]} ${widthClasses[width]}`}
      >
        {children}
      </div>
    </main>
  );
}
