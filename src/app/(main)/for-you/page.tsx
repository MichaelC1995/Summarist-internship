'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {bookAPI, formatDuration} from '@/lib/api';
import { Book } from '@/types';
import BookCard from '@/components/books/BookCard';
import BookSkeleton from '@/components/books/BookSkeleton';
import Image from 'next/image';
import Link from 'next/link';
import { IoBookOutline } from 'react-icons/io5';

export default function ForYouPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const [selected, recommended, suggested] = await Promise.all([
                    bookAPI.getSelectedBook(),
                    bookAPI.getRecommendedBooks(),
                    bookAPI.getSuggestedBooks(),
                ]);

                setSelectedBook(selected);
                setRecommendedBooks(recommended);
                setSuggestedBooks(suggested);
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBooks();
        }
    }, [user]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const SelectedBookSection = () => {
        if (loading) {
            return (
                <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
            );
        }

        if (!selectedBook) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No selected book available
                </div>
            );
        }

        return (
            <Link
                href={`/book/${selectedBook.id}`}
                className="flex gap-6 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
                <div className="relative w-32 h-40 flex-shrink-0 bg-gray-200 rounded-lg">
                    {selectedBook.imageLink && selectedBook.imageLink.trim() !== '' ? (
                        <Image
                            src={selectedBook.imageLink}
                            alt={selectedBook.title}
                            fill
                            className="object-cover rounded-lg"
                            sizes="128px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <IoBookOutline size={48} className="text-gray-400" />
                        </div>
                    )}
                    {selectedBook.subscriptionRequired && (
                        <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
            Premium
          </span>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {selectedBook.title || 'Untitled Book'}
                    </h3>
                    <p className="text-gray-600 mb-3">{selectedBook.author || 'Unknown Author'}</p>
                    <p className="text-gray-700 line-clamp-3">
                        {selectedBook.subTitle || 'No description available'}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{formatDuration(selectedBook.duration || 0)}</span>
                        {selectedBook.averageRating !== undefined && (
                            <span>{selectedBook.averageRating.toFixed(1)} ⭐</span>
                        )}
                        {selectedBook.totalRating !== undefined && (
                            <span>{selectedBook.totalRating.toLocaleString()} ratings</span>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Selected just for you
                </h2>
                <SelectedBookSection />
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Recommended For You
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <BookSkeleton key={index} />
                        ))
                    ) : (
                        recommendedBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Suggested Books
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <BookSkeleton key={index} />
                        ))
                    ) : (
                        suggestedBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}