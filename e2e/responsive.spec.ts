// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { test, expect } from '@playwright/test';

test('sidebar works responsive', async ({ page }) => {
    // Set viewport to mobile iphone 12
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Initial state: Sidebar is open (w-72)
    await expect(page.getByTestId('sidebar')).toHaveClass(/w-72/);

    // Click toggle button
    await page.getByTitle('Close Sidebar').click();

    // Sidebar should be collapsed (w-0)
    // Wait for animation or check class directly
    await expect(page.getByTestId('sidebar')).toHaveClass(/w-0/);

    // Open it again
    await page.getByTitle('Open Sidebar').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/w-72/);
});
