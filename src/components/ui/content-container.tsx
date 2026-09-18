import type { ReactNode } from "react";

export type ContentContainerProps = {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
};

const widthClasses = {
  default: "max-w-5xl",
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
};

export function ContentContainer({
  children,
  className = "",
  width = "default",
}: ContentContainerProps) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 lg:px-10 ${widthClasses[width]} ${className}`}>
      {children}
    </div>
  );
}
