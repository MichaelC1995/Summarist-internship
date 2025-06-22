'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import {
    IoCheckmarkCircle,
    IoDocumentTextOutline,
    IoPhonePortraitOutline,
    IoFileTrayFullOutline,
    IoRibbonOutline
} from 'react-icons/io5';
import { AiOutlineFile } from 'react-icons/ai';

// Initialize Stripe - you'll need to add your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ChoosePlanPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if user is already subscribed
    // useEffect(() => {
    //     if (user?.subscriptionType !== 'basic') {
    //         router.push('/for-you');
    //     }
    // }, [user, router]);

    const handleCheckout = async () => {
        if (!user) {
            router.push('/');
            return;
        }

        setIsLoading(true);

        try {
            // Create checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    priceId: selectedPlan === 'monthly'
                        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
                        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
                    plan: selectedPlan,
                }),
            });

            const { sessionId } = await response.json();

            // Redirect to Stripe checkout
            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) {
                    console.error('Stripe checkout error:', error);
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: <IoDocumentTextOutline size={48} />,
            title: 'Key ideas in few min with many books',
            description: 'Save time by reading or listening to the key ideas from the best books.',
        },
        {
            icon: <IoPhonePortraitOutline size={48} />,
            title: '3 million people growing with Summarist everyday',
            description: 'Join the community of readers who are leveling up their knowledge daily.',
        },
        {
            icon: <IoFileTrayFullOutline size={48} />,
            title: 'Precise recommendations collections curated by experts',
            description: 'Discover books recommended by industry leaders and experts.',
        },
    ];

    const accordionItems = [
        {
            question: 'How does the free 7-day trial work?',
            answer: 'Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be charged when the trial period expires. With unlimited access to key ideas from world-class books, you can start exploring the best ideas immediately.',
        },
        {
            question: 'Can I switch subscriptions from monthly to yearly, or yearly to monthly?',
            answer: 'Yes, you can switch between monthly and yearly subscriptions at any time. Your new subscription will take effect at the end of your current billing period.',
        },
        {
            question: 'What\'s included in the full membership?',
            answer: 'Full membership includes unlimited access to all book summaries, both text and audio formats, personalized recommendations, and the ability to save books to your library.',
        },
        {
            question: 'Can I cancel anytime?',
            answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold text-center text-gray-900">
                        Get unlimited access to many amazing books to read
                    </h1>
                    <p className="text-xl text-center text-gray-600 mt-4">
                        Turn ordinary moments into amazing learning opportunities
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <div className="flex justify-center mb-4 text-gray-700">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
                    {/* Yearly Plan */}
                    <div
                        className={`border-4 rounded-lg p-6 cursor-pointer transition-all ${
                            selectedPlan === 'yearly'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPlan('yearly')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold">Premium Plus Yearly</h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">$99.99</span>
                                    <span className="text-gray-600">/year</span>
                                </div>
                                <p className="text-green-600 font-semibold mt-1">
                                    7-day free trial included
                                </p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${
                                selectedPlan === 'yearly'
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-400'
                            }`}>
                                {selectedPlan === 'yearly' && (
                                    <IoCheckmarkCircle className="text-white w-full h-full" />
                                )}
                            </div>
                        </div>
                        {selectedPlan === 'yearly' && (
                            <div className="bg-green-500 text-white text-center py-1 px-3 rounded-full text-sm font-semibold">
                                BEST VALUE
                            </div>
                        )}
                    </div>

                    {/* Monthly Plan */}
                    <div
                        className={`border-4 rounded-lg p-6 cursor-pointer transition-all ${
                            selectedPlan === 'monthly'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPlan('monthly')}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">Premium Monthly</h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">$9.99</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <p className="text-gray-600 mt-1">No trial included</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 ${
                                selectedPlan === 'monthly'
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-400'
                            }`}>
                                {selectedPlan === 'monthly' && (
                                    <IoCheckmarkCircle className="text-white w-full h-full" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button and Benefits */}
                <div className="text-center mb-12">
                    <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="bg-green-500 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 mb-8"
                    >
                        {isLoading ? 'Processing...' :
                            selectedPlan === 'yearly'
                                ? 'Start your free 7-day trial'
                                : 'Start your first month'
                        }
                    </button>

                    <p className="text-gray-600 text-sm mb-8">
                        {selectedPlan === 'yearly'
                            ? 'Cancel your trial at any time before it ends, and you won\'t be charged.'
                            : '30-day money back guarantee, no questions asked.'
                        }
                    </p>

                    {/* What's Included */}
                    <div className="bg-gray-50 rounded-lg p-8 max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold mb-6">What\'s included in your subscription</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            {[
                                'Unlimited access to all book summaries',
                                'Audio versions of all summaries',
                                'Offline access to summaries',
                                'Personalized recommendations',
                                'Highlighting & note-taking features',
                                'Priority customer support',
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <IoCheckmarkCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                                    <span className="text-gray-700">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {accordionItems.map((item, index) => (
                            <AccordionItem
                                key={index}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Accordion Component
function AccordionItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900">{question}</span>
                <span className="text-2xl text-gray-600">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <div className="px-6 pb-4">
                    <p className="text-gray-600">{answer}</p>
                </div>
            )}
        </div>
    );
}