'use client';

import { useState, useRef, useEffect } from 'react';
import { Book } from '@/types';
import {
    IoPlayCircle,
    IoPauseCircle,
    IoPlaySkipBackCircle,
    IoPlaySkipForwardCircle,
    IoVolumeHighOutline,
    IoVolumeMuteOutline
} from 'react-icons/io5';

interface AudioPlayerProps {
    book: Book;
}

export default function AudioPlayer({ book }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);