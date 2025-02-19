import { test, expect } from '@playwright/test';

test('Translator in sidebar is visible', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Flashcards - Translate' }).click();
  await expect(page.locator('iframe').contentFrame().getByRole('paragraph')).toContainText('Look up a word');
});

test('Translator continously loads search results', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Flashcards - Translate' }).click();
  await expect(page.locator('iframe').contentFrame().getByRole('paragraph')).toContainText('Look up a word');
  for (let i = 0; i < 5; i++) {
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'snö, fog, Baum,....' }).click();
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'snö, fog, Baum,....' }).fill('Baum');
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'snö, fog, Baum,....' }).press('Enter');
    await (await page.waitForSelector('iframe')).contentFrame().then(frame =>{
       frame?.locator('.font-bold.text-5xl.dark\:text-white').filter({ hasText: /^träd$/ });
    });
    await expect(page.locator('iframe').contentFrame().locator('div').first().filter({ hasText: /^träd$/ })).toBeVisible();
    await expect(page.locator('iframe').contentFrame().getByText('ett', { exact: true })).toBeVisible();
    await expect(page.locator('iframe').contentFrame().getByText('Baum').first()).toBeVisible();
    await page.locator('iframe').contentFrame().getByRole('button', { name: 'New Search' }).click();
    await expect(page.locator('iframe').contentFrame().getByRole('paragraph')).toContainText('Look up a word');
  }
});