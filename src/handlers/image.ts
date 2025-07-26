import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { processImageToSticker } from '../services/image';
import {
  ERROR_MESSAGE,
  UNSUPPORTED_MESSAGE,
  PROCESSING_MESSAGE,
} from '../constants/messages';
import {
  downloadMedia,
  isSupportedForSticker,
  cleanTempFiles,
} from '../services/media';

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

    await sock.sendMessage(sender, {
      text: PROCESSING_MESSAGE,
    });

    console.log('🎨 Processing image...');
    const imageBuffer = await downloadMedia(msg);

    console.log('🎨 Converting to sticker...');
    const stickerBuffer = await processImageToSticker(imageBuffer);

    await sock.sendMessage(sender, {
      sticker: stickerBuffer,
    });

    console.log('✅ Sticker sent successfully!');

    cleanTempFiles();
  } catch (error) {
    console.error('❌ Error processing image:', error);
    await sock.sendMessage(sender, {
      text: ERROR_MESSAGE,
    });
  }
};
