import { test, expect, Page } from '@playwright/test';
import { getConstituents } from '../utils/constituentsHelper';

test.describe('FTSE 100', () => {
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
  test('latest top 10 constituents with the highest percentage change', async () => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );
    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Highest – lowest' })
      .locator('div')
      .click();

    const rows: Record<string, string>[] = await getConstituents(FTSE100Page, 11);

    console.log(
      'FTSE 100’s latest top 10 constituents with the highest percentage change'
    );
    console.table(rows);
  });

  test('latest top 10 constituents with the lowest percentage change', async () => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );

    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Lowest – highest' })
      .locator('div')
      .click();

    const rows: Record<string, string>[] = await getConstituents(FTSE100Page, 11);

    console.log(
      'FTSE 100’s latest top 10 constituents with the lowest percentage change'
    );
    console.table(rows);
  });

  test('with over 7 billion market cap', async () => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );
    await FTSE100Page.getByText('Market cap (m)').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Highest – lowest' })
      .locator('div')
      .click();

    const paginationLinks = await FTSE100Page.locator('.paginator a').all();

    let rows: Record<string, string>[] = [];

    for (const link of paginationLinks) {
      const isActive = (await link.getAttribute('class'))?.includes('active');
      if (isActive) {
        
        rows.push(...await getConstituents(FTSE100Page));
        continue;
      }
      await link.click();
      await FTSE100Page.waitForLoadState('domcontentloaded');
      await expect(link).toHaveClass('page-number active');
      rows.push(...await getConstituents(FTSE100Page));
    }
   
    const mCapOverSevenBillion = rows.filter(data => parseFloat(data['Market cap (m)'].replace(/,/g, '')) > 7000.00)                                  
    console.log(
      'FTSE 100’s constituents with over 7 billion market cap'
    );
    console.table(mCapOverSevenBillion)
  });
});
