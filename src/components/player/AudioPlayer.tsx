'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    IoPlayCircle,
    IoPauseCircle,
    IoPlaySkipBackCircle,
    IoPlaySkipForwardCircle,
    IoCheckmarkCircle,
    IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import Image from 'next/image';

interface AudioPlayerProps {
    book: Book;
}

export default function AudioPlayer({ book }: AudioPlayerProps) {
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(book.duration || 0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressWrapperRef = useRef<HTMLDivElement>(null);

    // Check if book is already marked as finished on mount
    useEffect(() => {
        const checkFinishedStatus = async () => {
            if (!user) return;

            try {
                const libraryRef = doc(db, 'users', user.uid, 'library', book.id);
                const docSnap = await getDoc(libraryRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setIsFinished(data.finished || false);
                }
            } catch (error) {
                console.error('Error checking finished status:', error);
            }
        };

        checkFinishedStatus();
    }, [user, book.id]);

    // Toggle book finished status
    const toggleBookFinished = async () => {
        if (!user || isUpdating) return;

        setIsUpdating(true);
        try {
            const libraryRef = doc(db, 'users', user.uid, 'library', book.id);
            const docSnap = await getDoc(libraryRef);

            if (docSnap.exists()) {
                const newFinishedStatus = !isFinished;

                await updateDoc(libraryRef, {
                    finished: newFinishedStatus,
                    ...(newFinishedStatus ? { finishedAt: new Date() } : { finishedAt: null })
                });

                setIsFinished(newFinishedStatus);
                console.log(`Book ${newFinishedStatus ? 'marked as finished' : 'marked as unfinished'}:`, book.title);
            } else {
                console.warn('Book not found in library. Make sure to save it first.');
            }
        } catch (error) {
            console.error('Error updating book status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Mark book as finished when audio ends
    const markBookAsFinished = async () => {
        if (!user || isFinished) return;

        try {
            const libraryRef = doc(db, 'users', user.uid, 'library', book.id);
            const docSnap = await getDoc(libraryRef);

            if (docSnap.exists()) {
                await updateDoc(libraryRef, {
                    finished: true,
                    finishedAt: new Date()
                });

                setIsFinished(true);
                console.log('Book automatically marked as finished:', book.title);
            }
        } catch (error) {
            console.error('Error marking book as finished:', error);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration || book.duration || 0);
            setCurrentTime(audio.currentTime);
            setIsLoading(false);
        };

        const setAudioTime = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleAudioEnded = () => {
            setIsPlaying(false);
            markBookAsFinished();
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleAudioEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleAudioEnded);
        };
    }, [book.duration, isDragging]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch((err) => console.error('Playback error:', err));
        }
        setIsPlaying(!isPlaying);
    };

    const skipBackward = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    };

    const skipForward = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.min(duration, audio.currentTime + 10);
    };

    const updateProgress = useCallback(
        (clientX: number) => {
            const audio = audioRef.current;
            const progressBar = progressBarRef.current;
            if (!audio || !progressBar) return;

            const rect = progressBar.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = x / rect.width;
            const newTime = percentage * duration;

            audio.currentTime = newTime;
            setCurrentTime(newTime);
        },
        [duration, setCurrentTime]
    );

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        updateProgress(e.clientX);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        updateProgress(e.clientX);
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                updateProgress(e.clientX);
            }
        },
        [isDragging, updateProgress]
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#042330] shadow-2xl border-t border-gray-200 z-50 py-3 px-4">
            <div className="flex justify-around items-center mx-0 w-full">
                <audio ref={audioRef} src={book.audioLink} preload="metadata" />

                <div className="flex items-center gap-3">
                    {book.imageLink && (
                        <Image
                            width={100}
                            height={100}
                            src={book.imageLink}
                            alt={book.title}
                            className="w-12 h-12 object-cover rounded-md"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{book.title}</h3>
                        <p className="text-xs text-white truncate">{book.author}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={skipBackward}
                        className="text-white transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                        aria-label="Skip backward 10 seconds"
                    >
                        <IoPlaySkipBackCircle size={35} />
                    </button>
                    <button
                        onClick={togglePlayPause}
                        className="text-white transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <IoPauseCircle size={50} /> : <IoPlayCircle size={50} />}
                    </button>
                    <button
                        onClick={skipForward}
                        className="text-white transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                        aria-label="Skip forward 10 seconds"
                    >
                        <IoPlaySkipForwardCircle size={35} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-white min-w-[40px]">{formatTime(currentTime)}</span>
                    <div ref={progressWrapperRef} className="relative w-32">
                        <div
                            ref={progressBarRef}
                            className="relative h-1 bg-gray-300 rounded-full cursor-pointer overflow-hidden"
                            onClick={handleProgressClick}
                            onMouseDown={handleMouseDown}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-150"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div
                            className="absolute top-1/2 h-3 w-3 bg-white pointer-events-none rounded-full shadow-sm border border-gray-200"
                            style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
                        />
                    </div>
                    <span className="text-xs text-white min-w-[40px]">{formatTime(duration)}</span>
                </div>

                {/* Manual finish button */}
                <button
                    onClick={toggleBookFinished}
                    disabled={isUpdating || !user}
                    className={`ml-4 transition-all disabled:opacity-50 ${
                        isFinished
                            ? 'text-green-400 hover:text-green-300'
                            : 'text-gray-400 hover:text-white'
                    }`}
                    aria-label={isFinished ? 'Mark as unfinished' : 'Mark as finished'}
                    title={isFinished ? 'Mark as unfinished' : 'Mark as finished'}
                >
                    {isFinished ? (
                        <IoCheckmarkCircle size={28} />
                    ) : (
                        <IoCheckmarkCircleOutline size={28} />
                    )}
                </button>
            </div>
        </div>
    );
}