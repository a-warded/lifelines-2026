"use client";

import { MicIcon, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import CallAvatar from '@/components/ui/call-avatar';
import {
    checkMicrophoneAutoStartPermission,
    float32ToInt16,
    getPrompt,
    int16ToBase64,
    int16ToFloat32,
} from './utils';

declare global {
    interface Window {
        _isMuted?: boolean;
        checkMicrophoneAutoStartPermission?: () => Promise<PermissionState>;
        hangUpCall?: () => void;
        conversationID?: string;
        isConnected?: boolean;
        webkitAudioContext?: typeof AudioContext;
    }
}

export default function AilaRealtimeAssistant() {
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [outputActivity, setOutputActivity] = useState(0);
    const [inputActivity, setInputActivity] = useState(0);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    // Refs
    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueTimeRef = useRef<number>(0);
    const assistantAudioSourcesRef = useRef<Array<AudioBufferSourceNode>>([]);
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const outputAnalyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // add ref to hold latest mute state for synchronous reads in audio callback
    const isMutedRef = useRef(isMuted);

    // Camera refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const cameraIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isCameraOnRef = useRef(isCameraOn);

    function toggleMute() {
        if (!isRecording) {
            setIsMuted(false);
            startRecordingInternal();
        } else {
            // flip mute state and, if we're unmuting, resume the audio context so processing runs
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            if (!newMuted) {
                try {
                    audioContextRef.current?.resume?.();
                } catch { /* ignore */ }
            }
        }
    }

    // ensure we only touch window after mount / on updates (avoid run-time during render)
    useEffect(() => {
        isMutedRef.current = isMuted; // keep ref in sync
        if (typeof window !== "undefined") {
            window._isMuted = isMuted;
        }
    }, [isMuted]);

    // Keep camera ref in sync
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

        // Some browsers won't start playback unless we explicitly call play()
        const tryPlay = async () => {
            try {
                await el.play();
            } catch {
                // ignore autoplay restrictions; user gesture may be required
            }
        };

        // If metadata isn't loaded yet, wait for it
        if (el.readyState >= 1) {
            void tryPlay();
        } else {
            const onLoaded = () => {
                void tryPlay();
            };
            el.addEventListener('loadedmetadata', onLoaded, { once: true });
            return () => el.removeEventListener('loadedmetadata', onLoaded);
        }
    }, [cameraStream, isCameraOn]);

    async function toggleCamera() {
        if (isCameraOn) {
            stopCamera();
        } else {
            await startCamera();
        }
    }

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
            });
            cameraStreamRef.current = stream;
            setCameraStream(stream);
            setIsCameraOn(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Best-effort play; don't block UI on this
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
            console.error('Error accessing camera:', err);
        }
    }

    function stopCamera() {
        if (cameraIntervalRef.current) {
            clearInterval(cameraIntervalRef.current);
            cameraIntervalRef.current = null;
        }
        
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
            cameraStreamRef.current = null;
        }

        setCameraStream(null);
        
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
    }

    function captureAndSendFrame() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 JPEG (quality 0.7 for balance of quality/size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64Image = dataUrl.split(',')[1];
        
        // Send image to the API via conversation.item.create
        const imageEvent = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_image',
                        image_url: `data:image/jpeg;base64,${base64Image}`,
                    },
                ],
            },
        };
        
        websocketRef.current.send(JSON.stringify(imageEvent));
        console.log('Sent camera frame to AI');
    }

    async function startRecordingInternal() {
        setIsRecording(true);

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContextClass!({ sampleRate: 24000 });
            audioQueueTimeRef.current = audioContextRef.current.currentTime;
            // ensure context is running (some browsers leave it suspended until a user gesture)
            try {
                await audioContextRef.current.resume();
            } catch (e) { /* ignore */ }
        }

        const ws = new WebSocket(`wss://api.studyable.app/v1/realtime?model=gpt-realtime`, [
            'realtime',
            'openai-beta.realtime-v1',
        ]);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            const sessionUpdate = {
                type: 'session.update',
                session: {
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.7,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500
                    },
                    voice: "coral",
                    instructions: getPrompt()
                }
            };
            ws.send(JSON.stringify(sessionUpdate));
        };

        ws.onmessage = event => {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (err) {
                console.error('Failed to parse websocket message', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            if (isRecording) {
                stopRecordingInternal();
            }
        };

        ws.onerror = event => {
            console.error('WebSocket error:', event);
        };

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = mediaStream;
            const audioCtx = audioContextRef.current!;
            // ensure context running before wiring nodes
            try {
                await audioCtx.resume();
            } catch (e) { /* ignore */ }

            const source = audioCtx.createMediaStreamSource(mediaStream);

            // Create processor
            const processor = audioCtx.createScriptProcessor
                ? audioCtx.createScriptProcessor(4096, 1, 1)
                : (audioCtx as any).createJavaScriptNode(4096, 1, 1);

            mediaProcessorRef.current = processor;

            const inputAnalyser = audioCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            inputAnalyser.smoothingTimeConstant = 0.3;
            inputAnalyserRef.current = inputAnalyser;

            source.connect(processor);
            source.connect(inputAnalyser);
            processor.connect(audioCtx.destination);

            processor.onaudioprocess = (e: AudioProcessingEvent) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Data = float32ToInt16(inputData);
                const base64Audio = int16ToBase64(int16Data);
                const audioCommand = {
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                };

                // read synchronous mute state from ref to avoid race between state update and audio callback
                if (!isMutedRef.current && websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify(audioCommand));
                }
            };
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setIsRecording(false);
        }
    }

    function stopRecordingInternal() {
        setIsRecording(false);

        if (mediaProcessorRef.current) {
            try {
                mediaProcessorRef.current.disconnect();
            } catch (e) { /* ignore */ }
            mediaProcessorRef.current.onaudioprocess = null;
            mediaProcessorRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (websocketRef.current) {
            try {
                websocketRef.current.close();
            } catch (e) {
                console.error('Error closing websocket:', e);
            }
            websocketRef.current = null;
        }

        if (inputAnalyserRef.current) {
            try { inputAnalyserRef.current.disconnect(); } catch (e) { }
            inputAnalyserRef.current = null;
        }

        // Stop camera if it's on
        stopCamera();
    }

    function handleWebSocketMessage(message: any) {
        switch (message.type) {
        case 'response.audio.delta':
            if (message.delta) {
                playAudio(message.delta);
            }
            break;
        case 'response.done':
            break;
        case 'input_audio_buffer.speech_started':
            stopAssistantAudioInternal();
            break;
        case 'error':
            console.error('Error message from server:', JSON.stringify(message, null, 2));
            break;
        case 'conversation.item.created':
            if (message.item) window.conversationID = message.item.id;
            break;
        case 'session.created':
            window.isConnected = true;
            setIsConnected(true);
            break;
        default:
            console.log('Unhandled message type:', message.type);
        }
    }

    function playAudio(base64Audio: string) {
        const binary = atob(base64Audio);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = int16ToFloat32(int16Array);

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContextClass!({ sampleRate: 24000 });
            audioQueueTimeRef.current = audioContextRef.current.currentTime;
        }

        const audioCtx = audioContextRef.current!;
        const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.copyToChannel(float32Array, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        let outputAnalyser = outputAnalyserRef.current;
        if (!outputAnalyser) {
            outputAnalyser = audioCtx.createAnalyser();
            outputAnalyser.fftSize = 1024;
            outputAnalyser.smoothingTimeConstant = 0.6;
            outputAnalyserRef.current = outputAnalyser;
        }
        source.connect(outputAnalyser);
        outputAnalyser.connect(audioCtx.destination);

        const currentTime = audioCtx.currentTime;
        const startTime = Math.max(audioQueueTimeRef.current, currentTime + 0.1);
        source.start(startTime);

        assistantAudioSourcesRef.current.push(source);
        audioQueueTimeRef.current = startTime + audioBuffer.duration;

        source.onended = () => {
            assistantAudioSourcesRef.current = assistantAudioSourcesRef.current.filter(s => s !== source);
        };
    }

    function stopAssistantAudioInternal() {
        const audioCtx = audioContextRef.current;
        assistantAudioSourcesRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                console.error('Error stopping audio source:', e);
            }
        });
        assistantAudioSourcesRef.current = [];
        if (audioCtx) {
            audioQueueTimeRef.current = audioCtx.currentTime;
        }
    }

    useEffect(() => {
        (async () => {
            let fn = checkMicrophoneAutoStartPermission;
            if (typeof window !== "undefined" && window.checkMicrophoneAutoStartPermission) {
                // Use global override if available
                fn = window.checkMicrophoneAutoStartPermission as any;
            }

            const permission = await fn();

            if (permission === 'granted') {
                setIsMuted(false);
                startRecordingInternal();
            }
        })();

        return () => {
            stopRecordingInternal();
            stopAssistantAudioInternal();
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animation loop
    useEffect(() => {
        const drawLoop = () => {
            const inputAnalyser = inputAnalyserRef.current;
            const outputAnalyser = outputAnalyserRef.current;

            if (inputAnalyser) {
                const data = new Uint8Array(inputAnalyser.frequencyBinCount);
                inputAnalyser.getByteTimeDomainData(data);

                // Compute RMS
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                const scale = 1 + Math.min(0.7, rms * 2.5);

                setInputActivity(prev => (prev * 0.85 + scale * 0.15));
            }

            if (outputAnalyser) {
                const data = new Uint8Array(outputAnalyser.frequencyBinCount);
                outputAnalyser.getByteTimeDomainData(data);

                // Compute RMS
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                const scale = 1 + Math.min(0.7, rms * 2.5);

                setOutputActivity(prev => (prev * 0.85 + scale * 0.15));
            }

            animationRef.current = requestAnimationFrame(drawLoop);
        };

        animationRef.current = requestAnimationFrame(drawLoop);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div
            className="absolute h-screen inset-0 z-10 w-full p-5 flex flex-col items-center justify-center"
            style={{ backgroundImage: "url('/images/aila_bg.webp')", backgroundSize: "contain", backgroundPosition: "center" }}
        >
            {/* Hidden video element for camera capture */}
            <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
            />
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera preview (shown when camera is on) */}
            {isCameraOn && cameraStream && (
                <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                    <video
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                        ref={previewVideoRef}
                    />
                </div>
            )}

            <div className="flex justify-center items-center space-x-4 mt-auto">
                <CallAvatar
                    active={isRecording}
                    voiceActivity={inputActivity}
                />
                <CallAvatar
                    active={isConnected}
                    profilePictureURL={"/images/aila_pfp.webp"}
                    voiceActivity={outputActivity}
                />
            </div>

            {/* Controls */}
            <div className="w-full flex justify-around pb-7 items-center mt-auto">
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-colors ${isMuted ? 'bg-[#eee]' : 'bg-white'
                    }`}
                    aria-pressed={isMuted}
                >
                    <div className="relative w-6 h-6 bg-transparent">
                        <MicIcon className={isMuted ? 'text-[#999]' : 'text-black'} />
                        {isMuted && (
                            <div
                                className="absolute inset-0 mt-auto mb-auto h-[2px] bg-[#e74c3c]"
                                style={{ transform: 'rotate(45deg)' }}
                            />
                        )}
                    </div>
                </button>

                <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-colors ${!isCameraOn ? 'bg-[#eee]' : 'bg-white'
                    }`}
                    aria-pressed={isCameraOn}
                >
                    <div className="relative w-6 h-6 bg-transparent">
                        {isCameraOn ? (
                            <Video className="text-black" />
                        ) : (
                            <>
                                <VideoOff className="text-[#999]" />
                            </>
                        )}
                    </div>
                </button>

                {(typeof window !== "undefined" && window.hangUpCall) && (
                    <button
                        onClick={() => { window.hangUpCall?.(); }}
                        className="w-14 h-14 rounded-full bg-[#f25b5b] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <PhoneOff />
                    </button>
                )}
            </div>
        </div>
    );
}