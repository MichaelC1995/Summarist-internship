import {configureStore} from "@reduxjs/toolkit";
import authReducer from './authSlice';
import modalReducer from './modalSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        modal: modalReducer,
    },

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['auth/setUser'],
            ignoredPaths: ['auth.user']
        }
    })
});

export type RootState = ReturnType<typeof store.dispatch>;
export type AppDispatch = typeof store.dispatch;