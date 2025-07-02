import { Page } from '@playwright/test'
export const getConstituents = async (FTSE100Page: Page): Promise<Record<string, string>[]> => {
    const tableRows = await FTSE100Page.locator('table tr').all();
    const first10Rows = tableRows.slice(0, 11);

    const data: string[][] = [];

    for (const row of first10Rows) {
      const cells: string[] = await row.locator('th,td').allInnerTexts();

      if (cells.length != 0) {
        data.push(cells);
      }
    }

    const headings: string[] = data[0];
    const rows: Record<string, string>[] = data
      .slice(1)
      .map((row: string[]) =>
        Object.fromEntries(row.map((cell, i) => [headings[i], cell]))
      );
    return rows
}

