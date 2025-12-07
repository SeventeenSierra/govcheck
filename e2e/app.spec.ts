import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/GovCheck AI/);
});

test('loads main interface', async ({ page }) => {
    await page.goto('/');

    // Expect the sidebar "Recent Checks" text to be visible
    await expect(page.getByText('Recent Checks')).toBeVisible();

    // Expect the "New Compliance Check" button to be visible
    await expect(page.getByRole('button', { name: 'New Compliance Check' })).toBeVisible();
});
