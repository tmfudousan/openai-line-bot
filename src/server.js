import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { messagingApi, middleware } from "@line/bot-sdk";

dotenv.config({ path: ".env.local", override: false });

const requiredEnv = [
  "OPENAI_API_KEY",
  "LINE_CHANNEL_SECRET",
  "LINE_CHANNEL_ACCESS_TOKEN",
];

const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
}

const app = express();
const port = Number(process.env.PORT || 3000);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "openai-line-bot" });
});

app.post(
  "/webhook",
  middleware({ channelSecret: process.env.LINE_CHANNEL_SECRET }),
  async (req, res) => {
    res.sendStatus(200);

    const results = await Promise.allSettled(req.body.events.map(handleEvent));
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Webhook event failed:", result.reason);
      }
    }
  },
);

async function handleEvent(event) {
  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    !event.replyToken
  ) {
    return;
  }

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    instructions:
      "あなたは株式会社TM不動産のLINE公式アカウントのアシスタントです。" +
      "日本語で、簡潔かつ丁寧に回答してください。" +
      "不動産の契約、法務、税務について断定せず、必要に応じて専門家への確認を案内してください。",
    input: event.message.text,
  });

  const text =
    response.output_text?.trim() ||
    "申し訳ありません。回答を作成できませんでした。もう一度お試しください。";

  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text: text.slice(0, 5000) }],
  });
}

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error);
  if (!res.headersSent) {
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`LINE bot listening on port ${port}`);
});
