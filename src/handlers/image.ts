import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { processImageToSticker } from '../services/image';
import {
  ERROR_MESSAGE,
  UNSUPPORTED_MESSAGE,
  PROCESSING_MESSAGE,
  DAILY_LIMIT_REACHED_MESSAGE,
  DAILY_LIMIT_WARNING_MESSAGE,
} from '../constants/messages';
import {
  downloadMedia,
  isSupportedForSticker,
  cleanTempFiles,
} from '../services/media';
import {
  canCreateSticker,
  recordStickerCreation,
  getRemainingStickers,
} from '../services/rate-limit';
import { DAILY_STICKER_LIMIT } from '../constants/config';

export const handleImage = async (
  sock: WASocket,
  sender: string,
  msg: WAMessage
): Promise<void> => {
  const phoneNumber = sender.replace('@s.whatsapp.net', '');

  console.log(`🖼️ Image received from ${phoneNumber}`);

  try {
    if (!isSupportedForSticker(msg)) {
      await sock.sendMessage(sender, {
        text: UNSUPPORTED_MESSAGE,
      });
      return;
    }

    if (!canCreateSticker(phoneNumber)) {
      const remaining = getRemainingStickers(phoneNumber);
      await sock.sendMessage(sender, {
        text: DAILY_LIMIT_REACHED_MESSAGE(remaining, DAILY_STICKER_LIMIT),
      });
      return;
    }

    await sock.sendMessage(sender, {
      text: PROCESSING_MESSAGE,
    });

    console.log('🎨 Processing image...');
    const imageBuffer = await downloadMedia(msg);

    console.log('🎨 Converting to sticker...');
    const stickerBuffer = await processImageToSticker(imageBuffer);

    // Record the sticker creation in rate limit service
    recordStickerCreation(phoneNumber);

    if (stickerBuffer.square) {
      await sock.sendMessage(sender, {
        sticker: stickerBuffer.square,
      });
    }

    if (stickerBuffer.original) {
      await sock.sendMessage(sender, {
        sticker: stickerBuffer.original,
      });
    }

    console.log('✅ Sticker sent successfully!');

    // Check if user is approaching the limit and send warning
    const remaining = getRemainingStickers(phoneNumber);
    if (remaining <= 2 && remaining > 0) {
      await sock.sendMessage(sender, {
        text: DAILY_LIMIT_WARNING_MESSAGE(remaining, DAILY_STICKER_LIMIT),
      });
    }

    cleanTempFiles();
  } catch (error: any) {
    console.error('❌ Error processing image:', error);
    await sock.sendMessage(sender, {
      text: ERROR_MESSAGE,
    });
  }
};
