type PlaceholderListProps = {
  items: string[];
};

export function PlaceholderList({ items }: PlaceholderListProps) {
  return (
    <ul className="grid gap-3 text-sm leading-6 text-[color:var(--color-foreground-muted)] sm:text-base">
      {items.map((item) => (
        <li
          className="rounded-2xl border border-[color:var(--color-border)] bg-white/50 px-4 py-3"
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
