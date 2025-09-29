import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("api/ping", "routes/api.ping.ts"),      // ← test route
  route("api/auth/*", "routes/api.auth.$.ts")

] satisfies RouteConfig;
