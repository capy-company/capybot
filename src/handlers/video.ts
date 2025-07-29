import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { downloadMedia } from '../services/media';
import {
  processVideoToAnimatedSticker,
  isVideoFile,
  estimateStickerSize,
} from '../services/video';
import fs from 'fs';
import path from 'path';
import {
  ERROR_UNSUPPORTED_VIDEO_MESSAGE,
  ERROR_MAX_DURATION_VIDEO_MESSAGE,
  PROCESSING_VIDEO_MESSAGE,
  ERROR_VIDEO_MESSAGE,
} from '../constants/messages';
import { VIDEO_STICKER_CONFIG } from '../constants/config';

export const handleVideo = async (
  sock: WASocket,
  sender: string,
  msg: WAMessage
): Promise<void> => {
  const phoneNumber = sender.replace('@s.whatsapp.net', '');

  console.log(`🎬 Video received from ${phoneNumber}`);

  try {
    const videoMessage = msg.message?.videoMessage;
    if (!videoMessage || !isVideoFile(videoMessage.mimetype ?? '')) {
      await sock.sendMessage(sender, {
        text: ERROR_UNSUPPORTED_VIDEO_MESSAGE,
      });
      return;
    }

    const duration = videoMessage.seconds ?? 0;
    if (duration > VIDEO_STICKER_CONFIG.maxDuration) {
      await sock.sendMessage(sender, {
        text: ERROR_MAX_DURATION_VIDEO_MESSAGE,
      });
      return;
    }

    await sock.sendMessage(sender, {
      text: PROCESSING_VIDEO_MESSAGE,
    });

    console.log('⬇️ Downloading video...');
    const videoBuffer = await downloadMedia(msg);

    const tempDir = './temp';
    const timestamp = Date.now();
    const videoPath = path.join(tempDir, `video_${timestamp}.mp4`);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(videoPath, videoBuffer);

    try {
      const estimation = await estimateStickerSize(videoPath);
      console.log(
        `📊 Estimated size: ${Math.round(estimation.estimatedSize / 1024)}KB`
      );

      console.log('🎨 Converting to GIF...');
      const stickerBuffer = await processVideoToAnimatedSticker(videoPath);

      await sock.sendMessage(sender, {
        sticker: stickerBuffer,
      });

      console.log('✅ Animated sticker sent successfully!');
    } finally {
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log(`🗑️ Temporary files removed: ${videoPath}`);
      }
    }
  } catch (error) {
    console.error('❌ An error occurred while processing the video :', error);

    await sock.sendMessage(sender, {
      text: ERROR_VIDEO_MESSAGE,
    });
  }
};
