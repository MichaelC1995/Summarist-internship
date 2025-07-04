'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/types';
import { IoStar, IoTimeOutline, IoBookOutline } from 'react-icons/io5';
import { formatDuration } from '@/lib/api';

interface BookCardProps {
    book: Book;
    className?: string;
}

export default function BookCard({ book, className = '' }: BookCardProps) {
    const [audioDuration, setAudioDuration] = useState<number | null>(null);
    const [loadingDuration, setLoadingDuration] = useState(false);

    useEffect(() => {
        if (book.audioLink && !book.duration) {
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
    }, [book.audioLink, book.duration, book.title]);

    const duration = book.duration || audioDuration || 0;

    return (
        <Link
            href={`/book/${book.id}`}
            className={`block group ${className}`}
        >
            <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-gray-100">
                {book.imageLink && book.imageLink.trim() !== '' ? (
                    <Image
                        src={book.imageLink}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <IoBookOutline size={48} className="text-gray-400" />
                    </div>
                )}

                {book.subscriptionRequired && (
                    <span className="absolute top-0 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                        Premium
                    </span>
                )}
            </div>

            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                {book.title}
            </h3>

            <p className="text-sm text-gray-600 mb-2">{book.author}</p>

            <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <IoTimeOutline size={16} />
                    {loadingDuration ? (
                        <span className="text-xs">Loading...</span>
                    ) : (
                        <span>{formatDuration(duration)}</span>
                    )}
                </div>

                {book.averageRating !== undefined && (
                    <div className="flex items-center gap-1">
                        <IoStar className="text-yellow-400" size={16} />
                        <span>{book.averageRating.toFixed(1)}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}