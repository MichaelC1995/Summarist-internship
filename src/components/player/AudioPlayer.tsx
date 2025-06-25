'use client';

import { useState, useRef, useEffect } from 'react';
import { Book } from '@/types';
import {
    IoPlayCircle,
    IoPauseCircle,
    IoPlaySkipBackCircle,
    IoPlaySkipForwardCircle,
} from 'react-icons/io5';
import Image from "next/image";

interface AudioPlayerProps {
    book: Book;
}

export default function AudioPlayer({ book }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(book.duration || 0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressWrapperRef = useRef<HTMLDivElement>(null);

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

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', () => setIsPlaying(false));
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

    const updateProgress = (clientX: number) => {
        const audio = audioRef.current;
        const progressBar = progressBarRef.current;
        if (!audio || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        updateProgress(e.clientX);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        updateProgress(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            updateProgress(e.clientX);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

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
            </div>
        </div>
    );
}