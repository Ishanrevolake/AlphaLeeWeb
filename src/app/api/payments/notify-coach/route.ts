import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

type NotifyPayload = {
  paymentId?: string;
  paymentReference?: string;
  slipPath?: string;
  slipFileName?: string;
};

export async function POST(req: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const coachEmail = process.env.COACH_NOTIFICATION_EMAIL;

  if (!serviceRoleKey || !resendApiKey || !coachEmail) {
    return NextResponse.json({
      sent: false,
      reason: 'Coach email notification is not configured yet.',
    });
  }

  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token.' }, { status: 401 });
  }

  try {
    const payload = (await req.json()) as NotifyPayload;

    if (!payload.paymentId || !payload.slipPath) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid access token.' }, { status: 401 });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        reference,
        amount_lkr,
        slip_file_name,
        slip_storage_path,
        profiles:user_id (
          full_name,
          email,
          phone
        ),
        package_selections:package_selection_id (
          package_id,
          package_title,
          package_subtitle,
          reply_guarantee_addon,
          total_price_lkr,
          packages (
            id,
            category,
            title,
            subtitle,
            price_lkr
          )
        )
      `)
      .eq('id', payload.paymentId)
      .eq('user_id', authData.user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
    }

    const { data: signedSlip, error: signedSlipError } = await supabaseAdmin.storage
      .from('payment-slips')
      .createSignedUrl(payload.slipPath, 60 * 60 * 24 * 7);

    if (signedSlipError) {
      return NextResponse.json({ error: signedSlipError.message }, { status: 500 });
    }

    const profile = Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles;
    const packageSelection = Array.isArray(payment.package_selections)
      ? payment.package_selections[0]
      : payment.package_selections;
    const coachPaymentsUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/coach/payments`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_FROM_EMAIL || 'Alpha Lee Fitness <onboarding@resend.dev>',
        to: coachEmail,
        subject: `Payment slip submitted: ${payment.reference}`,
        html: `
          <h2>New onboarding payment submitted</h2>
          <p><strong>Client:</strong> ${profile?.full_name || 'Client'}</p>
          <p><strong>Email:</strong> ${profile?.email || authData.user.email || ''}</p>
          <p><strong>Phone:</strong> ${profile?.phone || ''}</p>
          <p><strong>Package:</strong> ${packageSelection?.package_title || ''} ${packageSelection?.package_subtitle || ''}</p>
          <p><strong>24-Hour Reply Guarantee:</strong> ${packageSelection?.reply_guarantee_addon ? 'Yes' : 'No'}</p>
          <p><strong>Amount:</strong> Rs. ${Number(payment.amount_lkr || 0).toLocaleString('en-US')}</p>
          <p><strong>Reference:</strong> ${payment.reference}</p>
          <p><strong>Slip file:</strong> ${payment.slip_file_name || payload.slipFileName || ''}</p>
          <p><a href="${signedSlip.signedUrl}">Open payment slip</a></p>
          <p><a href="${coachPaymentsUrl}">Open coach verification dashboard</a></p>
        `,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to notify coach.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
