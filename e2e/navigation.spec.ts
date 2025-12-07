import { test, expect } from '@playwright/test';

test('sidebar navigation works', async ({ page }) => {
    await page.goto('/');

    // Check initial state
    await expect(page.getByRole('button', { name: 'History' })).toBeVisible();

    // Switch tabs
    await page.getByRole('button', { name: 'Saved Reports' }).click();

    // Click a recent project (SaaS Proposal - DOE)
    // Use a more specific selector to avoid ambiguity if multiple elements match
    await page.locator('div[role="button"]:has-text("SaaS Proposal - DOE")').click();
});
