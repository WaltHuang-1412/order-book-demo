// utils/transformQuotes.ts
export type QuoteRow = {
  price: number;
  size: number;
  total: number;
  percent: number;
};

export function transformQuotes(
  quotes: [string, string][],
  isBid: boolean
): QuoteRow[] {
  let cumulative = 0;
  const sorted = [...quotes].sort((a, b) =>
    isBid
      ? parseFloat(b[0]) - parseFloat(a[0])
      : parseFloat(a[0]) - parseFloat(b[0])
  );

  const rows = sorted.map(([priceStr, sizeStr]) => {
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);
    cumulative += size;
    return { price, size, total: cumulative };
  });

  const sideTotal = rows.at(-1)?.total || 1;
  return rows.map((row) => ({
    ...row,
    percent: row.total / sideTotal,
  }));
}
