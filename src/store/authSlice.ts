import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    intendedDestination: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    error: null,
    intendedDestination: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        setIntendedDestination: (state, action: PayloadAction<string | null>) => {
            state.intendedDestination = action.payload;
        },
        clearIntendedDestination: (state) => {
            state.intendedDestination = null;
        },
        logout: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.intendedDestination = null;
        },
    },
});

export const {
    setUser,
    setLoading,
    setError,
    setIntendedDestination,
    clearIntendedDestination,
    logout
} = authSlice.actions;

export default authSlice.reducer;