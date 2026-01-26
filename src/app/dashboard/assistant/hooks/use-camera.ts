"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseCameraOptions {
  getWebSocket: () => WebSocket | null;
}

export function useCamera({ getWebSocket }: UseCameraOptions) {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const cameraIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCameraOnRef = useRef(isCameraOn);

    // Keep ref in sync
    useEffect(() => {
        isCameraOnRef.current = isCameraOn;
    }, [isCameraOn]);

    // Wire up preview element to the current camera stream
    useEffect(() => {
        const el = previewVideoRef.current;
        if (!el) return;

        if (!cameraStream) {
            el.srcObject = null;
            return;
        }

        el.srcObject = cameraStream;

        const tryPlay = async () => {
            try {
                await el.play();
            } catch {
                // ignore autoplay restrictions
            }
        };

        if (el.readyState >= 1) {
            void tryPlay();
        } else {
            const onLoaded = () => void tryPlay();
            el.addEventListener("loadedmetadata", onLoaded, { once: true });
            return () => el.removeEventListener("loadedmetadata", onLoaded);
        }
    }, [cameraStream, isCameraOn]);

    const captureAndSendFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ws = getWebSocket();

        if (!video || !canvas || !ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64Image = dataUrl.split(",")[1];

        const imageEvent = {
            type: "conversation.item.create",
            item: {
                type: "message",
                role: "user",
                content: [
                    {
                        type: "input_image",
                        image_url: `data:image/jpeg;base64,${base64Image}`,
                    },
                ],
            },
        };

        ws.send(JSON.stringify(imageEvent));
        console.log("Sent camera frame to AI");
    }, [getWebSocket]);

    const stopCamera = useCallback(() => {
        if (cameraIntervalRef.current) {
            clearInterval(cameraIntervalRef.current);
            cameraIntervalRef.current = null;
        }

        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
        }

        setCameraStream(null);

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraOn(false);
    }, []);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
            });
            cameraStreamRef.current = stream;
            setCameraStream(stream);
            setIsCameraOn(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {
                    // ignore autoplay restrictions
                });
            }

            // Start sending frames every 2 seconds
            cameraIntervalRef.current = setInterval(() => {
                if (isCameraOnRef.current) {
                    captureAndSendFrame();
                }
            }, 2000);
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }, [captureAndSendFrame]);

    const toggleCamera = useCallback(async () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            await startCamera();
        }
    }, [isCameraOn, startCamera, stopCamera]);

    return {
        isCameraOn,
        cameraStream,
        videoRef,
        previewVideoRef,
        canvasRef,
        toggleCamera,
        stopCamera,
    };
}
