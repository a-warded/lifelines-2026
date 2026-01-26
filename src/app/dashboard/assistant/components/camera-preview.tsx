"use client";

interface CameraPreviewProps {
  stream: MediaStream | null;
  previewRef: React.RefObject<HTMLVideoElement | null>;
  isOn: boolean;
}

export function CameraPreview({ stream, previewRef, isOn }: CameraPreviewProps) {
    if (!isOn || !stream) return null;

    return (
        <div className="absolute top-4 right-4 left-4 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
                ref={previewRef}
            />
        </div>
    );
}
