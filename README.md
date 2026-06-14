# OpenAI LINE Bot

LINE Messaging APIで受信したテキストをOpenAI APIへ送り、LINEへ返信するWebhookアプリです。

## 起動

```bash
npm install
npm start
```

起動後のエンドポイント:

- ヘルスチェック: `GET /`
- LINE Webhook: `POST /webhook`

本番環境へ公開したら、LINE DevelopersのWebhook URLに次を設定します。

```text
https://あなたの公開URL/webhook
```

LINE Official Account Managerの「応答設定」では、Webhookを有効にし、重複返信を避けるため応答メッセージを無効にしてください。

## 環境変数

`.env.example`を参照してください。実際の認証情報を含む`.env.local`はGit管理から除外されています。
