import { RunnableLambda } from "@langchain/core/runnables";
import z from "zod";

const toUpper = new RunnableLambda({
  func: (result: any) => result.content.toUpperCase(),
});

const parseJson = new RunnableLambda({
  func: (result: any) => JSON.parse(result.content),
});

const Schema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

const validate = new RunnableLambda({
  func: (data: any) => Schema.parse(data),
});

// const chain = prompt
//   .pipe(llm)
//   .pipe(parseJson)
//   .pipe(validate);

const router = new RunnableLambda({
  func: (input: any) => {
    if (input.type === "search") return "web";
    return "rag";
  },
});

const extractQuery = new RunnableLambda({
  func: (input: any) => {
    if (!input?.query) throw new Error("query required");
    return input.query;
  },
});

// const chain = extractQuery
//   .pipe(prompt)
//   .pipe(e.in.openAi);

// const response = await chain.invoke({ query: "" );