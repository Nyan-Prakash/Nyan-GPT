import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export const maxDuration = 30;

export function loader(_: LoaderFunctionArgs) {
  return new Response("Method Not Allowed. Use POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = await streamText({
        model: openai("gpt-4o"),
        messages: convertToModelMessages(messages),
    });

  return result.toUIMessageStreamResponse();
}
