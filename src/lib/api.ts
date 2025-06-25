import axios from 'axios';
import { Book } from '@/types';

const BASE_URL = 'https://us-central1-summaristt.cloudfunctions.net';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

 apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject({
            message: error.response?.data?.message || 'Something went wrong',
            status: error.response?.status || 500,
        });
    }
);

export const bookAPI = {
    getSelectedBook: async (): Promise<Book> => {
        try {
            const response = await apiClient.get('/getBooks?status=selected');
            console.log('Raw selected book response:', response.data);

            if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0];
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching selected book:', error);
            throw error;
        }
    },

    getRecommendedBooks: async (): Promise<Book[]> => {
        const response = await apiClient.get('/getBooks?status=recommended');
        return response.data;
    },

    getSuggestedBooks: async (): Promise<Book[]> => {
        const response = await apiClient.get('/getBooks?status=suggested');
        return response.data;
    },

    getBookById: async (id: string): Promise<Book> => {
        const response = await apiClient.get(`/getBook?id=${id}`);
        return response.data;
    },

    searchBooks: async (query: string): Promise<Book[]> => {
        if (!query.trim()) return [];
        const response = await apiClient.get(
            `/getBooksByAuthorOrTitle?search=${encodeURIComponent(query)}`
        );
        return response.data;
    },
};


export function formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}