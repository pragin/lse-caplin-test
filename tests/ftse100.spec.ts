import { test, expect } from '@playwright/test';

test.describe('FTSE 100 latest top 10 constituents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });
  test('with the highest percentage change', async ({ page, context }) => {
    const oneTrustCookieBanner = page.getByLabel('Cookie banner');
    await expect(oneTrustCookieBanner).toBeVisible({ timeout: 10000 });
    await oneTrustCookieBanner
      .getByRole('button')
      .filter({ hasText: 'Accept all cookies' })
      .click();
    const [FTSE100Page] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link').filter({ hasText: 'View FTSE 100' }).click(),
    ]);

    await FTSE100Page.waitForLoadState('domcontentloaded', {timeout: 10000});

    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );
    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Highest – lowest' })
      .locator('div')
      .click();

    const tableRows = await FTSE100Page.locator('table tr').all();
    const first10Rows = tableRows.slice(0, 11);
    
    const data: string[][] = [];

    for (const row of first10Rows) {
      const cells: string[] = await row.locator('th,td').allInnerTexts();

      if (cells.length != 0) {
        data.push(cells);
      }
    }

    const headings: string[] = data[0]
    const rows: Record<string, string>[] = data.slice(1).map((row: string[]) => 
      Object.fromEntries(row.map((cell, i) => [headings[i], cell]))
    );

    console.log('FTSE 100’s latest top 10 constituents with the highest percentage change')
    console.table(rows)
  });
});
