import imageCompression from 'browser-image-compression';

const CLIENT_MAX_MB = 1.5;
const CLIENT_MAX_DIM = 2000;
const CLIENT_INITIAL_QUALITY = 0.9;
const SKIP_BELOW_MB = 0.5;

/**
 * Compress a single image file in the browser before upload.
 * Always returns a File object — on any failure, returns the original.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export const compressAuctionImage = async (file) => {
    // Guard: not an image, or is a vector (SVG), or already small
    if (!file || !file.type) return file;
    if (!file.type.startsWith('image/')) return file;
    if (file.type === 'image/svg+xml') return file;
    if (file.size <= SKIP_BELOW_MB * 1024 * 1024) return file;

    const options = {
        maxSizeMB: CLIENT_MAX_MB,
        maxWidthOrHeight: CLIENT_MAX_DIM,
        initialQuality: CLIENT_INITIAL_QUALITY,
        useWebWorker: true,
        preserveExif: false,
        fileType: 'image/jpeg',
    };

    try {
        const compressedBlob = await imageCompression(file, options);

        // If compression made it bigger (rare, but happens on already-optimized JPEGs),
        // keep the original.
        if (!compressedBlob || compressedBlob.size >= file.size) {
            return file;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '');
        const newName = `${baseName}.jpg`;

        return new File([compressedBlob], newName, { type: 'image/jpeg' });
    } catch (err) {
        // Any failure (e.g. HEIC that the browser can't decode) — fall back to original.
        // The server-side Sharp pipeline will still process it.
        console.warn('Client-side compression failed, uploading original:', err);
        return file;
    }
};

/**
 * Compress many files. Preserves order and never rejects.
 */
export const compressAuctionImages = async (files) => {
    return Promise.all(files.map((f) => compressAuctionImage(f)));
};