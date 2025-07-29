import { WAMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import P from 'pino';

export const downloadMedia = async (msg: WAMessage): Promise<Buffer> => {
  try {
    console.log('⬇️ Downloading media...');

    if (!msg.message?.imageMessage && !msg.message?.videoMessage) {
      throw new Error('Media not found');
    }

    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: P({ level: 'info' }),
        reuploadRequest: async () => {
          throw new Error('Reupload error');
        },
      }
    );

    if (!buffer || buffer.length === 0) {
      throw new Error('Empty buffer received');
    }

    console.log(`✅ Media downloaded: ${buffer.length} bytes`);
    return buffer as Buffer;
  } catch (error: any) {
    console.error('❌ Error downloading media:', error);
    throw new Error(`Media download failed: ${error.message}`);
  }
};

export const cleanTempFiles = (
  tempDir: string = './temp',
  maxAgeMinutes: number = 30
): void => {
  try {
    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const ageMinutes = (now - stats.mtime.getTime()) / (1000 * 60);

      if (ageMinutes > maxAgeMinutes) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Temporary file removed: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Error cleaning temporary files:', error);
  }
};

export const getMediaType = (
  msg: WAMessage
): 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'unknown' => {
  if (msg.message?.imageMessage) return 'image';
  if (msg.message?.videoMessage) return 'video';
  if (msg.message?.audioMessage) return 'audio';
  if (msg.message?.documentMessage) return 'document';
  if (msg.message?.stickerMessage) return 'sticker';
  return 'unknown';
};

export const isSupportedForSticker = (msg: WAMessage): boolean => {
  const mediaType = getMediaType(msg);
  return mediaType === 'image' || mediaType === 'video';
};
