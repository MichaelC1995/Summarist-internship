'use client';

import { useParams } from 'next/navigation';
import { useBookById } from '@/hooks/useBookById';
import AudioPlayer from '@/components/player/AudioPlayer';

export default function PlayerPage() {
    const params = useParams();
    const { book, loading, error } = useBookById(params.id as string);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Book not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {book.summary}
                    </p>
                </div>
            </div>
            <AudioPlayer book={book} />
        </div>
    );
}