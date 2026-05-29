# SmartPOS システム構成図

![SmartPOS システム構成図](./system-architecture-current.svg)

## 補足

- 通常の入口は Web Server で、React の画面と `/api` を受ける構成として描いています。
- 開発時は Vite Dev Server から画面を確認します。
- React から MySQL へは直接接続せず、PHP API が PDO で接続します。
