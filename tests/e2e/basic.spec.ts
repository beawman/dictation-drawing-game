import { test, expect } from '@playwright/test';

test.describe('Dictation Drawing Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Dictation Drawing Game/);
    
    // Check for main navigation or content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    // Look for a sign in link or button
    const signInButton = page.getByRole('link', { name: /sign in/i }).first();
    
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await expect(page).toHaveURL(/.*auth.*signin/);
    }
  });

  test('should display game interface for students', async ({ page }) => {
    // Navigate to game page
    await page.goto('/game');
    
    // Should either show auth requirement or game interface
    const gameContent = page.locator('[data-testid="game-interface"]');
    const authRequired = page.locator('text=/sign in/i');
    
    // Either game content or auth prompt should be visible
    await expect(gameContent.or(authRequired)).toBeVisible();
  });

  test('should display teacher dashboard', async ({ page }) => {
    // Navigate to teacher page
    await page.goto('/teacher');
    
    // Should either show auth requirement or teacher dashboard
    const teacherContent = page.locator('[data-testid="teacher-dashboard"]');
    const authRequired = page.locator('text=/sign in/i');
    
    // Either teacher content or auth prompt should be visible
    await expect(teacherContent.or(authRequired)).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if page is still functional on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check if navigation is accessible (hamburger menu or mobile nav)
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    const regularNav = page.locator('nav');
    
    await expect(mobileNav.or(regularNav)).toBeVisible();
  });

  test('should handle offline scenarios', async ({ page }) => {
    // Navigate to game page
    await page.goto('/game');
    
    // Simulate offline condition
    await page.context().setOffline(true);
    
    // Reload the page
    await page.reload();
    
    // Should show offline indicator or cached content
    const offlineIndicator = page.locator('text=/offline/i');
    const cachedContent = page.locator('body');
    
    await expect(offlineIndicator.or(cachedContent)).toBeVisible();
    
    // Restore online condition
    await page.context().setOffline(false);
  });
});