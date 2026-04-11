type RouteHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RouteHeader({ eyebrow, title, description }: RouteHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-[color:var(--color-foreground-muted)] sm:text-lg">
          {description}
        </p>
      </div>
    </header>
  );
}
