import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const botPattern =
  /bot|crawler|spider|crawling|facebookexternalhit|preview|slurp|duckduckbot|bingbot|googlebot|yandex|baiduspider/i;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanInteger(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return Math.round(number);
}

function hashIp(value: string) {
  const salt = process.env.ANALYTICS_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "alpha-analytics";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  try {
    const userAgent = req.headers.get("user-agent") || "";

    if (botPattern.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const body = await req.json();
    const eventType = cleanText(body.eventType, 40) || "page_view";
    const visitorId = cleanText(body.visitorId, 120);
    const pathname = cleanText(body.pathname, 500);

    if (!visitorId || !pathname) {
      return NextResponse.json({ error: "Missing analytics fields." }, { status: 400 });
    }

    const clientIp = getClientIp(req);
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("analytics_events").insert({
      event_type: eventType,
      visitor_id: visitorId,
      session_id: cleanText(body.sessionId, 120),
      pathname,
      page_title: cleanText(body.pageTitle, 250),
      referrer: cleanText(body.referrer, 500),
      user_agent: cleanText(userAgent, 500),
      ip_hash: clientIp ? hashIp(clientIp) : null,
      language: cleanText(body.language, 40),
      timezone: cleanText(body.timezone, 80),
      screen_width: cleanInteger(body.screenWidth),
      screen_height: cleanInteger(body.screenHeight),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to track analytics.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

