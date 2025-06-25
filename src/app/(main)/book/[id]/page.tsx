'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { bookAPI, formatDuration } from '@/lib/api';
import { Book } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { openModal } from '@/store/modalSlice';
import { setIntendedDestination } from '@/store/authSlice';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    IoStar,
    IoBookOutline,
    IoBookmark,
    IoMicOutline,
    IoTimeOutline,
    IoBulbOutline,
} from 'react-icons/io5';

const verifyUserSubscription = async (userId: string): Promise<'basic' | 'premium' | 'premium-plus'> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        return userData?.subscriptionType || 'basic';
    } catch (error) {
        console.error('Error verifying subscription:', error);
        return 'basic';
    }
};

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
    const [audioDuration, setAudioDuration] = useState<number | null>(null);
    const [loadingDuration, setLoadingDuration] = useState(false);

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
        if (book?.audioLink && !book?.duration) {
            setLoadingDuration(true);
            const audio = new Audio();

            const handleLoadedMetadata = () => {
                setAudioDuration(audio.duration);
                setLoadingDuration(false);
            };

            const handleError = () => {
                console.error('Failed to load audio duration for:', book.title);
                setLoadingDuration(false);
            };

            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            audio.addEventListener('error', handleError);

            audio.src = book.audioLink;

            return () => {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('error', handleError);
                audio.src = '';
            };
        }
    }, [book?.audioLink, book?.duration, book?.title]);

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

    const handleReadClick = async () => {
        if (!user) {
            dispatch(setIntendedDestination(`/player/${book?.id}`));
            dispatch(openModal('login'));
            return;
        }

        if (book?.subscriptionRequired) {
            try {
                const currentSubscriptionType = await verifyUserSubscription(user.uid);

                if (currentSubscriptionType === 'basic') {
                    router.push('/choose-plan');
                    return;
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
                router.push('/choose-plan');
                return;
            }
        }

        router.push(`/player/${book?.id}`);
    };

    const handleSaveToLibrary = async () => {
        if (!user) {
            dispatch(setIntendedDestination(`/book/${book?.id}`));
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

    const duration = book?.duration || audioDuration || 0;

    if (loading) {
        return (
            <div className="py-10 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/5">
                        <div className="animate-pulse">
                            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-full mb-8"></div>
                            <div className="flex gap-8 mb-8">
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                                <div className="h-5 bg-gray-200 rounded w-20"></div>
                                <div className="h-5 bg-gray-200 rounded w-28"></div>
                            </div>
                            <div className="flex gap-4 mb-8">
                                <div className="h-12 bg-gray-200 rounded w-32"></div>
                                <div className="h-12 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-2/5">
                        <div className="h-[400px] bg-gray-200 rounded"></div>
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
                    className="text-blue-600 hover:text-blue-700"
                >
                    Go back to For You
                </button>
            </div>
        );
    }

    return (
        <div className="py-10 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-3/5">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {book.title || 'Untitled Book'}
                    </h1>
                    <p className="text-lg text-gray-700 font-medium mb-2">
                        {book.author || 'Unknown Author'}
                    </p>
                    {book.subTitle && (
                        <p className="text-xl text-gray-600 mb-6">{book.subTitle}</p>
                    )}

                    <div className="border-y border-gray-300 py-4 mb-8">
                        <div className="grid grid-cols-2 gap-y-3 text-gray-700">
                            {book.averageRating !== undefined && (
                                <div className="flex items-center gap-1">
                                    <IoStar className="text-yellow-400" size={18} />
                                    <span className="font-medium">{book.averageRating.toFixed(1)}</span>
                                    {book.totalRating !== undefined && (
                                        <span className="text-gray-500">
                                            ({book.totalRating.toLocaleString()} ratings)
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <IoTimeOutline size={18} />
                                {loadingDuration ? (
                                    <span className="animate-pulse">--:--</span>
                                ) : (
                                    <span>{formatDuration(duration)}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <IoMicOutline size={18} />
                                <span>Audio & Text</span>
                            </div>

                            {book.keyIdeas !== undefined && (
                                <div className="flex items-center gap-2">
                                    <IoBulbOutline size={18} />
                                    <span>{book.keyIdeas} Key ideas</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleReadClick}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            <IoBookOutline size={20} />
                            Read
                        </button>

                        <button
                            onClick={handleReadClick}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            <IoMicOutline size={20} />
                            Listen
                        </button>
                    </div>

                    <button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-10 disabled:opacity-50 cursor-pointer"
                    >
                        <IoBookmark size={18} />
                        <span className="font-medium">
                            {isSaved ? 'Saved to My Library' : 'Add title to My Library'}
                        </span>
                    </button>

                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            What&apos;s it about?
                        </h2>

                        {book.tags && book.tags.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-6">
                                {book.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {book.bookDescription && (
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {book.bookDescription}
                            </p>
                        )}
                    </div>

                    {book.authorDescription && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                About the author
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {book.authorDescription}
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:w-1/4">
                    <div className="sticky top-8 ">
                        <div className="relative aspect-[3/4] max-w-md mx-auto bg-gray-100 shadow-lg">
                            {book.imageLink && book.imageLink.trim() !== '' ? (
                                <Image
                                    src={book.imageLink}
                                    alt={book.title || 'Book cover'}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                    <IoBookOutline size={64} className="text-gray-400" />
                                </div>
                            )}
                            {book.subscriptionRequired && (
                                <span className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 m-2 rounded">
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}