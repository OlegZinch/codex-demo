import "server-only";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/src/lib/db";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const localBuildSecret = "tinynotes-local-build-secret-do-not-use-in-production";

export const auth = betterAuth({
  appName: "TinyNotes",
  baseURL: appUrl,
  database: db,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  secret: getAuthSecret(),
  trustedOrigins: [appUrl],
  plugins: [nextCookies()],
});

function getAuthSecret() {
  const configuredSecret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;

  if (configuredSecret !== undefined) {
    return configuredSecret;
  }

  if (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  ) {
    return localBuildSecret;
  }

  throw new Error("Set AUTH_SECRET or BETTER_AUTH_SECRET before starting TinyNotes in production.");
}
