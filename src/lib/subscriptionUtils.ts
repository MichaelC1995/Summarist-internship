import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const verifyUserSubscription = async (userId: string): Promise<'basic' | 'premium' | 'premium-plus'> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        return userData?.subscriptionType || 'basic';
    } catch (error) {
        console.error('Error verifying subscription:', error);
        return 'basic';
    }
};

export const canAccessPremiumContent = async (userId: string): Promise<boolean> => {
    const subscriptionType = await verifyUserSubscription(userId);
    return subscriptionType === 'premium' || subscriptionType === 'premium-plus';
};