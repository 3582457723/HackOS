# HackOS 本格運用デプロイガイド

無料で運用するための完全デプロイガイド（GitHub Pages + Render）

## 📋 前提条件

- GitHub アカウント
- Render.com アカウント（無料登録可）
- Node.js 18+

---

## 🚀 デプロイ手順

### **フェーズ1: GitHub にコミット**

```bash
cd /workspaces/HackOS

# すべての変更をステージング
git add -A

# コミット
git commit -m "feat: Setup for GitHub Pages + Render deployment

- Separated frontend and backend configurations
- Added Socket.IO dynamic configuration for production
- Added CORS support for GitHub Pages origin
- Ready for free tier deployment"

# プッシュ
git push origin main
```

---

### **フェーズ2: GitHub Pages デプロイ**

#### 2-1. gh-pages をインストール

```bash
npm install gh-pages --save-dev
```

#### 2-2. package.json にデプロイスクリプトを追加

```json
{
  "scripts": {
    "deploy": "gh-pages -d public"
  }
}
```

#### 2-3. GitHub リポジトリ設定

1. GitHub で `/HackOS` リポジトリを開く
2. **Settings** → **Pages** に移動
3. **Source**: `gh-pages` ブランチを選択
4. **Save** をクリック

#### 2-4. デプロイ実行

```bash
npm run deploy
```

**結果**: フロントエンドが以下でアクセス可能：
```
https://3582457723.github.io/HackOS/
```

---

### **フェーズ3: Render バックエンドデプロイ**

#### 3-1. Render.com にサインイン

https://render.com にアクセスして GitHub でサインイン

#### 3-2. 新規 Web Service を作成

1. **Dashboard** → **New +** → **Web Service**
2. GitHub リポジトリを接続（HackOS）
3. 以下を設定：

| 項目 | 値 |
|---|---|
| **Name** | `hackosgame-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

#### 3-3. 環境変数を設定

**Environment Variables** に以下を追加：

```
NODE_ENV = production
CORS_ORIGIN = https://3582457723.github.io
```

#### 3-4. デプロイ

**Deploy** ボタンをクリック（自動でビルド＆起動）

**結果**: バックエンドの URL（例）：
```
https://hackosgame-backend.onrender.com
```

---

### **フェーズ4: フロントエンドを接続**

#### 4-1. Socket.IO URL を設定

`public/js/socket-io-config.js` の URL を確認：

```javascript
const backendURL = 'https://hackosgame-backend.onrender.com';
```

#### 4-2. ローカルで動作確認

```bash
npm start
```

ブラウザで http://localhost:3000 を開いてテスト

#### 4-3. GitHub に再プッシュ

```bash
git add -A
git commit -m "feat: Connect frontend to Render backend"
git push origin main
```

#### 4-4. GitHub Pages に再デプロイ

```bash
npm run deploy
```

---

## 🔗 最終確認

### **フロントエンド**
```
https://3582457723.github.io/HackOS/
```

### **バックエンド**
```
https://hackosgame-backend.onrender.com
```

### **動作確認項目**

- [ ] フロントエンドが読み込まれる
- [ ] ブートアニメーションが表示される
- [ ] ログインできる
- [ ] ターミナルコマンドが実行される
- [ ] `scan` でネットワーク検索できる（マルチプレイヤー機能）
- [ ] オンラインプレイヤーが検知される

---

## ⚙️ トラブルシューティング

### Q: Socket.IO が接続できない

**原因**: CORS エラーの可能性

**対応**:
```javascript
// ブラウザコンソールで確認
window.__HACKO_BACKEND_URL__ = 'https://your-backend-url.onrender.com';
```

### Q: GitHub Pages から Render に接続できない

**原因**: ドメインが CORS リストに登録されていない

**対応**: Render の Environment Variables を確認
```
CORS_ORIGIN = https://3582457723.github.io
```

### Q: Render が起動しない

**原因**: `npm start` で `src/server.js` が見つからない

**対応**: package.json の `main` フィールドを確認
```json
"main": "src/server.js"
```

---

## 💾 本番運用のコツ

### 1. **定期的にバックアップ**
```bash
# LocalStorage データをエクスポート
localStorage_backup=$(localStorage.getItem('hackosx_gamestate'))
```

### 2. **ログをモニタリング**
- Render ダッシュボードでログを確認
- Socket.IO 接続状況を監視

### 3. **パフォーマンス最適化**
- Render Free プランは 15分無操作で休止するため、定期的なクライアント側の ping を追加

```javascript
// app.js に追加
setInterval(() => {
    if (app.socket) app.socket.emit('ping');
}, 5 * 60 * 1000); // 5分ごと
```

### 4. **スケーリング**
ユーザーが増えたら Render を有料プランに升级

---

## 📊 無料プランの制限

| サービス | 無料プラン制限 |
|---------|------------|
| **GitHub Pages** | 無制限（1GB/リポジトリ） |
| **Render Web Service** | 15分無操作で休止、月750時間まで |
| **Socket.IO接続** | 無制限（ただし単一インスタンス） |

---

## ✅ 完了したら

1. `package.json` から `homepage` フィールドが正しく設定されているか確認
2. GitHub Actions で自動デプロイを設定（オプション）
3. ドメインを買ってカスタムドメイン設定（オプション）

---

**🎮 デプロイ完了！HackOS をプレイしましょう！**
