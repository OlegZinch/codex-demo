import type { ReactNode } from "react";

import { ContentContainer } from "@/src/components/ui/content-container";

type PageShellProps = {
  children: ReactNode;
  align?: "start" | "center";
  justify?: "start" | "center";
  width?: "default" | "wide" | "narrow";
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
    <main className="flex min-h-[calc(100svh-5rem)] bg-[linear-gradient(180deg,rgba(5,18,30,0.7),rgba(4,17,28,0.94))] py-10">
      <ContentContainer
        className={`flex flex-1 flex-col gap-8 ${alignClasses[align]} ${justifyClasses[justify]}`}
        width={width}
      >
        {children}
      </ContentContainer>
    </main>
  );
}
