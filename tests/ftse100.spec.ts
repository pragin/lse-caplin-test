import { test, expect, Page } from '@playwright/test';
import { getConstituents } from '../utils/constituentsHelper';

test.describe('FTSE 100 latest top 10 constituents', () => {
  let FTSE100Page: Page;
  test.beforeEach(async ({ page, context }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const oneTrustCookieBanner = page.getByLabel('Cookie banner');
    await expect(oneTrustCookieBanner).toBeVisible({ timeout: 10000 });
    await oneTrustCookieBanner
      .getByRole('button')
      .filter({ hasText: 'Accept all cookies' })
      .click();

    [FTSE100Page] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link').filter({ hasText: 'View FTSE 100' }).click(),
    ]);

    await FTSE100Page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  });
  test('with the highest percentage change', async () => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );
    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Highest – lowest' })
      .locator('div')
      .click();

    const rows: Record<string, string>[] = await getConstituents(FTSE100Page);

    console.log(
      'FTSE 100’s latest top 10 constituents with the highest percentage change'
    );
    console.table(rows);
  });

  test('with the lowest percentage change', async ({ page, context }) => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );

    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Lowest – highest' })
      .locator('div')
      .click();

    const rows: Record<string, string>[] = await getConstituents(FTSE100Page);

    console.log(
      'FTSE 100’s latest top 10 constituents with the lowest percentage change'
    );
    console.table(rows);
  });
});
