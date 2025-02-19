import { test as setup, expect } from '@playwright/test';

setup('write login session data to file', async ({ page }) => {
  await page.goto('http://localhost:3000/sign-in');
  await page.getByRole('textbox', { name: 'Your email' }).click();
  await page.getByRole('textbox', { name: 'Your email' }).fill(process.env.PLAYWRIGHT_TEST_USER || '');
  await page.getByRole('textbox', { name: 'Your email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Your password' }).fill(process.env.PLAYWRIGHT_TEST_PASSWORD || '');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Flashcards - Translate' }).click();
  await page.context().storageState({ path: '.auth/login.json' });
});