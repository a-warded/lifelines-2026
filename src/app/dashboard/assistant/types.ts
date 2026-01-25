// Assistant feature type definitions

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

export interface WebSocketMessage {
  type: string;
  delta?: string;
  item?: { id: string };
  error?: unknown;
}

export {};
