"use client";

import CallAvatar from '@/components/ui/call-avatar';
import { MicIcon, PhoneOff } from 'lucide-react';
import Head from "next/head";
import { useEffect, useRef, useState } from 'react';

function GetPrompt() {

    // For caching purposes, any variables should be at the end of the prompt
    const promptBase = "";

    const promptRegular = `\nIf the user doesn't immediately tell you what they want to do, ask them what they want to study or learn, and tell them you can teach them, help them with a problem, or quiz them.`;

    return promptBase + promptRegular;
}

async function checkMicrophoneAutoStartPermission() {
    if (!navigator.permissions || !navigator.permissions.query) {
        console.log("Permissions API not supported in this browser.");
        // Fallback: assume 'prompt' or try getUserMedia and handle the catch
        return 'prompt'; 
    }

    try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
    
        console.log(`Microphone permission state is: ${permissionStatus.state}`);

        if (permissionStatus.state === 'granted') {
            // Permission is granted, you can attempt to auto-start the microphone
            console.log('Permission granted. Ready to access microphone.');
            return 'granted';
        } else if (permissionStatus.state === 'prompt') {
            // User will be prompted next time getUserMedia is called
            console.log('Permission status is prompt. Will ask user when needed.');
            return 'prompt';
        } else if (permissionStatus.state === 'denied') {
            // Permission is denied, cannot use the microphone
            console.log('Permission denied. Cannot access microphone.');
            return 'denied';
        }
    } catch (error) {
        console.error(`Error querying permissions: ${error}`);
        return 'error';
    }
}

