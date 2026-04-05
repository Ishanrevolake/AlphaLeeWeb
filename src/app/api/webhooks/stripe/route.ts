import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      if (!webhookSecret) throw new Error('Missing Stripe webhook secret');
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const subscriptionId = session.client_reference_id;

      if (subscriptionId) {
        // Update subscription payment status to paid
        const { error } = await supabase
          .from('subscriptions')
          .update({ payment_status: 'paid' })
          .eq('id', subscriptionId);
          
        if (error) {
          console.error('Error updating Supabase:', error);
          return NextResponse.json({ error: 'Supabase Error' }, { status: 500 });
        }
        console.log(`Payment confirmed for subscription ${subscriptionId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
