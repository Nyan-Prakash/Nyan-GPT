// routes/api.ping.ts
import type { LoaderFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
  return new Response("pong", { status: 200 });
}
