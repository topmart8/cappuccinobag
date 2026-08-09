import { assertSafeAutomationEnvironment } from "../config/cappuccinobag.config.js";

export function getAutomationEnvironment(env = process.env) {
  const safety = assertSafeAutomationEnvironment(env);
  return {
    ...safety,
    mode: env.AUTOMATION_MODE || "draft_only",
    hasOpenAi: Boolean(env.OPENAI_API_KEY),
    hasSupabase: Boolean((env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL) && env.SUPABASE_SERVICE_ROLE_KEY),
    hasGsc: Boolean(env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY),
    hasGithub: Boolean(env.GITHUB_TOKEN),
  };
}

export function requireSafeEnvironment(env = process.env) {
  const result = getAutomationEnvironment(env);
  if (!result.ok) throw new Error(result.errors.join(" "));
  return result;
}
