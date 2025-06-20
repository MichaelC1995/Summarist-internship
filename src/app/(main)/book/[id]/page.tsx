'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { bookAPI, formatDuration } from '@/lib/api';
import { Book } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { openModal } from '@/store/modalSlice';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    IoStar,
    IoTimeOutline,
    IoBookOutline,
    IoBulbOutline,
    IoBookmarkOutline,
    IoBookmark,
    IoHeadset
} from 'react-icons/io5';

export default function BookDetailsPage() {
    const params = useParams();
    const bookId = params.id as string;

    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const bookData = await bookAPI.getBookById(bookId);
                setBook(bookData);
            } catch (error) {
                console.error('Error fetching book:', error);
            } finally {
                setLoading(false);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId]);

    useEffect(() => {
        const checkIfSaved = async () => {
            if (!user || !book) return;

            try {
                const docRef = doc(db, 'users', user.uid, 'library', book.id);
                const docSnap = await getDoc(docRef);
                setIsSaved(docSnap.exists());
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        };

        checkIfSaved();
    }, [user, book]);

    const handleReadClick = () => {
        if (!user) {
            dispatch(openModal('login'));
            return;
        }

        if (book?.subscriptionRequired && user.subscriptionType === 'basic') {
            router.push('/choose-plan');
            return;
        }

        router.push(`/player/${book?.id}`);
    };

    const handleSaveToLibrary = async () => {
        if (!user) {
            dispatch(openModal('login'));
            return;
        }

        if (!book || isSaving) return;

        setIsSaving(true);
        try {
            const libraryRef = doc(db, 'users', user.uid, 'library', book.id);

            if (isSaved) {
                await deleteDoc(libraryRef);
                setIsSaved(false);
            } else {
                await setDoc(libraryRef, {
                    bookId: book.id,
                    userId: user.uid,
                    addedAt: new Date(),
                    finished: false,
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error updating library:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 h-80 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="flex gap-4">
                                <div className="h-10 bg-gray-200 rounded w-32"></div>
                                <div className="h-10 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <p className="text-gray-500 mb-4">Book not found</p>
                <button
                    onClick={() => router.push('/for-you')}
                    className="text-green-500 hover:text-green-600"
                >
                    Go back to For You
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Book Header Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {/* Book Cover */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                        {book.imageLink && book.imageLink.trim() !== '' ? (
                            <Image
                                src={book.imageLink}
                                alt={book.title || 'Book cover'}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 256px"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <IoBookOutline size={64} className="text-gray-400" />
                            </div>
                        )}
                        {book.subscriptionRequired && (
                            <span className="absolute top-4 right-4 bg-black text-white text-sm px-3 py-1 rounded">
                Premium
              </span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {book.title || 'Untitled Book'}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">{book.author || 'Unknown Author'}</p>
                    {book.subTitle && (
                        <p className="text-lg text-gray-700 mb-6">{book.subTitle}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                        {book.averageRating !== undefined && (
                            <div className="flex items-center gap-2">
                                <IoStar className="text-yellow-400" size={20} />
                                <span className="font-medium">{book.averageRating.toFixed(1)}</span>
                                {book.totalRating !== undefined && (
                                    <span className="text-gray-500">
                    ({book.totalRating.toLocaleString()} ratings)
                  </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                            <IoTimeOutline size={20} />
                            <span>{formatDuration(book.duration || 0)}</span>
                        </div>

                        {book.type && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <IoBookOutline size={20} />
                                <span>{book.type}</span>
                            </div>
                        )}

                        {book.keyIdeas !== undefined && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <IoBulbOutline size={20} />
                                <span>{book.keyIdeas} Key ideas</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <button
                            onClick={handleReadClick}
                            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
                        >
                            <IoBookOutline size={20} />
                            Read
                        </button>

                        <button
                            onClick={handleReadClick}
                            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
                        >
                            <IoHeadset size={20} />
                            Listen
                        </button>
                    </div>

                    <button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSaved ? (
                            <>
                                <IoBookmark size={20} />
                                <span>Saved to Library</span>
                            </>
                        ) : (
                            <>
                                <IoBookmarkOutline size={20} />
                                <span>Add to My Library</span>
                            </>
                        )}
                    </button>

                    {book.tags && book.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            {book.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                  {tag}
                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {book.bookDescription && (
                    <section className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            What's it about?
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {book.bookDescription}
                        </p>
                    </section>
                )}

                {book.authorDescription && (
                    <section className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            About the author
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {book.authorDescription}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}