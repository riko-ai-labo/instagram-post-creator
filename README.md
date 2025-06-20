# Instagram投稿作成アプリ

Claude APIを使用してInstagram投稿を自動生成するWebアプリケーションです。

## 機能

- **ステップ1**: ターゲット・発信軸・投稿テーマの入力
- **ステップ2**: AIが生成した10個のタイトル案から選択
- **ステップ3**: PREP法に基づく投稿内容の自動生成
- **エクスポート**: CSV形式でのダウンロード・クリップボードコピー

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、Claude APIキーを設定してください。

```bash
cp .env.example .env
```

`.env`ファイルを編集：
```
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3000
```

### 3. Claude APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keysセクションでキーを生成
4. 生成されたキーを`.env`ファイルに設定

### 4. サーバーの起動

```bash
# 本番環境
npm start

# 開発環境（自動再起動）
npm run dev
```

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. ステップ1で基本情報（ターゲット、発信軸、投稿テーマ）を入力
3. ステップ2でAIが生成したタイトル案から選択
4. ステップ3でページ数を設定して投稿内容を生成
5. 生成された表をCSVダウンロードまたはコピー

## API仕様

### POST `/api/generate-titles`

タイトル案を生成

**リクエスト:**
```json
{
  "target": "30代働く女性",
  "accountTheme": "副業・起業支援",
  "postTheme": "在宅ワークの効率化"
}
```

**レスポンス:**
```json
{
  "titles": [
    "📱 在宅ワークで人生が変わる！実践者の声",
    "⚡ 3分で分かる！在宅ワークの効率化の基本",
    ...
  ]
}
```

### POST `/api/generate-content`

投稿内容を生成

**リクエスト:**
```json
{
  "target": "30代働く女性",
  "accountTheme": "副業・起業支援", 
  "postTheme": "在宅ワークの効率化",
  "selectedTitle": "📱 在宅ワークで人生が変わる！実践者の声",
  "pageCount": 5
}
```

**レスポンス:**
```json
{
  "pages": [
    {
      "title": "見出し",
      "subtitle": "サブタイトル",
      "content": "本文内容"
    }
  ]
}
```

## 技術スタック

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI**: Claude API (Anthropic)
- **その他**: CORS, dotenv

## 注意事項

- Claude APIの使用には料金が発生する場合があります
- APIキーは安全に管理してください
- `.env`ファイルはGitにコミットしないでください