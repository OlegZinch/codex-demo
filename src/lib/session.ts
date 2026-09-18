import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/src/lib/auth";

export const getCurrentSession = cache(async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireSession() {
  const session = await getCurrentSession();

  if (session === null) {
    redirect("/login");
  }

  return session;
}
