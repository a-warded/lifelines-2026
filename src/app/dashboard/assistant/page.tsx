"use client";

import { PhoneOff } from "lucide-react";
import { useEffect } from "react";

import CallAvatar from "@/components/ui/call-avatar";
import { CameraPreview, ControlButton } from "./components";
import { useCamera, useRealtimeAudio } from "./hooks";

export default function AilaRealtimeAssistant() {
    const audio = useRealtimeAudio();
    const camera = useCamera({ getWebSocket: audio.getWebSocket });

    // Stop camera when recording stops
    useEffect(() => {
        if (!audio.isRecording) {
            camera.stopCamera();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audio.isRecording]);

    return (
        <div
            className="absolute h-screen inset-0 z-10 w-full p-5 flex flex-col items-center justify-center"
            style={{
                backgroundImage: "url('/images/aila_bg.webp')",
                backgroundSize: "contain",
                backgroundPosition: "center",
            }}
        >
            {/* Hidden video element for camera capture */}
            <video ref={camera.videoRef} className="hidden" playsInline muted />
            {/* Hidden canvas for frame capture */}
            <canvas ref={camera.canvasRef} className="hidden" />

            {/* Camera preview */}
            <CameraPreview
                stream={camera.cameraStream}
                previewRef={camera.previewVideoRef}
                isOn={camera.isCameraOn}
            />

            {/* Call avatars */}
            <div className="flex justify-center items-center space-x-4 mt-auto">
                <CallAvatar active={audio.isRecording} voiceActivity={audio.inputActivity} />
                <CallAvatar
                    active={audio.isConnected}
                    profilePictureURL="/images/aila_pfp.webp"
                    voiceActivity={audio.outputActivity}
                />
            </div>

            {audio.isMuted && (
                <div className="mt-4 text-center text-white bg-foreground/40  px-4 py-2 rounded-lg">
                    <p className="font-bold">AI Farming Assistant</p>
                    <p className="text-sm">Press the mic button to start talking</p>
                </div>
            )}

            {/* Controls */}
            <div className="w-full flex justify-around pb-7 items-center mt-auto">
                <ControlButton
                    onClick={audio.toggleMute}
                    active={!audio.isMuted}
                    icon="mic"
                />

                <ControlButton
                    onClick={camera.toggleCamera}
                    active={camera.isCameraOn}
                    icon="video"
                />

                {typeof window !== "undefined" && window.hangUpCall && (
                    <button
                        onClick={() => window.hangUpCall?.()}
                        className="w-14 h-14 rounded-full bg-[#f25b5b] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <PhoneOff />
                    </button>
                )}
            </div>
        </div>
    );
}
