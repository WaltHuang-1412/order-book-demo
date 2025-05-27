# Order Book Demo

一個即時訂單簿（Order Book）的示範專案，使用 React + TypeScript + Vite 開發。

## 功能特點

- 即時顯示買賣盤口數據
- 價格變動動畫效果
- 自適應深色主題
- WebSocket 即時數據更新
- 響應式設計

## 技術棧

- React 18
- TypeScript
- Vite
- Tailwind CSS
- WebSocket

## 開始使用

### 安裝依賴

```bash
yarn
```

### 開發模式

```bash
yarn dev
```

### 建置專案

```bash
yarn build
```

## 專案結構

```
src/
├── assets/        # 靜態資源
├── components/    # React 組件
├── utils/         # 工具函數
└── App.tsx        # 主應用組件
```

## 主要組件

- `LastPriceBar`: 最新價格顯示
- `OrderBook`: 訂單簿主體
- `WebSocketClient`: WebSocket 連接管理


## 開發說明

1. WebSocket 連接管理在 `src/utils/wsClient.ts`
2. 訂單簿邏輯在 `src/components/OrderBook.tsx`
3. 價格顯示組件在 `src/components/LastPriceBar.tsx`

## 授權

MIT License
