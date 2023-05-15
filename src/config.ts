import { Configuration, OpenAIApi } from "openai";

if (!process.env["OPENAI_API_KEY"]) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const config = new Configuration({
  apiKey: process.env["OPENAI_API_KEY"] as string,
});

export const openai = new OpenAIApi(config);