export default function RealtimePage() {

    const [isRecording, setIsRecording] = useState(false);
    const [toggleText, setToggleText] = useState('Start Conversation');
    const [statusMessage, setStatusMessage] = useState('Stopped');
    const [isMuted, setIsMuted] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [outputActivity, setOutputActivity] = useState(0);
    const [inputActivity, setInputActivity] = useState(0);


    // refs for mutable objects that shouldn't trigger rerenders
    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueTimeRef = useRef<number>(0);
    const assistantAudioSourcesRef = useRef<Array<AudioBufferSourceNode>>([]);
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const outputAnalyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // VAD constants (client-side optional)
    const VAD_THRESHOLD = 0.01;

    const toggleMute = () => {
        if (!isRecording) {
            setIsMuted(false);
            startRecordingInternal();
        }
        else {
            setIsMuted(!isMuted);
        }
    };


    if (typeof window !== "undefined") {
        window._isMuted = isMuted;
    }

    useEffect(() => {

        (async () => {

            let fn = checkMicrophoneAutoStartPermission;
            if (typeof window === "undefined" && window.checkMicrophoneAutoStartPermission) {
                fn = window.checkMicrophoneAutoStartPermission;
            }

            const permission = await fn();

            if (permission === 'granted') {
                setIsMuted(false);
                startRecordingInternal();
            }
        })();

        // Cleanup on unmount
        return () => {
            stopRecordingInternal();
            stopAssistantAudioInternal();
        };

    }, []);

    // Animation loop that updates the visualizers
    useEffect(() => {
        function drawLoop() {
            const inputAnalyser = inputAnalyserRef.current;
            const outputAnalyser = outputAnalyserRef.current;

            if (inputAnalyser) {
                const data = new Uint8Array(inputAnalyser.frequencyBinCount);
                inputAnalyser.getByteTimeDomainData(data);
                // compute RMS-ish value
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                // Map rms to a scale for blob (1.0 to 1.7)
                const scale = 1 + Math.min(0.7, rms * 2.5);
                setInputActivity(prev => {
                    // smooth changes
                    return (prev * 0.85 + scale * 0.15);
                });
            }

            if (outputAnalyser) {
                const data = new Uint8Array(outputAnalyser.frequencyBinCount);
                outputAnalyser.getByteTimeDomainData(data);
                // compute RMS-ish value
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / data.length);
                // Map rms to a scale for blob (1.0 to 1.7)
                const scale = 1 + Math.min(0.7, rms * 2.5);
                setOutputActivity(prev => {
                    // smooth changes
                    return (prev * 0.85 + scale * 0.15);
                });
            }

            animationRef.current = requestAnimationFrame(drawLoop);
        }

        animationRef.current = requestAnimationFrame(drawLoop);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    if (typeof window !== "undefined") {

        // Setup interop helpers
        // On mobile these functions are directly executed via injection

        window.sendMessage = async (message: any) => {

            await window.interruptMessage();

            const messageData = {
                type: 'conversation.item.create',
                item: {
                    type: "message",
                    status: "completed",
                    role: message?.role || "user",
                    content: [{
                        type: "input_text",
                        text: message?.text || message
                    }]
                }
            };
            websocketRef.current.send(JSON.stringify(messageData));
            websocketRef.current.send(JSON.stringify({ type: 'response.create' }));

        };

        window.interruptMessage = async () => {

            // Wait until window.isConnected is true using setTimeout polling
            if (!window.isConnected) {
                await new Promise<void>((resolve) => {
                    const checkConnection = () => {
                        if (window.isConnected && websocketRef.current?.readyState === WebSocket.OPEN) {
                            resolve();
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    checkConnection();
                });
            }


            stopAssistantAudioInternal();
            websocketRef.current.send(JSON.stringify({ type: 'response.cancel' }));
        };

        // On desktop we need to establish iframe IPC
        if (!window._ipcListenerSetup) {
            window._ipcListenerSetup = true;
        
            console.log("[IPC] Setting up message listener");
            window.addEventListener('message', (event) => {

                // The message data is available in event.data
                console.log(`[IPC] Message received from ${event.origin}:`, event.data);

                if (!event.origin.includes("/a-warded.org")) return;

                // Is this dangerous? Yes.
                // Do I care? No, if you got a problem with it, fix it yourself 🥱.
                // https://media1.tenor.com/m/Ir-6Wr8umQUAAAAC/an-iq-too-high-crow.gif
                const functionToCall = window[event.data.type] as unknown as Function | undefined;
                functionToCall?.(event.data.message);
            });
        }

    }

    async function startRecordingInternal() {
        setIsRecording(true);
        setToggleText('Stop Conversation');
        setStatusMessage('Recording...');

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioQueueTimeRef.current = audioContextRef.current.currentTime;
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
                    voice: "marin",
                    instructions: GetPrompt()
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

        // Start capturing audio
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = mediaStream;
            const audioCtx = audioContextRef.current!;
            const source = audioCtx.createMediaStreamSource(mediaStream);

            const processor = (audioCtx.createScriptProcessor || (audioCtx as any).createJavaScriptNode).call(audioCtx, 4096, 1, 1) as ScriptProcessorNode;
            mediaProcessorRef.current = processor;

            // create an input analyser to drive the top visualizer
            const inputAnalyser = audioCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            inputAnalyser.smoothingTimeConstant = 0.3;
            inputAnalyserRef.current = inputAnalyser;

            source.connect(processor);
            source.connect(inputAnalyser);
            processor.connect(audioCtx.destination);

            processor.onaudioprocess = e => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Data = float32ToInt16(inputData);
                const base64Audio = int16ToBase64(int16Data);
                const audioCommand = {
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                };
                // Only send audio to the server if not muted

                if (typeof window !== "undefined" && !window._isMuted && websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify(audioCommand));
                }

                // Optional: client-side VAD (kept for parity, but not used actively)
                // const isUserSpeaking = detectSpeech(inputData);
            };
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setStatusMessage('Microphone access denied');
            setIsRecording(false);
            setToggleText('Start Conversation');
        }
    }

    function stopRecordingInternal() {
        setIsRecording(false);
        setToggleText('Start Conversation');
        setStatusMessage('Stopped');

        if (mediaProcessorRef.current) {
            try {
                mediaProcessorRef.current.disconnect();
            } catch (e) {
                // ignore
            }
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

        // clear input analyser
        if (inputAnalyserRef.current) {
            try { inputAnalyserRef.current.disconnect(); } catch (e) { }
            inputAnalyserRef.current = null;
        }
    }

    function onToggleListening() {
        if (!isRecording) {
            startRecordingInternal();
        } else {
            stopRecordingInternal();
        }
    }

    function detectSpeech(inputData: Float32Array) {
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSquares / inputData.length);
        return rms > VAD_THRESHOLD;
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
            window.conversationID = message.item.id;
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
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioQueueTimeRef.current = audioContextRef.current.currentTime;
        }

        const audioCtx = audioContextRef.current!;
        const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.copyToChannel(float32Array, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        // connect output analyser between source and destination so we can pulse the blob
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

        // clear output analyser data
        // (we keep the analyser node but no sources are connected)
    }


    function float32ToInt16(float32Array: Float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return int16Array;
    }

    function int16ToBase64(int16Array: Int16Array) {
        const byteArray = new Uint8Array(int16Array.buffer);
        let binary = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            binary += String.fromCharCode(byteArray[i]);
        }
        return btoa(binary);
    }

    function int16ToFloat32(int16Array: Int16Array) {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            const int = int16Array[i];
            const float = int < 0 ? int / 0x8000 : int / 0x7fff;
            float32Array[i] = float;
        }
        return float32Array;
    }

    return (
        <div className="fullScreen">
            <Head>
                <link rel="manifest" href="/realtime/manifest.json" crossOrigin="use-credentials" />
            </Head>
            <div className="fullScreen" style={{ backgroundColor: '#00000080', zIndex: 1, padding: 20, width: "100%", alignItems: 'center', justifyContent: "center" }}>

                <div className="flex justify-center items-center space-x-4 mt-auto">
                    <CallAvatar active={isRecording} profilePictureURL={"https://media1.tenor.com/m/K0AXcsdiTWIAAAAd/roxymigurdia-bagthebullet-roxy-mushoku-tensei.gif"} voiceActivity={inputActivity} />
                    <CallAvatar active={isConnected} profilePictureURL={"https://app.a-warded.org/assets/images/aila/static.webp"} voiceActivity={outputActivity} />
                </div>

                {/* Controls */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', paddingBottom: 28, alignItems: 'center', marginTop: "auto" }}>
                    <button onClick={toggleMute} style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        background: isMuted ? '#eee' : '#fff',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} aria-pressed={isMuted}>
                        {/* simple microphone icon */}
                        <div style={{ width: 24, height: 24, background: 'transparent', position: 'relative' }}>
                            <MicIcon style={{ color: isMuted ? '#999' : '#000' }} />
                            {/* cross line when muted */}
                            {isMuted && <div className='absolute inset-0 mt-auto mb-auto' style={{ height: 2, background: '#e74c3c', transform: 'rotate(45deg)' }} />}
                        </div>
                    </button>

                    {
                        (typeof window !== "undefined" && window.hangUpCall) && (
                            <button onClick={() => { window.hangUpCall(); }} style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                background: '#f25b5b',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <PhoneOff />
                            </button>)
                    } 


                </div>
            </div>
        </div>
    );
}