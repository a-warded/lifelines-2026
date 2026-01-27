
export function getPrompt() {
    // for caching purposes, any variables should be at the end of the prompt. optimization stuff
    const promptBase = `
    You are Aila, an advanced AI farming assistant integrated into "Fades", a community food supply chain rebuilding platform designed for crisis zones.
    Your role is to assist inexperienced civilians who need to grow their own food quickly and efficiently in challenging environments.

    `;

    return promptBase.trim();
}

export async function checkMicrophoneAutoStartPermission() {
    if (!navigator.permissions || !navigator.permissions.query) {
        console.log("Permissions API not supported in this browser.");
        return 'prompt';
    }

    try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log(`Microphone permission state is: ${permissionStatus.state}`);

        if (permissionStatus.state === 'granted') {
            console.log('Permission granted. Ready to access microphone.');
            return 'granted';
        } else if (permissionStatus.state === 'prompt') {
            console.log('Permission status is prompt. Will ask user when needed.');
            return 'prompt';
        } else if (permissionStatus.state === 'denied') {
            console.log('Permission denied. Cannot access microphone.');
            return 'denied';
        }
    } catch (error) {
        console.error(`Error querying permissions: ${error}`);
        return 'error';
    }
    return 'prompt';
}

export function float32ToInt16(float32Array: Float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
}

export function int16ToBase64(int16Array: Int16Array) {
    const byteArray = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
        binary += String.fromCharCode(byteArray[i]);
    }
    return btoa(binary);
}

export function int16ToFloat32(int16Array: Int16Array) {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        const int = int16Array[i];
        const float = int < 0 ? int / 0x8000 : int / 0x7fff;
        float32Array[i] = float;
    }
    return float32Array;
}

// vad constants. voice activity detection magic numbers
export const VAD_THRESHOLD = 0.01;

export function detectSpeech(inputData: Float32Array) {
    let sumSquares = 0;
    for (let i = 0; i < inputData.length; i++) {
        sumSquares += inputData[i] * inputData[i];
    }
    const rms = Math.sqrt(sumSquares / inputData.length);
    return rms > VAD_THRESHOLD;
}
