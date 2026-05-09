type RouteHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RouteHeader({ eyebrow, title, description }: RouteHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase text-accent">{eyebrow}</p>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-foreground-muted sm:text-lg">
          {description}
        </p>
      </div>
    </header>
  );
}
