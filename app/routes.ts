import { type RouteConfig, index, route } from "@react-router/dev/routes";



export default [
  index("routes/dashboard.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("api/chat", "routes/api.chat.ts"),

] satisfies RouteConfig;
