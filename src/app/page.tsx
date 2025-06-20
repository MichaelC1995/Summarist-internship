// src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { openModal } from '@/store/modalSlice';
import {
    IoMenu,
    IoClose,
    IoDocumentTextOutline,
    IoBulbOutline,
    IoHeadsetOutline,
    IoTrophyOutline,  // Changed from IoCrownOutline
    IoStarOutline,
    IoStarHalfOutline,
    IoStar,           // Changed from IoStarSharp
    IoLeafOutline
} from 'react-icons/io5';

export default function HomePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogin = () => {
        dispatch(openModal('login'));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="ml-2 text-2xl font-bold text-gray-800">Summarist</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button
                                onClick={handleLogin}
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Login
                            </button>
                            <Link href="#" className="text-gray-700 hover:text-gray-900">About</Link>
                            <Link href="#" className="text-gray-700 hover:text-gray-900">Contact</Link>
                            <Link href="#" className="text-gray-700 hover:text-gray-900">Help</Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2"
                        >
                            {isMobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <button
                                onClick={() => {
                                    handleLogin();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Login
                            </button>
                            <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                About
                            </Link>
                            <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                Contact
                            </Link>
                            <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                Help
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Landing Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Gain more knowledge <br className="hidden md:block" />
                                in less time
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8">
                                Great summaries for busy people,<br className="hidden md:block" />
                                individuals who barely have time to read,<br className="hidden md:block" />
                                and even people who don't like to read.
                            </p>
                            <button
                                onClick={handleLogin}
                                className="bg-green-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-600 transition-colors"
                            >
                                Login
                            </button>
                        </div>

                        <div className="relative h-[400px] md:h-[500px]">
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500"><img src={"./landing.png"}/></span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        Understand books in few minutes
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoDocumentTextOutline className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Read or listen</h3>
                            <p className="text-gray-600">
                                Save time by getting the core ideas from the best books.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoBulbOutline className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Find your next read</h3>
                            <p className="text-gray-600">
                                Explore book lists and personalized recommendations.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoHeadsetOutline className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">Briefcasts</h3>
                            <p className="text-gray-600">
                                Gain valuable insights from briefcasts
                            </p>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Left Column */}
                        <div>
                            <div className="space-y-6 flex-col">
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Enhance your knowledge</h3>
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Achieve greater success</h3>
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Improve your health</h3>
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Develop better parenting skills</h3>
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Increase happiness</h3>
                                <h3 className="text-3xl font-semibold text-left text-gray-700">Be the best version of yourself!</h3>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">93%</div>
                                <p className="text-gray-700">
                                    of Summarist members <strong>significantly increase</strong> reading frequency.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">96%</div>
                                <p className="text-gray-700">
                                    of Summarist members <strong>establish better</strong> habits.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">90%</div>
                                <p className="text-gray-700">
                                    have made <strong>significant positive</strong> change to their lives.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Second Statistics Row */}
                    <div className="grid md:grid-cols-2 gap-12 mt-12">
                        {/* Left Column */}
                        <div className="space-y-6 order-2 md:order-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">91%</div>
                                <p className="text-gray-700">
                                    of Summarist members <strong>report feeling more productive</strong> after
                                    incorporating the service into their daily routine.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">94%</div>
                                <p className="text-gray-700">
                                    of Summarist members have <strong>noticed an improvement</strong> in
                                    their overall comprehension and retention of information.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="text-4xl font-bold text-green-500 mb-2">88%</div>
                                <p className="text-gray-700">
                                    of Summarist members <strong>feel more informed</strong> about current
                                    events and industry trends since using the platform.
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="order-1 md:order-2 top-0 right-0">
                            <div className="space-y-6 flex-col items-center justify-center">
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Expand your learning</h3>
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Accomplish your goals</h3>
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Strengthen your vitality</h3>
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Become a better caregiver</h3>
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Improve your mood</h3>
                                <h3 className="text-3xl font-semibold text-right text-gray-700">Maximize your abilities</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        What our members say
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            {
                                name: "Hanna M.",
                                review: "This app has been a game-changer for me! It's saved me so much time and effort in reading and comprehending books. Highly recommend it to all book lovers."
                            },
                            {
                                name: "David B.",
                                review: "I love this app! It provides concise and accurate summaries of books in a way that is easy to understand. It's also very user-friendly and intuitive."
                            },
                            {
                                name: "Nathan S.",
                                review: "This app is a great way to get the main takeaways from a book without having to read the entire thing. The summaries are well-written and informative. Definitely worth downloading."
                            },
                            {
                                name: "Ryan R.",
                                review: "If you're a busy person who loves reading but doesn't have the time to read every book in full, this app is for you! The summaries are thorough and provide a great overview of the book's content."
                            }
                        ].map((review, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold">{review.name}</h4>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <IoStar key={i} size={16} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm">{review.review}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleLogin}
                            className="bg-green-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-600 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* Numbers Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                        Start growing with Summarist now
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoTrophyOutline className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">3 Million</h3>
                            <p className="text-gray-600">Downloads on all platforms</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="flex">
                                    <IoStar className="text-green-500" size={20} />
                                    <IoStar className="text-green-500" size={20} />
                                    <IoStar className="text-green-500" size={20} />
                                    <IoStar className="text-green-500" size={20} />
                                    <IoStarHalfOutline className="text-green-500" size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">4.5 Stars</h3>
                            <p className="text-gray-600">Average ratings on iOS and Google Play</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IoLeafOutline className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">97%</h3>
                            <p className="text-gray-600">Of Summarist members create a better reading habit</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold text-white mb-4">Actions</h3>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white">Summarist Magazine</Link></li>
                                <li><Link href="#" className="hover:text-white">Cancel Subscription</Link></li>
                                <li><Link href="#" className="hover:text-white">Help</Link></li>
                                <li><Link href="#" className="hover:text-white">Contact us</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">Useful Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-white">Summarist Business</Link></li>
                                <li><Link href="#" className="hover:text-white">Gift Cards</Link></li>
                                <li><Link href="#" className="hover:text-white">Authors & Publishers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white">About</Link></li>
                                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                                <li><Link href="#" className="hover:text-white">Partners</Link></li>
                                <li><Link href="#" className="hover:text-white">Code of Conduct</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">Other</h3>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white">Sitemap</Link></li>
                                <li><Link href="#" className="hover:text-white">Legal Notice</Link></li>
                                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-white">Privacy Policies</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8 text-center">
                        <p>&copy; 2023 Summarist.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}