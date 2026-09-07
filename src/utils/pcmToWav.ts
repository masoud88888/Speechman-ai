/**
 * Converts a base64 encoded raw 24kHz, 16-bit, mono PCM stream into a standard WAV Blob.
 */
export function pcmToWav(base64PCM: string, sampleRate: number = 24000): Blob {
  if (!base64PCM || typeof base64PCM !== "string") {
    throw new Error("Invalid base64 PCM data: received empty or non-string input");
  }

  // Strip whitespaces, newlines, and carriage returns that can corrupt atob()
  const sanitized = base64PCM.replace(/[\s\r\n]+/g, "");

  // Decode base64 to binary string
  const binaryString = atob(sanitized);
  const len = binaryString.length;
  const audioBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    audioBytes[i] = binaryString.charCodeAt(i);
  }

  // Detect if already a WAV audio file (starts with "RIFF")
  if (
    audioBytes.length >= 4 &&
    audioBytes[0] === 0x52 &&
    audioBytes[1] === 0x49 &&
    audioBytes[2] === 0x46 &&
    audioBytes[3] === 0x46
  ) {
    return new Blob([audioBytes], { type: "audio/wav" });
  }

  // Detect if already an MP3 audio file (starts with "ID3" or MP3 frame sync 0xFF)
  if (
    audioBytes.length >= 2 &&
    ((audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33) ||
      (audioBytes[0] === 0xff && (audioBytes[1] & 0xe0) === 0xe0))
  ) {
    return new Blob([audioBytes], { type: "audio/mpeg" });
  }

  // Create standard WAV header (44 bytes) for raw 16-bit linear PCM
  const buffer = new ArrayBuffer(44 + audioBytes.length);
  const view = new DataView(buffer);

  // "RIFF"
  writeString(view, 0, "RIFF");
  // File length: 36 + data size
  view.setUint32(4, 36 + audioBytes.length, true);
  // "WAVE"
  writeString(view, 8, "WAVE");
  // "fmt " chunk
  writeString(view, 12, "fmt ");
  // Chunk size: 16
  view.setUint32(16, 16, true);
  // Audio format: 1 (PCM)
  view.setUint16(20, 1, true);
  // Channels: 1 (Mono)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate: sampleRate * channels * bytesPerSample
  view.setUint32(28, sampleRate * 1 * 2, true);
  // Block align: channels * bytesPerSample
  view.setUint16(32, 2, true);
  // Bits per sample: 16
  view.setUint16(34, 16, true);
  // "data" chunk
  writeString(view, 36, "data");
  // Data chunk size
  view.setUint32(40, audioBytes.length, true);

  // Write WAV bytes
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(audioBytes, 44);

  return new Blob([wavBytes], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Downloads a WAV Blob as an MP3 or WAV file.
 */
export function downloadWavBlob(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  } catch (e) {
    console.warn("Failed to download audio blob:", e);
  }
}
