import { NextResponse } from "next/server";
import { getCorsHeaders, requireCoach } from "@/lib/coachApiAuth";

type PaymentStatus = "verified" | "rejected";

type RouteContext = {
  params: {
    paymentId: string;
  };
};

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const coach = await requireCoach(req);

    if ("error" in coach) {
      return NextResponse.json({ error: coach.error }, { status: coach.status, headers: corsHeaders });
    }

    const payload = (await req.json()) as {
      status?: PaymentStatus;
      rejectionReason?: string;
    };

    if (!payload.status || !["verified", "rejected"].includes(payload.status)) {
      return NextResponse.json(
        { error: "Status must be either verified or rejected." },
        { status: 400, headers: corsHeaders },
      );
    }

    const patch =
      payload.status === "verified"
        ? {
            status: payload.status,
            verified_at: new Date().toISOString(),
            verified_by: coach.user.id,
            rejection_reason: null,
          }
        : {
            status: payload.status,
            verified_at: null,
            verified_by: null,
            rejection_reason: payload.rejectionReason || "Payment slip could not be verified.",
          };

    const { data, error } = await coach.supabaseAdmin
      .from("payments")
      .update(patch)
      .eq("id", context.params.paymentId)
      .select("id, user_id, reference, amount_lkr, status, verified_at, verified_by, rejection_reason")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ payment: data }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update payment.";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
