import sharp from "sharp";

/**
 * Process an auction image buffer:
 *  - auto-rotate based on EXIF
 *  - resize down to fit inside maxWidth x maxHeight
 *  - convert to WebP
 *  - strip EXIF/metadata (privacy: removes GPS, camera info)
 *
 * @param {Buffer} buffer       - raw file buffer from multer
 * @param {Object} [opts]
 * @param {number} [opts.maxWidth=1600]
 * @param {number} [opts.maxHeight=1600]
 * @param {number} [opts.quality=80]
 * @param {number} [opts.effort=4]  // 0-6; higher = smaller file, slower encode
 * @returns {Promise<{ buffer: Buffer, width: number, height: number, format: string, bytes: number }>}
 */
export const processImageBuffer = async (buffer, opts = {}) => {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 80,
        effort = 4,
    } = opts;

    // Validate it's actually an image (Sharp will throw otherwise)
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error("Invalid image buffer");
    }

    const processed = await sharp(buffer)
        .rotate() // honor EXIF orientation (mobile photos)
        .resize({
            width: maxWidth,
            height: maxHeight,
            fit: "inside",            // don't crop, fit within the box
            withoutEnlargement: true, // never upscale small images
        })
        .webp({ quality, effort })
        .toBuffer({ resolveWithObject: true });

    return {
        buffer: processed.data,
        width: processed.info.width,
        height: processed.info.height,
        format: "webp",
        bytes: processed.info.size,
    };
};

/**
 * Generate a small thumbnail variant (for grids / cards).
 */
export const processThumbnailBuffer = async (buffer, size = 500) => {
    const processed = await sharp(buffer)
        .rotate()
        .resize({
            width: size,
            height: size,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: 75, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    return {
        buffer: processed.data,
        width: processed.info.width,
        height: processed.info.height,
        format: "webp",
        bytes: processed.info.size,
    };
};