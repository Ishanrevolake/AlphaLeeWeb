import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type CoachApiRequest = {
  headers: {
    get(name: string): string | null;
  };
};

export function getCorsHeaders(req: CoachApiRequest) {
  const origin = req.headers.get("origin") || "";
  const configuredOrigins = (process.env.COACH_DASHBOARD_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin = configuredOrigins.length
    ? configuredOrigins.includes(origin)
      ? origin
      : configuredOrigins[0]
    : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}

export async function requireCoach(req: CoachApiRequest) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return { error: "Missing access token.", status: 401 as const };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return { error: "Invalid access token.", status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || !["coach", "admin"].includes(String(profile.role))) {
    return { error: "Coach access required.", status: 403 as const };
  }

  return { supabaseAdmin, user: authData.user };
}
