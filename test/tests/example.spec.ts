import { expect, test } from "@playwright/test";

const TITLE_REGEX = /Test App/;

test("homepage has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(TITLE_REGEX);
});
