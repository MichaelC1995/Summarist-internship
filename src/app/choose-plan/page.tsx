'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import {
    IoChevronUpOutline,
    IoChevronDownOutline, IoDocumentText,
} from 'react-icons/io5';
import { RiPlantFill } from 'react-icons/ri';
import { FaHandshake } from 'react-icons/fa';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ChoosePlanPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [isLoading, setIsLoading] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);

    const handleCheckout = async () => {
        if (!user) {
            router.push('/');
            return;
        }

        setIsLoading(true);

        try {
            const priceId = selectedPlan === 'monthly'
                ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
                : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

            if (!priceId) {
                throw new Error(`Price ID not found for ${selectedPlan} plan`);
            }

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.uid,
                    priceId,
                    plan: selectedPlan,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const data = await response.json();

            if (!data.sessionId) {
                throw new Error('Failed to get session ID');
            }

            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({
                    sessionId: data.sessionId
                });
                if (error) {
                    console.error('Stripe checkout error:', error);
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error creating checkout session. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const accordionItems = [
        {
            question: 'How does the free 7-day trial work?',
            answer: 'Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.',
        },
        {
            question: 'Can I switch subscriptions from monthly to yearly, or yearly to monthly?',
            answer: 'While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.',
        },
        {
            question: 'What\'s included in the Premium plan?',
            answer: 'Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.',
        },
        {
            question: 'Can I cancel during my trial or subscription?',
            answer: 'You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="relative bg-slate-800 text-white rounded-b-[200px]">
                <div className="relative max-w-6xl mx-auto px-6 pt-16 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
                        Get unlimited access to many amazing books to read
                    </h1>
                    <p className="text-xl mb-16 opacity-90">
                        Turn ordinary moments into amazing learning opportunities
                    </p>

                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="bg-white overflow-hidden" style={{
                                width: '350px',
                                height: '280px',
                                borderRadius: '160px 160px 0px 0px'
                            }}>
                                <div className="flex items-center justify-center w-full h-full pt-8">
                                    <Image
                                        src="/pricing-top.png"
                                        alt="Books illustration"
                                        width={400}
                                        height={400}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-3 gap-12 text-center mb-20">
                    <div>
                        <div className="flex justify-center mb-6">
                            <IoDocumentText size={52} className="text-slate-600"/>
                        </div>
                        <h3 className="text-lg text-slate-700 leading-relaxed">
                            <span className="font-semibold">Key ideas in few min</span> with many books to read
                        </h3>
                    </div>
                    <div>
                        <div className="flex justify-center mb-6">
                            <RiPlantFill size={52} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg text-slate-700 leading-relaxed">
                            <span className="font-semibold">3 million</span> people growing with Summarist everyday
                        </h3>
                    </div>
                    <div>
                        <div className="flex justify-center mb-6">
                            <FaHandshake size={52} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg text-slate-700 leading-relaxed">
                            <span className="font-semibold">Precise recommendations</span> collections curated by experts
                        </h3>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-800 mb-12">
                        Choose the plan that fits you
                    </h2>

                    <div className="max-w-lg mx-auto space-y-4 mb-8">
                        <div
                            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                selectedPlan === 'yearly'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                            onClick={() => setSelectedPlan('yearly')}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'yearly'
                                        ? 'border-green-500'
                                        : 'border-gray-400'
                                }`}>
                                    {selectedPlan === 'yearly' && (
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    )}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">Premium Plus Yearly</h3>
                                    <p className="font-bold text-slate-800 text-xl">$99.99/year</p>
                                    <p className="text-green-600 text-sm">7-day free trial included</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-400 font-medium py-2">or</div>

                        <div
                            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                selectedPlan === 'monthly'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-50'
                            }`}
                            onClick={() => setSelectedPlan('monthly')}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedPlan === 'monthly'
                                        ? 'border-green-500'
                                        : 'border-gray-400'
                                }`}>
                                    {selectedPlan === 'monthly' && (
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    )}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">Premium Monthly</h3>
                                    <p className="font-bold text-slate-800 text-xl">$9.99/month</p>
                                    <p className="text-gray-600 text-sm">No trial included</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="bg-green-500 text-white px-12 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 mb-4"
                    >
                        {isLoading ? 'Processing...' : 'Start your free 7-day trial'}
                    </button>

                    <p className="text-gray-600 text-sm">
                        Cancel your trial at any time before it ends, and you won't be charged.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="space-y-1 mb-20">
                        {accordionItems.map((item, index) => (
                            <div key={index} className="border-b border-gray-200">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                                    className="w-full py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors px-4"
                                >
                                    <span className="font-semibold text-slate-800 text-lg pr-4">
                                        {item.question}
                                    </span>
                                    <div className="transition-transform duration-300 ease-in-out">
                                        {openAccordion === index ? (
                                            <IoChevronUpOutline className="text-gray-600 flex-shrink-0" size={24} />
                                        ) : (
                                            <IoChevronDownOutline className="text-gray-600 flex-shrink-0" size={24} />
                                        )}
                                    </div>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        openAccordion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="pb-6 px-4">
                                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="bg-gray-50 border-t">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Summarist Magazine</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Cancel Subscription</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Help</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Contact us</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Useful Links</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Pricing</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Summarist Business</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Gift Cards</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Authors & Publishers</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">About</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Careers</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Partners</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Code of Conduct</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Other</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Sitemap</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Legal Notice</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-gray-800 cursor-not-allowed">Privacy Policies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t border-gray-200">
                        <p className="text-gray-600">Copyright © 2023 Summarist.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}