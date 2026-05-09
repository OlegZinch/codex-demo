import Link from "next/link";

import { logoutAction } from "@/src/lib/auth-actions";
import { getCurrentSession } from "@/src/lib/session";

const linkClassName =
  "rounded-full px-4 py-2 text-sm font-medium text-accent transition hover:bg-surface-muted hover:text-foreground";

const primaryLinkClassName =
  "rounded-full bg-accent-strong px-4 py-2 text-sm font-medium text-background shadow-[0_12px_30px_rgba(47,207,197,0.22)] transition hover:bg-accent";

const logoutButtonClassName =
  "rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground";

export async function SiteHeader() {
  const session = await getCurrentSession();
  const isLoggedIn = session !== null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[rgba(3,16,28,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <Link
          className="text-lg font-semibold text-accent transition hover:text-foreground"
          href="/"
        >
          TinyNotes
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link className={primaryLinkClassName} href="/notes">
                Notes
              </Link>
              <form action={logoutAction}>
                <button className={logoutButtonClassName} type="submit">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className={linkClassName} href="/login">
                Login
              </Link>
              <Link className={primaryLinkClassName} href="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
