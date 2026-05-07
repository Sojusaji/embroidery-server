import sharp from "sharp";

export const convertImage = (inputBuffer) => {
    try {
        const processedImage = sharp(inputBuffer)
            .resize(1280, 720, {
                fit: 'inside',
                withoutEnlargement: true
            }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
        return processedImage;
    } catch (error) {
        console.error("Sharp processing error:", error);
        throw error;
    }
}