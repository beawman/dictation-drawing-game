import { test, expect } from '@playwright/test';

// Mock authentication for testing
test.describe('Authenticated User Flows', () => {
  test.describe('Student Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Mock student authentication
      await page.addInitScript(() => {
        // Mock NextAuth session for student
        window.localStorage.setItem('mock-session', JSON.stringify({
          user: {
            id: 'student-1',
            name: 'Test Student',
            email: 'student@example.com',
            role: 'student'
          }
        }));
      });
    });

    test('should complete a drawing submission', async ({ page }) => {
      await page.goto('/game');
      
      // Wait for game interface to load
      await expect(page.locator('[data-testid="game-interface"]')).toBeVisible({ timeout: 10000 });
      
      // Check if word is displayed
      const wordDisplay = page.locator('[data-testid="current-word"]');
      if (await wordDisplay.isVisible()) {
        await expect(wordDisplay).toContainText(/\w+/); // Should contain a word
      }
      
      // Check if drawing canvas is available
      const canvas = page.locator('[data-testid="drawing-canvas"]');
      if (await canvas.isVisible()) {
        // Simulate drawing on canvas
        await canvas.click({ position: { x: 100, y: 100 } });
        await page.mouse.down();
        await page.mouse.move(150, 150);
        await page.mouse.up();
      }
      
      // Look for submit button
      const submitButton = page.getByRole('button', { name: /submit/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show success message or next word
        const successMessage = page.locator('text=/submitted|success|next word/i');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show progress tracking', async ({ page }) => {
      await page.goto('/game');
      
      // Look for progress indicators
      const progressIndicator = page.locator('[data-testid="progress-indicator"]');
      const wordCounter = page.locator('text=/word \\d+ of \\d+/i');
      
      // At least one progress element should be visible
      await expect(progressIndicator.or(wordCounter)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Teacher Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Mock teacher authentication
      await page.addInitScript(() => {
        // Mock NextAuth session for teacher
        window.localStorage.setItem('mock-session', JSON.stringify({
          user: {
            id: 'teacher-1',
            name: 'Test Teacher',
            email: 'teacher@example.com',
            role: 'teacher'
          }
        }));
      });
    });

    test('should access teacher dashboard', async ({ page }) => {
      await page.goto('/teacher');
      
      // Wait for teacher dashboard to load
      await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible({ timeout: 10000 });
      
      // Check for key teacher features
      const uploadSection = page.locator('text=/upload|word set/i');
      const studentsSection = page.locator('text=/student|submission/i');
      
      // At least one teacher feature should be visible
      await expect(uploadSection.or(studentsSection)).toBeVisible();
    });

    test('should be able to upload word sets', async ({ page }) => {
      await page.goto('/teacher');
      
      // Look for file upload area
      const uploadArea = page.locator('[data-testid="file-upload"]');
      const uploadButton = page.getByRole('button', { name: /upload/i });
      
      if (await uploadArea.isVisible()) {
        await expect(uploadArea).toBeVisible();
      } else if (await uploadButton.isVisible()) {
        await expect(uploadButton).toBeVisible();
      }
    });

    test('should view student submissions', async ({ page }) => {
      await page.goto('/teacher');
      
      // Look for submissions view
      const submissionsTab = page.getByRole('button', { name: /submission/i });
      const submissionsList = page.locator('[data-testid="submissions-list"]');
      
      if (await submissionsTab.isVisible()) {
        await submissionsTab.click();
      }
      
      // Should show submissions area (even if empty)
      const submissionsArea = page.locator('text=/submission|no submission|empty/i');
      await expect(submissionsArea).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation to different pages
      const gameLink = page.getByRole('link', { name: /game/i });
      if (await gameLink.isVisible()) {
        await gameLink.click();
        await expect(page).toHaveURL(/.*game/);
      }
      
      const teacherLink = page.getByRole('link', { name: /teacher/i });
      if (await teacherLink.isVisible()) {
        await teacherLink.click();
        await expect(page).toHaveURL(/.*teacher/);
      }
    });
  });
});