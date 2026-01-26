"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
    checkMicrophoneAutoStartPermission,
    float32ToInt16,
    getPrompt,
    int16ToBase64,
    int16ToFloat32,
} from "../utils";
import type { WebSocketMessage } from "../types";

export function useRealtimeAudio() {
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [outputActivity, setOutputActivity] = useState(0);
    const [inputActivity, setInputActivity] = useState(0);

    // Refs
    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueTimeRef = useRef<number>(0);
    const assistantAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const outputAnalyserRef = useRef<AnalyserNode | null>(null);
    const isMutedRef = useRef(isMuted);

    // Keep mute ref in sync
    useEffect(() => {
        isMutedRef.current = isMuted;
        if (typeof window !== "undefined") {
            window._isMuted = isMuted;
        }
    }, [isMuted]);

    const playAudio = useCallback((base64Audio: string) => {
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
            assistantAudioSourcesRef.current = assistantAudioSourcesRef.current.filter(
                (s) => s !== source
            );
        };
    }, []);

    const stopAssistantAudio = useCallback(() => {
        const audioCtx = audioContextRef.current;
        assistantAudioSourcesRef.current.forEach((source) => {
            try {
                source.stop();
            } catch (e) {
                console.error("Error stopping audio source:", e);
            }
        });
        assistantAudioSourcesRef.current = [];
        if (audioCtx) {
            audioQueueTimeRef.current = audioCtx.currentTime;
        }
    }, []);

    const handleWebSocketMessage = useCallback(
        (message: WebSocketMessage) => {
            switch (message.type) {
            case "response.audio.delta":
                if (message.delta) {
                    playAudio(message.delta);
                }
                break;
            case "response.done":
                break;
            case "input_audio_buffer.speech_started":
                stopAssistantAudio();
                break;
            case "error":
                console.error("Error message from server:", JSON.stringify(message, null, 2));
                break;
            case "conversation.item.created":
                if (message.item) window.conversationID = message.item.id;
                break;
            case "session.created":
                window.isConnected = true;
                setIsConnected(true);
                break;
            default:
                console.log("Unhandled message type:", message.type);
            }
        },
        [playAudio, stopAssistantAudio]
    );

    const stopRecording = useCallback(() => {
        setIsRecording(false);

        if (mediaProcessorRef.current) {
            try {
                mediaProcessorRef.current.disconnect();
            } catch {
                /* ignore */
            }
            mediaProcessorRef.current.onaudioprocess = null;
            mediaProcessorRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        if (websocketRef.current) {
            try {
                websocketRef.current.close();
            } catch (e) {
                console.error("Error closing websocket:", e);
            }
            websocketRef.current = null;
        }

        if (inputAnalyserRef.current) {
            try {
                inputAnalyserRef.current.disconnect();
            } catch {
                /* ignore */
            }
            inputAnalyserRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        setIsRecording(true);

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContextClass!({ sampleRate: 24000 });
            audioQueueTimeRef.current = audioContextRef.current.currentTime;
            try {
                await audioContextRef.current.resume();
            } catch {
                /* ignore */
            }
        }

        const ws = new WebSocket(
            `wss://api.studyable.app/v1/realtime?model=gpt-realtime`,
            ["realtime", "openai-beta.realtime-v1"]
        );
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection opened");
            const sessionUpdate = {
                type: "session.update",
                session: {
                    turn_detection: {
                        type: "server_vad",
                        threshold: 0.7,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500,
                    },
                    voice: "coral",
                    instructions: getPrompt(),
                },
            };
            ws.send(JSON.stringify(sessionUpdate));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (err) {
                console.error("Failed to parse websocket message", err);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            stopRecording();
        };

        ws.onerror = (event) => {
            console.error("WebSocket error:", event);
        };

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = mediaStream;
            const audioCtx = audioContextRef.current!;
            try {
                await audioCtx.resume();
            } catch {
                /* ignore */
            }

            const source = audioCtx.createMediaStreamSource(mediaStream);
            const processor =
        audioCtx.createScriptProcessor?.(4096, 1, 1) ??
        (audioCtx as any).createJavaScriptNode(4096, 1, 1);

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
                    type: "input_audio_buffer.append",
                    audio: base64Audio,
                };

                if (
                    !isMutedRef.current &&
          websocketRef.current &&
          websocketRef.current.readyState === WebSocket.OPEN
                ) {
                    websocketRef.current.send(JSON.stringify(audioCommand));
                }
            };
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setIsRecording(false);
        }
    }, [handleWebSocketMessage, stopRecording]);

    const toggleMute = useCallback(() => {
        if (!isRecording) {
            setIsMuted(false);
            startRecording();
        } else {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            if (!newMuted) {
                try {
                    audioContextRef.current?.resume?.();
                } catch {
                    /* ignore */
                }
            }
        }
    }, [isRecording, isMuted, startRecording]);

    // Animation loop for activity levels
    useEffect(() => {
        let animationRef: number | null = null;

        const drawLoop = () => {
            const inputAnalyser = inputAnalyserRef.current;
            const outputAnalyser = outputAnalyserRef.current;

            if (inputAnalyser) {
                const data = new Uint8Array(inputAnalyser.frequencyBinCount);
                inputAnalyser.getByteTimeDomainData(data);
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                const scale = 1 + Math.min(0.7, rms * 2.5);
                setInputActivity((prev) => prev * 0.85 + scale * 0.15);
            }

            if (outputAnalyser) {
                const data = new Uint8Array(outputAnalyser.frequencyBinCount);
                outputAnalyser.getByteTimeDomainData(data);
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                const scale = 1 + Math.min(0.7, rms * 2.5);
                setOutputActivity((prev) => prev * 0.85 + scale * 0.15);
            }

            animationRef = requestAnimationFrame(drawLoop);
        };

        animationRef = requestAnimationFrame(drawLoop);
        return () => {
            if (animationRef) cancelAnimationFrame(animationRef);
        };
    }, []);

    // Auto-start if permission granted
    useEffect(() => {
        (async () => {
            let fn = checkMicrophoneAutoStartPermission;
            if (typeof window !== "undefined" && window.checkMicrophoneAutoStartPermission) {
                fn = window.checkMicrophoneAutoStartPermission as typeof checkMicrophoneAutoStartPermission;
            }

            const permission = await fn();
            if (permission === "granted") {
                setIsMuted(false);
                startRecording();
            }
        })();

        return () => {
            stopRecording();
            stopAssistantAudio();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isRecording,
        isMuted,
        isConnected,
        inputActivity,
        outputActivity,
        toggleMute,
        startRecording,
        stopRecording,
        getWebSocket: () => websocketRef.current,
    };
}
