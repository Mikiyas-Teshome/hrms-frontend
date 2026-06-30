import { uploadLogo } from '@/features/documents/documents.actions';

export async function uploadUserAvatarReference(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);

    const uploadResult = await uploadLogo(body);
    if (uploadResult.error || !uploadResult.url) {
        throw new Error(uploadResult.error ?? 'Avatar upload failed');
    }

    return uploadResult.url;
}
