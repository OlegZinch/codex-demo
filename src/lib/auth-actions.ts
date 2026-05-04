"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/src/lib/auth";

export type AuthFieldName = "name" | "email" | "password";

export type AuthFormState = {
  message: string | null;
  fieldErrors: Partial<Record<AuthFieldName, string>>;
  values: {
    name?: string;
    email?: string;
  };
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = LoginInput & {
  name: string;
};

type ValidationResult<TInput> =
  | {
      ok: true;
      input: TInput;
    }
  | {
      ok: false;
      state: AuthFormState;
    };

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateLogin(formData);

  if (!validation.ok) {
    return validation.state;
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: validation.input.email,
        password: validation.input.password,
        rememberMe: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error("Login failed", error);

    return {
      message: "Unable to sign in with those credentials.",
      fieldErrors: {},
      values: {
        email: validation.input.email,
      },
    };
  }

  redirect("/notes");
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateRegister(formData);

  if (!validation.ok) {
    return validation.state;
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: validation.input.name,
        email: validation.input.email,
        password: validation.input.password,
        rememberMe: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error("Registration failed", error);

    return {
      message: "Unable to create an account with those details.",
      fieldErrors: {},
      values: {
        name: validation.input.name,
        email: validation.input.email,
      },
    };
  }

  redirect("/notes");
}

export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Logout failed", error);
  }

  redirect("/login");
}

function validateLogin(formData: FormData): ValidationResult<LoginInput> {
  const email = getFormString(formData, "email").trim().toLowerCase();
  const password = getFormString(formData, "password");
  const fieldErrors: AuthFormState["fieldErrors"] = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  validatePassword(password, fieldErrors);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        message: "Check the highlighted fields and try again.",
        fieldErrors,
        values: { email },
      },
    };
  }

  return {
    ok: true,
    input: {
      email,
      password,
    },
  };
}

function validateRegister(formData: FormData): ValidationResult<RegisterInput> {
  const name = getFormString(formData, "name").trim();
  const loginValidation = validateLogin(formData);
  const fieldErrors: AuthFormState["fieldErrors"] = loginValidation.ok
    ? {}
    : { ...loginValidation.state.fieldErrors };

  if (name.length === 0) {
    fieldErrors.name = "Enter your name.";
  }

  if (name.length > 100) {
    fieldErrors.name = "Name must be 100 characters or fewer.";
  }

  if (!loginValidation.ok || Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        message: "Check the highlighted fields and try again.",
        fieldErrors,
        values: {
          name,
          email: loginValidation.ok
            ? loginValidation.input.email
            : loginValidation.state.values.email,
        },
      },
    };
  }

  return {
    ok: true,
    input: {
      name,
      email: loginValidation.input.email,
      password: loginValidation.input.password,
    },
  };
}

function getFormString(formData: FormData, key: AuthFieldName) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(password: string, fieldErrors: AuthFormState["fieldErrors"]) {
  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (password.length > 128) {
    fieldErrors.password = "Password must be 128 characters or fewer.";
  }
}
