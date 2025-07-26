import sharp from 'sharp';

export const processImageToSticker = async (
  imageBuffer: Buffer
): Promise<Buffer> => {
  try {
    const stickerBuffer = await sharp(imageBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 85 })
      .toBuffer();

    console.log('✅ Image processed for sticker');
    return stickerBuffer;
  } catch (error) {
    console.error('❌ Error processing image:', error);
    throw new Error('Image processing failed');
  }
};
