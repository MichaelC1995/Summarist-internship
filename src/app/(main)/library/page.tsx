'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { bookAPI } from '@/lib/api';
import { Book } from '@/types';
import BookCard from '@/components/books/BookCard';
import { IoBookOutline, IoCheckmarkCircle } from 'react-icons/io5';

export default function LibraryPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [savedBooks, setSavedBooks] = useState<Book[]>([]);
    const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'saved' | 'finished'>('saved');

    useEffect(() => {
        // Wait for auth to complete
        if (authLoading) return;

        // Redirect if no user
        if (!user) {
            router.push('/');
            return;
        }

        setLoading(true);

        const libraryRef = collection(db, 'users', user.uid, 'library');
        const q = query(libraryRef);

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                console.log('Library snapshot received:', snapshot.size, 'documents');

                if (snapshot.empty) {
                    console.log('No books in library');
                    setSavedBooks([]);
                    setFinishedBooks([]);
                    setLoading(false);
                    return;
                }

                const libraryData: { bookId: string; finished: boolean }[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log('Library doc:', doc.id, data);
                    libraryData.push({
                        bookId: data.bookId || doc.id, // Handle both bookId field and doc ID
                        finished: data.finished || false
                    });
                });

                const savedBooksPromises: Promise<Book>[] = [];
                const finishedBooksPromises: Promise<Book>[] = [];

                for (const item of libraryData) {
                    try {
                        const bookPromise = bookAPI.getBookById(item.bookId);
                        if (item.finished) {
                            finishedBooksPromises.push(bookPromise);
                        } else {
                            savedBooksPromises.push(bookPromise);
                        }
                    } catch (error) {
                        console.error('Error creating book promise for:', item.bookId, error);
                    }
                }

                try {
                    const [saved, finished] = await Promise.all([
                        Promise.all(savedBooksPromises),
                        Promise.all(finishedBooksPromises),
                    ]);

                    console.log('Fetched saved books:', saved.length);
                    console.log('Fetched finished books:', finished.length);

                    setSavedBooks(saved.filter(book => book !== null));
                    setFinishedBooks(finished.filter(book => book !== null));
                } catch (error) {
                    console.error('Error fetching book details:', error);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error listening to library:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, router, authLoading]);

    // Show loading while auth is checking
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const EmptyState = ({ type }: { type: 'saved' | 'finished' }) => (
        <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {type === 'saved' ? (
                    <IoBookOutline size={48} className="text-gray-400" />
                ) : (
                    <IoCheckmarkCircle size={48} className="text-gray-400" />
                )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {type === 'saved' ? 'No saved books yet' : 'No finished books yet'}
            </h3>
            <p className="text-gray-600 mb-6">
                {type === 'saved'
                    ? 'When you save a book, it will appear here'
                    : 'Books you finish will be moved here'}
            </p>
            <button
                onClick={() => router.push('/for-you')}
                className="text-green-500 hover:text-green-600 font-medium"
            >
                Browse Books →
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Library</h1>

            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'saved'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Saved Books ({savedBooks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('finished')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'finished'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Finished ({finishedBooks.length})
                    </button>
                </nav>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                            <div className="h-4 bg-gray-200 rounded mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {activeTab === 'saved' && (
                        savedBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {savedBooks.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="saved" />
                        )
                    )}

                    {activeTab === 'finished' && (
                        finishedBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {finishedBooks.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState type="finished" />
                        )
                    )}
                </>
            )}
        </div>
    );
}