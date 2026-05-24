import { NextResponse } from "next/server";
import { getCorsHeaders, requireCoach } from "@/lib/coachApiAuth";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const coach = await requireCoach(req);

    if ("error" in coach) {
      return NextResponse.json({ error: coach.error }, { status: coach.status, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);

    let query = coach.supabaseAdmin
      .from("payments")
      .select(
        `
        id,
        user_id,
        package_selection_id,
        method,
        reference,
        amount_lkr,
        status,
        slip_file_name,
        slip_storage_path,
        submitted_at,
        verified_at,
        verified_by,
        rejection_reason,
        profiles:user_id (
          full_name,
          email,
          phone
        ),
        package_selections:package_selection_id (
          package_id,
          package_title,
          package_subtitle,
          total_price_lkr,
          reply_guarantee_addon,
          packages (
            id,
            category,
            title,
            subtitle,
            price_lkr,
            footer_text,
            features
          )
        )
      `,
      )
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (status && ["pending_verification", "verified", "rejected"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const payments = await Promise.all(
      (data || []).map(async (payment) => {
        if (!payment.slip_storage_path) return payment;

        const { data: signedSlip } = await coach.supabaseAdmin.storage
          .from("payment-slips")
          .createSignedUrl(payment.slip_storage_path, 60 * 15);

        return {
          ...payment,
          slip_signed_url: signedSlip?.signedUrl || null,
          slip_signed_url_expires_in_seconds: 60 * 15,
        };
      }),
    );

    return NextResponse.json({ payments }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load payments.";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
