import { test, expect } from '@playwright/test';

test('run through the mock rfp flow', async ({ page }) => {
  // Go to the home page
  await page.goto('/');

  // Expect title to be GovCheck AI
  await expect(page).toHaveTitle(/GovCheck AI/);

  // Based on AgentInterface: "Vendor Proposal Compliance"
  await expect(page.getByText('Vendor Proposal Compliance')).toBeVisible();

  // Find the button that starts the demo
  // Based on AgentInterface, it's a button with text "Analyze Proposal Compliance"
  const startButton = page.locator('button').filter({ hasText: 'Analyze Proposal Compliance' });

  await startButton.click();

  // Wait for the report to appear.
  // The code says: setTimeout(() => { setShowReport(true); }, 7500);
  // So we should wait at least 8 seconds.

  // Also "demo-running" state shows something.

  // Verify ReportPreview is visible
  // ReportPreview usually has "Compliance Report" or similar text.
  await expect(page.getByText('Compliance Report', { exact: false })).toBeVisible({ timeout: 15000 });
});
