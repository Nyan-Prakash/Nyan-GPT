// app/routes/api.chat.ts
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { parseISO, isValid } from "date-fns";
import { auth } from "~/utils/auth.server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";


// --- Tool schema ---
const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, "Event title required"),
  description: z.string().optional(),
  location: z.string().optional(),
  // ISO 8601 timestamps preferred (e.g., "2025-10-02T14:00:00-04:00")
  start: z.string().describe("ISO 8601 start datetime, with timezone if possible"),
  end: z.string().describe("ISO 8601 end datetime, with timezone if possible"),
  // Optional calendar ID; default is 'primary'
  calendarId: z.string().optional()
});

type CreateCalendarEventArgs = z.infer<typeof CreateCalendarEventSchema>;

// Tiny helper for Add-to-Calendar link fallback
function googleLinkFrom(args: CreateCalendarEventArgs) {
  const details = encodeURIComponent(args.description ?? "");
  const location = encodeURIComponent(args.location ?? "");
  const text = encodeURIComponent(args.title);
  
  const dates = `${encodeURIComponent(args.start)}/${encodeURIComponent(args.end)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${dates}`;
}

async function createGoogleCalendarEvent(accessToken: string, args: CreateCalendarEventArgs) {
  const startDate = parseISO(args.start);
  const endDate = parseISO(args.end);
  if (!isValid(startDate) || !isValid(endDate)) {
    throw new Error("Invalid ISO date(s) for event start/end.");
  }

  const body = {
    summary: args.title,
    description: args.description ?? "",
    location: args.location ?? "",
    start: { dateTime: args.start },
    end:   { dateTime: args.end   },
  };

  const calendarId = args.calendarId ?? "primary";
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${text}`);
  }
  return await res.json(); 
}


async function CreateCalendarEventTool(args: CreateCalendarEventArgs, request: Request) {
  const parsed = CreateCalendarEventSchema.parse(args);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {

    return {
      created: false,
      reason: "No session",
      addToCalendarUrl: googleLinkFrom(parsed)
    };
  }


//fix
  const googleAccessToken = (session as any).providers?.google?.accessToken
                         || (session as any).googleAccessToken;

  if (!googleAccessToken) {
    return {
      created: false,
      reason: "No Google token on account",
      addToCalendarUrl: googleLinkFrom(parsed)
    };
  }

  const event = await createGoogleCalendarEvent(googleAccessToken, parsed);
  return {
    created: true,
    provider: "google",
    eventId: event.id,
    htmlLink: event.htmlLink
  };
}

export const maxDuration = 30;

export function loader(_: LoaderFunctionArgs) {
  return new Response("Method Not Allowed. Use POST.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  // Get the user session if needed for accessToken
  const session = await auth.api.getSession({ headers: request.headers });

   const { accessToken } = await auth.api.getAccessToken({
     body: {
       providerId: "google",
       userId: session?.user?.id,  
     }
   });

  const result = await streamText({
    model: openai("gpt-4o-mini"),          
    messages: convertToModelMessages(messages),
    tools: {
      CreateCalendarEvent: {
        description: "Create a calendar event for the current user",
        inputSchema: CreateCalendarEventSchema,
        execute: async (args) => {
          try {
            return await CreateCalendarEventTool(args as CreateCalendarEventArgs, request);
          } catch (err: any) {
            return { created: false, error: err?.message ?? "Unknown error" };
          }
        }
      }
    },
    system: [
      "You can schedule events for the user You must provide a Add-to-Calendar link.. If you feel like that need it. Recommend all fields of that event if you want to",
      "If the user asks to add/put/schedule/plan/invite/calendar a meeting, call CreateCalendarEvent with a precise title, start, and end in ISO 8601 with timezone.",
    ].join(" ")
  });

  return result.toUIMessageStreamResponse();
}



