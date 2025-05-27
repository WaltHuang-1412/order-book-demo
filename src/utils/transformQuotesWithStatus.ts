export type QuoteRow = {
  price: number;
  size: number;
  total: number;
  percent: number;
  status: "new" | "changed-up" | "changed-down" | "unchanged" | "removed";
};

export function createQuoteTransformer(isBid: boolean) {
  return function transformQuotesWithStatus(
    rawEntries: [string, string][],
    statusMap: Partial<
      Record<
        string,
        "new" | "changed-up" | "changed-down" | "unchanged" | "removed"
      >
    > = {}
  ): QuoteRow[] {
    const filteredAndSortedEntries = [...rawEntries]
      // 排除 size = 0 的資料（不應顯示在畫面上）
      .filter(([_, sizeString]) => parseFloat(sizeString) > 0)
      .sort(([priceA], [priceB]) => {
        const priceFloatA = parseFloat(priceA);
        const priceFloatB = parseFloat(priceB);
        return isBid
          ? priceFloatB - priceFloatA // Bid: 價格高的在前
          : priceFloatA - priceFloatB; // Ask: 價格低的在前
      });

    let cumulativeTotalSize = 0;
    const transformedQuotes: QuoteRow[] = [];

    for (const [priceString, sizeString] of filteredAndSortedEntries) {
      const price = parseFloat(priceString);
      const size = parseFloat(sizeString);
      cumulativeTotalSize += size;

      const status = statusMap[priceString] ?? "unchanged";

      transformedQuotes.push({
        price,
        size,
        total: cumulativeTotalSize,
        percent: 0, // 先填 0，之後再補正
        status,
      });
    }

    const grandTotalSize = cumulativeTotalSize > 0 ? cumulativeTotalSize : 1;
    for (const quote of transformedQuotes) {
      quote.percent = quote.total / grandTotalSize;
    }

    return transformedQuotes;
  };
}

// 匯出處理 bid / ask 的轉換器
export const transformBidsWithStatus = createQuoteTransformer(true);
export const transformAsksWithStatus = createQuoteTransformer(false);
