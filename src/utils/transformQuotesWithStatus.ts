export type QuoteRow = {
  price: number;
  size: number;
  total: number;
  percent: number;
  status: "new" | "changed-up" | "changed-down" | "unchanged" | "removed";
};

export function createQuoteTransformer(isBid: boolean) {
  return function transformQuotesWithStatus(
    entries: [string, string][],
    statusMap: Partial<
      Record<
        string,
        "new" | "changed-up" | "changed-down" | "unchanged" | "removed"
      >
    > = {}
  ): QuoteRow[] {
    const sorted = [...entries]
      .filter(([_, size]) => parseFloat(size) > 0)
      .sort(([a], [b]) =>
        isBid ? parseFloat(b) - parseFloat(a) : parseFloat(a) - parseFloat(b)
      );

    let total = 0;
    const result: QuoteRow[] = [];

    for (const [priceStr, sizeStr] of sorted) {
      const price = parseFloat(priceStr);
      const size = parseFloat(sizeStr);
      total += size;

      // 移除了 removed 的額外處理，簡化為 fallback to unchanged
      const status = statusMap[priceStr] ?? "unchanged";

      result.push({
        price,
        size,
        total,
        percent: 0,
        status,
      });
    }

    const grandTotal = total > 0 ? total : 1;
    for (const row of result) {
      row.percent = row.total / grandTotal;
    }

    return result;
  };
}

// 匯出兩個轉換器
export const transformBidsWithStatus = createQuoteTransformer(true);
export const transformAsksWithStatus = createQuoteTransformer(false);
