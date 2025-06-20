export interface Book {
    id: string;
    author: string;
    title: string;
    subTitle: string;
    imageLink: string;
    audioLink: string;
    totalRating: number;
    averageRating: number;
    keyIdeas: number;
    type: 'audio' | 'text' | 'audio & text';
    status: 'selected' | 'recommended' | 'suggested';
    subscriptionRequired: boolean;
    summary: string;
    tags: string[];
    bookDescription: string;
    authorDescription: string;
    duration?: number;
}

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;

    isSubscribed: boolean;
    subscriptionType?: 'basic' | 'premium' | 'premium-plus';
    subscriptionStatus?: 'active' | 'canceled' | 'past_due';
    stripeCustomerId?: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface ModalState {
    isOpen: boolean;
    modalType: 'login' | 'register' | 'forgotPassword' | null;
}