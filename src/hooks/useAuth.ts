'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { setUser, setLoading } from '@/store/authSlice';
import { User } from '@/types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    let userData: User;

                    if (userDoc.exists()) {
                        userData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            ...userDoc.data(),
                        } as User;
                    } else {
                        userData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            isSubscribed: false,
                            subscriptionType: 'basic',
                        };
                        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                    }

                    dispatch(setUser(userData));
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    dispatch(setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        isSubscribed: false,
                    } as User));
                }
            } else {
                dispatch(setUser(null));
            }
            dispatch(setLoading(false));
        });
        return () => unsubscribe();
    }, [dispatch]);

    return { user, loading, error };
};