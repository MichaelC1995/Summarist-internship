'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { bookAPI } from '@/lib/api';
import { Book } from '@/types';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import Image from 'next/image';

export default function SearchBar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const search = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const books = await bookAPI.searchBooks(debouncedQuery);
                setResults(books);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBookClick = (bookId: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(`/book/${bookId}`);
    };

    const SearchResult = ({ book }: { book: Book }) => (
        <button
            onClick={() => handleBookClick(book.id)}
            className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
        >
            <div className="relative w-12 h-16 flex-shrink-0">
                <Image
                    src={book.imageLink}
                    alt={book.title}
                    fill
                    className="object-cover rounded"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                <p className="text-sm text-gray-600 truncate">{book.author}</p>
                {book.subscriptionRequired && (
                    <span className="text-xs text-yellow-600 font-medium">Premium</span>
                )}
            </div>
        </button>
    );

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
            <div className="max-w-3xl mx-auto" ref={searchRef}>
                <div className="relative">
                    <div className="relative">
                        <IoSearchOutline
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Search for books"
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    inputRef.current?.focus();
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <IoCloseOutline size={20} />
                            </button>
                        )}
                    </div>

                    {isOpen && query && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 py-2 text-sm text-gray-500 font-medium border-b border-gray-100">
                                        {results.length} result{results.length !== 1 ? 's' : ''} found
                                    </div>
                                    {results.map((book) => (
                                        <SearchResult key={book.id} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    No books found for "{query}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}