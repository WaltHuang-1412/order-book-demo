export type QuoteRow = {
  price: number;
  size: number;
  total: number;
  percent: number;
  status: "new" | "changed-up" | "changed-down" | "unchanged" | "removed";
};

/**
 * 📘 說明：Buy / Sell、Bids / Asks 概念對照
 *
 * ┌────────────┬──────────────┬──────────────┬───────────────┐
 * │ 類型       │ 英文名稱     │ 說明         │ 顯示顏色       │
 * ├────────────┼──────────────┼──────────────┼───────────────┤
 * │ 買單       │ Bid          │ 使用者掛單想「買進」 │ 🟢 綠色（價格從高 → 低） │
 * │ 賣單       │ Ask / Offer  │ 使用者掛單想「賣出」 │ 🔴 紅色（價格從低 → 高） │
 * └────────────┴──────────────┴──────────────┴───────────────┘
 *
 * 在訂單簿畫面中：
 * - Bid（買單）會顯示在下方或左側，按價格高 → 低 排序
 * - Ask（賣單）會顯示在上方或右側，按價格低 → 高 排序
 *
 * transformBidsWithStatus / transformAsksWithStatus 負責：
 * - 排序價格順序（符合買/賣單邏輯）
 * - 累加 size 成 total，並計算每筆佔比 percent
 * - 回傳轉換後的 QuoteRow 陣列，供畫面渲染用
 *
 * ⚠️ 注意：
 * - price 不會變動，但 size 會增減
 * - total = 累加 size 至當前價格
 * - percent = total / grandTotal，用來畫背景 bar 長度
 */

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
