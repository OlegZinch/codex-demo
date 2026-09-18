import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AuthCredentialsForm } from "@/src/components/auth/auth-credentials-form";

vi.mock("@/src/lib/auth-actions", () => ({
  loginAction: vi.fn(),
  registerAction: vi.fn(),
}));

describe("AuthCredentialsForm", () => {
  test("renders the login fields and registration link", () => {
    render(<AuthCredentialsForm mode="login" />);

    expect(screen.getByRole("heading", { level: 1, name: /sign in/i })).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.queryByLabelText("Name")).toBeNull();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Create account" }).getAttribute("href")).toBe(
      "/register",
    );
  });

  test("renders the registration fields and login link", () => {
    render(<AuthCredentialsForm mode="register" />);

    expect(screen.getByRole("heading", { level: 1, name: /create an account/i })).toBeDefined();
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create account" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Back to login" }).getAttribute("href")).toBe("/login");
  });
});
