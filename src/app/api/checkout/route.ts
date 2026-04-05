import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // using a fixed api version
});

const PACKAGE_PRICES: Record<string, number> = {
  starter: 9900,  // $99 in cents
  pro: 19900,     // $199 in cents
  elite: 39900,   // $399 in cents
};

export async function POST(req: Request) {
  try {
    const { userDetails, packageName } = await req.json();

    if (!userDetails || !packageName) {
      return NextResponse.json({ error: 'Missing details' }, { status: 400 });
    }

    const price = PACKAGE_PRICES[packageName];
    if (!price) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // 1. Save user to Supabase
    let userId = '';
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userDetails.email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      // Optionally update details here
      await supabase.from('users').update({
        name: userDetails.name,
        age: parseInt(userDetails.age) || null,
        weight: userDetails.weight,
        height: userDetails.height,
        goals: userDetails.goals
      }).eq('id', userId);
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          name: userDetails.name,
          email: userDetails.email,
          age: parseInt(userDetails.age) || null,
          weight: userDetails.weight,
          height: userDetails.height,
          goals: userDetails.goals
        })
        .select()
        .single();
        
      if (userError) throw userError;
      userId = newUser.id;
    }

    // 2. Create pending subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        package_name: packageName,
        price: price / 100, // store in dollars
        payment_status: 'pending'
      })
      .select()
      .single();

    if (subError) throw subError;

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Alpha Lee ${packageName.charAt(0).toUpperCase() + packageName.slice(1)} Plan`,
              description: 'Premium Fitness Coaching Subscription',
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup/step-3`,
      client_reference_id: subscription.id,
      metadata: {
        userId,
        subscriptionId: subscription.id,
        packageName
      }
    });

    // 4. Update subscription with stripe session id
    if (session.id) {
       await supabase
        .from('subscriptions')
        .update({ stripe_session_id: session.id })
        .eq('id', subscription.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
