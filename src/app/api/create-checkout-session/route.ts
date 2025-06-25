import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Creating checkout session with:', body);

        const { userId, priceId, plan } = body;

        if (!userId || !priceId || !plan) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, priceId, or plan' },
                { status: 400 }
            );
        }

        console.log('Creating session for:', { userId, plan, priceId });

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
                userId: userId,
                plan: plan,
            },

            subscription_data: {
                metadata: {
                    userId: userId,
                    plan: plan,
                },
                ...(plan === 'yearly' && { trial_period_days: 7 }),
            },

            customer_email: undefined,

            payment_method_collection: 'always',

            billing_address_collection: 'auto',
        });

        console.log('✅ Session created successfully:', {
            sessionId: session.id,
            mode: session.mode,
            hasMetadata: !!session.metadata,
            metadata: session.metadata
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error: unknown) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}