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
    //Verify the user is in constitents page
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );

    //Verify the user is in FTSE 100 index page
    await expect(
      FTSE100Page.getByRole('heading', { name: 'FTSE 100' })
    ).toBeVisible({ timeout: 5000 });

    // Verify the table has been selected
    await expect(
      FTSE100Page.getByRole('listitem').filter({ hasText: /Table/i })
    ).toHaveClass(/active/);

    // Order by Highest to lowest
    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Highest – lowest' })
      .locator('div')
      .click();

    // Wait for the response
    await FTSE100Page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/components/refresh') &&
        resp.request().method() == 'POST' &&
        resp.status() == 200
    );

    // Use the helper function to extract and return the top 10 constituents with highest % change
    const rows: Record<string, string>[] = await getConstituents(
      FTSE100Page,
      11
    );

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

    await expect(
      FTSE100Page.getByRole('heading', { name: 'FTSE 100' })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      FTSE100Page.getByRole('listitem').filter({ hasText: /Table/i })
    ).toHaveClass(/active/);

    await FTSE100Page.getByText('Change %').click();
    await FTSE100Page.getByRole('listitem')
      .filter({ hasText: 'Lowest – highest' })
      .locator('div')
      .click();

    await FTSE100Page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/components/refresh') &&
        resp.request().method() == 'POST' &&
        resp.status() == 200
    );

    const rows: Record<string, string>[] = await getConstituents(
      FTSE100Page,
      11
    );

    console.log(
      'FTSE 100’s latest top 10 constituents with the lowest percentage change'
    );
    console.table(rows);
  });

  test('constituents with over 7 billion market cap', async () => {
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
      const classAttr = await link.getAttribute('class');
      const isActive: boolean = classAttr !== null && classAttr.includes('active');
      if (isActive) {
        rows.push(...(await getConstituents(FTSE100Page)));
        continue;
      }
      await link.click();
      await FTSE100Page.waitForLoadState('domcontentloaded');
      await expect(link).toHaveClass('page-number active');
      rows.push(...(await getConstituents(FTSE100Page)));
    }

    const mCapOverSevenBillion = rows.filter(
      (data) => parseFloat(data['Market cap (m)'].replace(/,/g, '')) > 7000.0
    );
    console.log('FTSE 100’s constituents with over 7 billion market cap');
    console.table(mCapOverSevenBillion);
  });

  test('month over the past three years recorded the lowest average index value', async () => {
    await expect(FTSE100Page).toHaveURL(
      /\/indices\/ftse-100\/constituents\/table/,
      { ignoreCase: true, timeout: 20000 }
    );

    const fromDate: Date = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 3);
    
    await FTSE100Page.getByRole('link', { name: 'Overview' }).click();

    await FTSE100Page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    await expect(FTSE100Page.locator('#w-advanced-chart-widget')).toBeVisible({
      timeout: 10000,
    });

    // Select the from data
    await FTSE100Page.getByRole('textbox', { name: 'Day in from date' }).fill(
      fromDate.getDate().toString().padStart(2, '0')
    );
    await FTSE100Page.getByRole('textbox', { name: 'Month in from date' }).fill(
      (fromDate.getMonth() + 1).toString().padStart(2, '0')
    );
    await FTSE100Page.getByRole('textbox', { name: 'Year in from date' }).fill(
      fromDate.getFullYear().toString()
    );

    await FTSE100Page.keyboard.press('Enter');

    //Select monthly from drop down
    await FTSE100Page.getByRole('button', {
      name: /(Daily|Weekly|Monthly) Periodicity/,
    }).click();
    await FTSE100Page.getByRole('menuitem', { name: 'Monthly' }).click();

    const response = await FTSE100Page.waitForResponse(
      (resp) =>
        resp.url().includes('/rest/api/timeseries/historical') &&
        resp.request().method() == 'GET' &&
        resp.status() == 200
    );

    let responseBody: any = await response.json();

    console.log(responseBody)

    const fromDateFromResponse:Date = responseBody.request.fromDate
    console.log(fromDateFromResponse)

    type data = { [key: string]: any; CLOSE_PRC: string; _DATE_END: string };
    const result: data = responseBody.data.reduce((min: data, curr: data) =>
      parseFloat(curr['CLOSE_PRC']) < parseFloat(min['CLOSE_PRC']) ? curr : min
    );

    const lowestAvgIndexValue: string = result['CLOSE_PRC'];
    const date: Date = new Date(result['_DATE_END']);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' })
   
    const expectedDate = `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2,'0')}-${fromDate.getDate().toString().padStart(2, '0')}`

    // Verify the response has from date
    expect(fromDateFromResponse.toString()).toContain(expectedDate)

    console.log(
      `${month},${year} had the lowest avereage index value over the past three years with ${lowestAvgIndexValue}`
    );
  });
});
