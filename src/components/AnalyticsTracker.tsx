"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const visitorKey = "alpha_analytics_visitor_id";
const sessionKey = "alpha_analytics_session_id";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStoredId(key: string, storage: Storage) {
  const existing = storage.getItem(key);

  if (existing) {
    return existing;
  }

  const next = createId();
  storage.setItem(key, next);
  return next;
}

function sendPageView(pathname: string, search: string) {
  const path = search ? `${pathname}?${search}` : pathname;
  const visitorId = getStoredId(visitorKey, window.localStorage);
  const sessionId = getStoredId(sessionKey, window.sessionStorage);

  const payload = {
    eventType: "page_view",
    visitorId,
    sessionId,
    pathname: path,
    pageTitle: document.title,
    referrer: document.referrer,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
    return;
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      sendPageView(pathname, searchParams.toString());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  return null;
}

