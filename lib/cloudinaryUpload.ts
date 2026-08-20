export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: 'image' | 'video';
  uploadUrl: string;
};

export type CloudinaryUploadResult = {
  secureUrl: string;
  width?: number;
  height?: number;
  durationSec?: number;
};

/** Guesses a MIME type from a local file URI's extension — good enough for expo-image-picker output. */
export function guessMimeType(uri: string, mediaType: 'image' | 'video'): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (mediaType === 'video') {
    if (ext === 'mov') return 'video/quicktime';
    return 'video/mp4';
  }
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Uploads a local file straight to Cloudinary using a pre-signed payload
 * from POST /api/upload/signature. Uses XMLHttpRequest rather than fetch
 * because React Native's fetch doesn't emit upload progress events —
 * xhr.upload.onprogress is the only way to drive a real progress bar here.
 */
export function uploadToCloudinary(
  fileUri: string,
  sig: UploadSignature,
  mimeType: string,
  onProgress?: (fraction: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', sig.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Cloudinary upload failed (${xhr.status}).`));
        return;
      }
      try {
        const response = JSON.parse(xhr.responseText);
        resolve({
          secureUrl: response.secure_url,
          width: response.width,
          height: response.height,
          durationSec: response.duration ? Math.round(response.duration) : undefined,
        });
      } catch {
        reject(new Error('Couldn\u2019t parse the Cloudinary response.'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out.'));

    const formData = new FormData();
    // React Native's FormData accepts this { uri, type, name } shape for file fields.
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: `${sig.publicId}.${mimeType.split('/')[1] ?? 'dat'}`,
    } as any);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);
    formData.append('public_id', sig.publicId);

    xhr.send(formData);
  });
}

/** Cloudinary auto-generates a poster frame at the same public_id with a .jpg extension. */
export function buildVideoThumbnailUrl(secureVideoUrl: string): string {
  return secureVideoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
}