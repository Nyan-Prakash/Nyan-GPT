// routes/api.auth.$.ts
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { auth } from "../utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  // DEBUG: peek at the body without consuming it
  const clone = request.clone();
  let body: unknown = null;
  try { body = await clone.json(); } catch {}
  console.log("[AUTH ACTION BODY]", body);

  try {
    return await auth.handler(request);
  } catch (e: any) {
    console.error("[AUTH ACTION ERROR]", e);
    return new Response(JSON.stringify({
      error: e?.message ?? "unknown",
      stack: e?.stack,
    }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
