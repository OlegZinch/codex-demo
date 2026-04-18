type PlaceholderListProps = {
  items: string[];
};

export function PlaceholderList({ items }: PlaceholderListProps) {
  return (
    <ul className="grid gap-3 text-sm leading-6 text-[color:var(--color-foreground-muted)] sm:text-base">
      {items.map((item) => (
        <li
          className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 backdrop-blur-md"
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
