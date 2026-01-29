import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";

const searchTool = new DynamicStructuredTool({
  name: "web_search",
  description: "Search the web for recent information",
  schema: z.object({
    query: z.string().describe("Search query in natural language"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("Maximum number of results to return"),
  }),
  func: async ({ query, maxResults = 5 }) => {
    return {}
  },
});