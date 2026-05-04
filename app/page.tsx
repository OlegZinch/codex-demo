import { redirect } from "next/navigation";

import { getCurrentSession } from "@/src/lib/session";

export default async function HomePage() {
  const session = await getCurrentSession();

  redirect(session === null ? "/login" : "/notes");
}
