// app/api/stripe-webhook/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan;

                if (userId) {
                    await updateDoc(doc(db, 'users', userId), {
                        subscriptionType: plan === 'yearly' ? 'premium-plus' : 'premium',
                        stripeCustomerId: session.customer as string,
                        subscriptionId: session.subscription as string,
                        subscriptionStatus: 'active',
                    });
                }
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId && subscription.trial_end) {
                    await updateDoc(doc(db, 'users', userId), {
                        subscriptionType: subscription.metadata.plan === 'yearly' ? 'premium-plus' : 'premium',
                        subscriptionStatus: 'trialing',
                        isTrialing: true,
                        trialEnd: new Date(subscription.trial_end * 1000),
                        subscriptionId: subscription.id,
                    });
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await updateDoc(doc(db, 'users', userId), {
                        subscriptionStatus: subscription.status,
                        subscriptionEnd: new Date(subscription.current_period_end * 1000),
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await updateDoc(doc(db, 'users', userId), {
                        subscriptionType: 'basic',
                        subscriptionStatus: 'canceled',
                        subscriptionEnd: new Date(subscription.current_period_end * 1000),
                    });
                }
                break;
            }

            case 'customer.subscription.trial_will_end': {
                // Sent 3 days before trial ends
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    // You can send reminder emails here
                    console.log(`Trial ending soon for user ${userId}`);
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

// Stripe webhooks require raw body, so we need to disable body parsing
export const config = {
    api: {
        bodyParser: false,
    },
};