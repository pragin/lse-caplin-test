import { Locator, Page } from '@playwright/test';
export const getConstituents = async (
  FTSE100Page: Page,
  noOfRows?: number
): Promise<Record<string, string>[]> => {
  const tableRows = await FTSE100Page.locator('table tr').all();
  const rowsToExtract =
    typeof noOfRows === 'number'
      ? tableRows.slice(0, noOfRows)
      : tableRows.slice(0);

  const data: string[][] = [];

  for (const row of rowsToExtract) {
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
  return rows;
};
