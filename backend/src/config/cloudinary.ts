import { ENV } from './env.js';

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  const cloudName = (ENV.CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = 'lms_slips'; // Must match the preset you created in Settings > Upload

  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is missing from .env');
  }

  // Convert buffer to data URI string
  const base64Data = fileBuffer.toString('base64');
  const fileUri = `data:${mimeType};base64,${base64Data}`;

  const formData = new FormData();
  formData.append('file', fileUri);
  formData.append('upload_preset', uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data: any = await response.json();

  if (!response.ok) {
    console.error('Cloudinary Raw API Response:', data);
    throw new Error(data.error?.message || `Cloudinary returned status ${response.status}`);
  }

  return data.secure_url;
};

export default uploadToCloudinary;