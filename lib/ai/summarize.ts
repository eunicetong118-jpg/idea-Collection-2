import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function generateSummary(title: string, description: string): Promise<string> {
  const model = new ChatOllama({
    model: "llama3.2:latest",
    temperature: 0,
    baseUrl: "http://localhost:11434",
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
  } catch (error: any) {
    console.error("Error generating summary (Local Ollama):", error.message || error);
    return "Failed to generate summary with local LLM.";
  }
}
