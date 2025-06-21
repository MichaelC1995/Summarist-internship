'use client';

import { useState, useEffect } from 'react';
import { bookAPI } from '@/lib/api';
import { Book } from '@/types';

export const useBookById = (id: string) => {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await bookAPI.getBookById(id);
                setBook(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch book');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    return { book, loading, error };
};