'use client';

export default function BookSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="flex gap-3">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
        </div>
    );
}