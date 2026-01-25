"use client";

import { MicIcon, Video, VideoOff } from "lucide-react";

interface ControlButtonProps {
  onClick: () => void;
  active: boolean;
  icon: "mic" | "video";
}

export function ControlButton({ onClick, active, icon }: ControlButtonProps) {
  const isMuted = !active;

  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-colors ${
        isMuted ? "bg-[#eee]" : "bg-white"
      }`}
      aria-pressed={active}
    >
      <div className="relative w-6 h-6 bg-transparent">
        {icon === "mic" ? (
          <>
            <MicIcon className={isMuted ? "text-[#999]" : "text-black"} />
            {isMuted && (
              <div
                className="absolute inset-0 mt-auto mb-auto h-[2px] bg-[#e74c3c]"
                style={{ transform: "rotate(45deg)" }}
              />
            )}
          </>
        ) : active ? (
          <Video className="text-black" />
        ) : (
          <VideoOff className="text-[#999]" />
        )}
      </div>
    </button>
  );
}
