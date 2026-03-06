import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function generateSummary(title: string, description: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. Skipping summarization.");
    return "Summarization unavailable (missing API key).";
  }

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0,
  });

  const prompt = PromptTemplate.fromTemplate(`
    You are an AI assistant specialized in summarizing creative ideas for administrators.
    Summarize the following idea in exactly 100 words or less.
    Focus on the core value proposition and key features.

    Title: {title}
    Description: {description}

    Summary:
  `);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    const summary = await chain.invoke({
      title: title,
      description: description,
    });
    return summary.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary.";
  }
}
