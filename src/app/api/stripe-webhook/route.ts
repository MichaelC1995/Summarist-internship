import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
    return NextResponse.json({
        status: 'webhook endpoint is working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    console.log('🚨 STRIPE WEBHOOK CALLED! 🚨');
    console.log('📅 Time:', new Date().toISOString());

    try {
        const body = await request.text();
        const event = JSON.parse(body);

        console.log('🎯 Event type:', event.type);
        console.log('🆔 Event ID:', event.id);

        if (event.type === 'checkout.session.completed') {
            console.log('💳 Processing checkout.session.completed');

            const session = event.data.object;
            const userId = session.metadata?.userId;
            const plan = session.metadata?.plan;

            console.log('✅ Found metadata in checkout session:', { userId, plan });

            if (userId) {
                return await updateUserSubscription(userId, plan, session.customer, session.subscription);
            } else {
                console.error('❌ No userId in checkout session metadata');
                return NextResponse.json({
                    error: 'No userId in checkout session metadata',
                    received: true
                });
            }
        }

        else if (event.type === 'invoice.payment_succeeded') {
            console.log('💳 Processing invoice.payment_succeeded (fallback method)');

            const invoice = event.data.object;

            if (!invoice.subscription) {
                console.log('ℹ️  Invoice has no subscription - skipping');
                return NextResponse.json({ received: true });
            }

            try {
                console.log('🔍 Fetching subscription details for metadata...');

                const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

                console.log('📋 Subscription metadata:', subscription.metadata);

                const userId = subscription.metadata?.userId;
                const plan = subscription.metadata?.plan;

                if (userId) {
                    console.log('✅ Found userId in subscription metadata:', userId);
                    return await updateUserSubscription(userId, plan, invoice.customer, invoice.subscription);
                } else {
                    console.error('❌ No userId found in subscription metadata');
                    console.log('🔍 Available metadata keys:', Object.keys(subscription.metadata || {}));
                    return NextResponse.json({
                        error: 'No userId in subscription metadata',
                        received: true
                    });
                }

            } catch (stripeError) {
                console.error('❌ Error fetching subscription:', stripeError);
                return NextResponse.json({
                    error: 'Failed to fetch subscription details',
                    received: true
                });
            }
        }

        else if (event.type === 'customer.subscription.updated' ||
            event.type === 'customer.subscription.deleted') {
            console.log(`📝 Processing ${event.type}`);

            const subscription = event.data.object;
            const userId = subscription.metadata?.userId;

            if (userId) {
                const status = subscription.status === 'active' ? 'active' : 'inactive';
                const plan = subscription.metadata?.plan || 'monthly';

                console.log(`🔄 Updating subscription status to: ${status}`);
                return await updateUserSubscription(userId, plan, subscription.customer, subscription.id, status);
            }
        }

        console.log('ℹ️  Event not handled:', event.type);
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}

async function updateUserSubscription(
    userId: string,
    plan: string,
    customerId: string,
    subscriptionId: string,
    status: string = 'active'
) {
    console.log('🔥 Starting Firestore update:', { userId, plan, status });

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
        console.error('❌ Missing Firebase configuration');
        return NextResponse.json({ error: 'Missing Firebase config' });
    }

    const subscriptionType = plan === 'yearly' ? 'premium-plus' : 'premium';

    const updateData = {
        fields: {
            subscriptionType: { stringValue: subscriptionType },
            stripeCustomerId: { stringValue: customerId || '' },
            subscriptionId: { stringValue: subscriptionId || '' },
            subscriptionStatus: { stringValue: status },
            updatedAt: { timestampValue: new Date().toISOString() }
        }
    };

    const fieldPaths = Object.keys(updateData.fields)
        .map(field => `updateMask.fieldPaths=${field}`)
        .join('&');

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?${fieldPaths}&key=${apiKey}`;

    console.log('🌐 Updating Firestore for user:', userId);
    console.log('📝 Subscription type:', subscriptionType, 'Status:', status);

    try {
        const response = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        const responseText = await response.text();

        if (response.ok) {
            console.log('🎉 SUCCESS! User subscription updated in Firestore');
            console.log('✅ User:', userId, 'is now', subscriptionType, 'with status:', status);
            return NextResponse.json({
                success: true,
                userId,
                subscriptionType,
                status,
                message: 'Subscription updated successfully'
            });
        } else {
            console.error('❌ Firestore update failed:', response.status);
            console.error('📄 Error response:', responseText);
            return NextResponse.json({
                error: 'Firestore update failed',
                details: responseText
            });
        }
    } catch (error) {
        console.error('❌ Firestore error:', error);
        return NextResponse.json({
            error: 'Firestore error',
            details: error.toString()
        });
    }
}