import { expect, test } from "@playwright/test";

test("a user can create, persist, share, and revoke a note", async ({ page }) => {
  const noteContent = page.locator('[contenteditable="true"][aria-label="Note content"]');

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Writer");
  await page.getByLabel("Email").fill("writer@example.com");
  await page.getByLabel("Password").fill("e2e-password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByRole("heading", { level: 2, name: "No notes yet" })).toBeVisible();

  await page.getByRole("link", { name: "New note" }).click();
  await expect(noteContent).toBeVisible();
  await page.getByLabel("Title").fill("First note");
  await noteContent.fill("Original note content");
  await page.getByRole("button", { name: "Create note" }).click();

  await expect(page).toHaveURL(/\/notes\/[\w-]+$/);
  await page.getByRole("link", { name: "Back to notes" }).click();
  await page.getByRole("link", { name: "First note" }).click();
  await expect(noteContent).toBeVisible();
  await page.getByLabel("Title").fill("Persisted note");
  const saveButton = page.getByRole("button", { name: "Save now" });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(saveButton).toBeDisabled();
  await expect(page.getByText(/^Saved(?: |$)/)).toBeVisible();

  await noteContent.fill("Persisted public content");
  await expect(saveButton).toBeEnabled();
  await expect(saveButton).toBeDisabled();

  await page.getByRole("link", { name: "Back to notes" }).click();
  await page.getByRole("link", { name: "Persisted note" }).click();
  await expect(page.getByLabel("Title")).toHaveValue("Persisted note");
  await expect(noteContent).toContainText("Persisted public content");

  await page.getByRole("button", { name: "Enable share" }).click();
  const shareLink = page.getByRole("link", { name: /http:\/\/localhost:3100\/s\// });
  const shareUrl = await shareLink.getAttribute("href");

  expect(shareUrl).not.toBeNull();
  await shareLink.click();
  await expect(page.getByRole("heading", { level: 1, name: "Persisted note" })).toBeVisible();
  await expect(page.getByText("Persisted public content")).toBeVisible();

  await page.goBack();
  await page.getByRole("button", { name: "Disable share" }).click();
  await page.goto(shareUrl ?? "/");
  await expect(page.getByRole("heading", { level: 1, name: "Page Not Found" })).toBeVisible();
});
