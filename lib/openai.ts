import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY が設定されていません。APIリクエストは失敗します。");
}

export const openai = new OpenAI({
  apiKey,
});
