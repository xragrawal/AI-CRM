import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Schema for capturing new info
const captureSchema = z.object({
  text: z.string().describe("The raw text, notes, or content to capture into the CRM"),
});

// Schema for recalling info
const recallSchema = z.object({
  query: z.string().describe("The natural language query to search the CRM for"),
});

/**
 * LangChain integration for unified CRM intent handling
 */
export class CRMChain {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      apiKey: process.env.GEMINI_API_KEY,
      maxOutputTokens: 2048,
    });
  }

  async processIntent(message: string) {
    // Define the tools
    const captureTool = new DynamicStructuredTool({
      name: "capture_info",
      description: "Use this tool when the user provides new information, notes, meeting minutes, or files to be added to the CRM. This will trigger the creation of a new entry/proposal.",
      schema: captureSchema,
      func: async ({ text }) => {
        return JSON.stringify({ action: "capture", data: text });
      },
    });

    const recallTool = new DynamicStructuredTool({
      name: "recall_info",
      description: "Use this tool when the user asks a question about existing deals, contacts, history, or status. This will trigger a search/analytic view.",
      schema: recallSchema,
      func: async ({ query }) => {
        return JSON.stringify({ action: "recall", data: query });
      },
    });

    const tools = [captureTool, recallTool];

    // Bind tools to the model
    const modelWithTools = this.model.bindTools(tools);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an intelligent CRM assistant. Your job is to determine if the user wants to CAPTURE new information or RECALL existing information. If they are just chatting, respond normally."],
      ["human", "{input}"],
    ]);

    const chain = prompt.pipe(modelWithTools);
    const response = await chain.invoke({ input: message });

    // Extract tool calls
    const toolCalls = response.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      if (toolCall.name === "capture_info") {
        return { intent: "capture", content: toolCall.args.text };
      } else if (toolCall.name === "recall_info") {
        return { intent: "recall", query: toolCall.args.query };
      }
    }

    // Default to chat if no tool called
    return { intent: "chat", response: response.content as string };
  }
}

export const crmChain = new CRMChain();
