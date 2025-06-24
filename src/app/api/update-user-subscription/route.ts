import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    try {
        const { userId, plan } = await req.json();

        console.log('🔧 DEV: Manually updating subscription for:', userId, plan);

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

        const updateData = {
            fields: {
                subscriptionType: {
                    stringValue: plan === 'yearly' ? 'premium-plus' : 'premium'
                },
                subscriptionStatus: {
                    stringValue: 'active'
                },
                updatedAt: {
                    timestampValue: new Date().toISOString()
                }
            }
        };

        const fieldPaths = Object.keys(updateData.fields)
            .map(field => `updateMask.fieldPaths=${field}`)
            .join('&');

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?${fieldPaths}&key=${apiKey}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (response.ok) {
            console.log('✅ DEV: Subscription updated successfully');
            return NextResponse.json({ success: true });
        } else {
            const errorText = await response.text();
            console.error('❌ DEV: Update failed:', errorText);
            return NextResponse.json({ error: errorText }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ DEV: Error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}