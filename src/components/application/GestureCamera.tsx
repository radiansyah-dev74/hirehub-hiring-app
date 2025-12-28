'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RefreshCw, Check, Hand } from 'lucide-react';

interface GestureCameraProps {
    onCapture: (imageData: string) => void;
    required?: boolean;
    onSkip?: () => void;
}

export function GestureCamera({ onCapture, required = true, onSkip }: GestureCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [fingerCount, setFingerCount] = useState(0);
    const [gestureStep, setGestureStep] = useState(0); // 0=waiting, 1=show1, 2=show2, 3=show3
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setError(null);
            }
        } catch (err) {
            setError('Unable to access camera. Please grant permission.');
            console.error('Camera error:', err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageData);
                onCapture(imageData);
                stopCamera();
            }
        }
    }, [onCapture, stopCamera]);

    // Simulated finger detection (in production, use MediaPipe or TensorFlow.js)
    // For demo purposes, we'll use keyboard shortcuts or button clicks
    const simulateFingerDetection = useCallback((fingers: number) => {
        setFingerCount(fingers);

        if (fingers === 1 && gestureStep === 0) {
            setGestureStep(1);
        } else if (fingers === 2 && gestureStep === 1) {
            setGestureStep(2);
        } else if (fingers === 3 && gestureStep === 2) {
            setGestureStep(3);
            // Start countdown
            setCountdown(3);
        }
    }, [gestureStep]);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            capturePhoto();
            setCountdown(null);
            setGestureStep(0);
        }
    }, [countdown, capturePhoto]);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const retake = () => {
        setCapturedImage(null);
        setGestureStep(0);
        setCountdown(null);
        startCamera();
    };

    const getGestureInstruction = () => {
        switch (gestureStep) {
            case 0:
                return 'Show 1 finger to start';
            case 1:
                return 'Great! Now show 2 fingers';
            case 2:
                return 'Almost there! Show 3 fingers to capture';
            case 3:
                return 'Hold still...';
            default:
                return '';
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Photo
                    {required ? (
                        <span className="text-red-500">*</span>
                    ) : (
                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    )}
                </CardTitle>
                <CardDescription>
                    Use hand gestures to take your photo automatically
                    {!required && ' - You can skip this step'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {capturedImage ? (
                    <div className="relative">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={retake}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retake
                            </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                            <div className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                                <Check className="h-3 w-3" />
                                Captured
                            </div>
                        </div>
                    </div>
                ) : isStreaming ? (
                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full rounded-lg"
                        />

                        {/* Gesture Progress Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                            <div className="rounded-full bg-black/70 px-4 py-2 text-center text-white backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <Hand className="h-4 w-4" />
                                    <span>{getGestureInstruction()}</span>
                                </div>
                                <div className="mt-2 flex justify-center gap-2">
                                    {[1, 2, 3].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-2 w-8 rounded-full transition-colors ${gestureStep >= step ? 'bg-green-500' : 'bg-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Countdown Overlay */}
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="text-8xl font-bold text-white animate-pulse">
                                    {countdown || '📸'}
                                </span>
                            </div>
                        )}

                        {/* Simulated gesture buttons (for demo) */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {[1, 2, 3].map((fingers) => (
                                <Button
                                    key={fingers}
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0"
                                    onClick={() => simulateFingerDetection(fingers)}
                                    disabled={
                                        (fingers === 1 && gestureStep !== 0) ||
                                        (fingers === 2 && gestureStep !== 1) ||
                                        (fingers === 3 && gestureStep !== 2)
                                    }
                                >
                                    {fingers}
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                        <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-center text-muted-foreground">
                            Click below to start camera and use hand gestures
                        </p>
                        <div className="flex gap-2">
                            <Button type="button" onClick={startCamera} className="gap-2">
                                <Camera className="h-4 w-4" />
                                Start Camera
                            </Button>
                            {!required && onSkip && (
                                <Button type="button" variant="outline" onClick={onSkip}>
                                    Skip Photo
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">How it works:</p>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
                        <li>Show 1 finger to begin</li>
                        <li>Then show 2 fingers</li>
                        <li>Finally show 3 fingers to capture</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}
