import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
    try {
        const { userId, priceId, plan } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/choose-plan`,
            metadata: {
                userId,
                plan,
            },
            subscription_data: {
                trial_period_days: plan === 'yearly' ? 7 : 0,
                metadata: {
                    userId,
                    plan,
                },
            },
            payment_method_collection: 'always',
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}