# NovaChat

NovaChat は Next.js 14 (App Router) と Vercel Edge Functions 上で動作する、OpenAI gpt-5-mini を使ったストリーミング対応のチャットアプリです。完全レスポンシブなライトモード UI とローカル保存付きの会話体験を提供します。

## セットアップ

```bash
npm install
```

環境変数を `.env.local` などに設定します。

```bash
OPENAI_API_KEY=your_key_here
APP_TITLE=NovaChat
```

## 開発

```bash
npm run dev
```

`http://localhost:3000/chat` にアクセスするとチャット UI を確認できます。

## テスト

Playwright による最小のエンドツーエンドテストを用意しています。

```bash
npm run test
```

## ビルド

```bash
npm run build
```

Vercel へデプロイする場合は上記コマンドで型チェックとビルドが通ることを確認してください。
