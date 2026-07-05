import { NextResponse } from "next/server";
import { getCorsHeaders, requireCoach } from "@/lib/coachApiAuth";

type AnalyticsEvent = {
  pathname: string | null;
  referrer: string | null;
  visitor_id: string | null;
  session_id: string | null;
  created_at: string;
};

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

function getDateRange(req: Request) {
  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") || 30), 1), 365);
  const endAt = new Date();
  const startAt = new Date(endAt);
  startAt.setDate(startAt.getDate() - days);

  return { startAt, endAt };
}

function incrementMap(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toRankedList(map: Map<string, number>, limit = 10) {
  return Array.from(map.entries())
    .map(([label, views]) => ({ label, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const coach = await requireCoach(req);

    if ("error" in coach) {
      return NextResponse.json({ error: coach.error }, { status: coach.status, headers: corsHeaders });
    }

    const { startAt, endAt } = getDateRange(req);
    const { data, error } = await coach.supabaseAdmin
      .from("analytics_events")
      .select("pathname,referrer,visitor_id,session_id,created_at")
      .eq("event_type", "page_view")
      .gte("created_at", startAt.toISOString())
      .lte("created_at", endAt.toISOString())
      .order("created_at", { ascending: true })
      .limit(10000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const events = (data || []) as AnalyticsEvent[];
    const visitors = new Set(events.map((event) => event.visitor_id).filter(Boolean));
    const sessions = new Set(events.map((event) => event.session_id).filter(Boolean));
    const pages = new Map<string, number>();
    const referrers = new Map<string, number>();
    const daily = new Map<string, { day: string; pageViews: number; uniqueVisitors: Set<string> }>();

    for (const event of events) {
      incrementMap(pages, event.pathname || "Unknown");
      incrementMap(referrers, event.referrer || "Direct");

      const day = event.created_at.slice(0, 10);
      const dailyEntry = daily.get(day) || { day, pageViews: 0, uniqueVisitors: new Set<string>() };
      dailyEntry.pageViews += 1;

      if (event.visitor_id) {
        dailyEntry.uniqueVisitors.add(event.visitor_id);
      }

      daily.set(day, dailyEntry);
    }

    return NextResponse.json(
      {
        summary: {
          pageViews: events.length,
          uniqueVisitors: visitors.size,
          sessions: sessions.size,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        },
        topPages: toRankedList(pages).map((item) => ({ pathname: item.label, pageViews: item.views })),
        topReferrers: toRankedList(referrers).map((item) => ({ referrer: item.label, pageViews: item.views })),
        daily: Array.from(daily.values()).map((item) => ({
          day: item.day,
          pageViews: item.pageViews,
          uniqueVisitors: item.uniqueVisitors.size,
        })),
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load analytics.";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

