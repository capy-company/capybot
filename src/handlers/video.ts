import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { downloadMedia } from '../services/media';
import {
  processVideoToAnimatedSticker,
  isVideoFile,
  estimateStickerSize,
} from '../services/video';
import fs from 'fs';
import path from 'path';

export async function handleVideo(
  sock: WASocket,
  sender: string,
  msg: WAMessage
): Promise<void> {
  const phoneNumber = sender.replace('@s.whatsapp.net', '');

  console.log(`🎬 Video received from ${phoneNumber}`);

  try {
    const videoMessage = msg.message?.videoMessage;
    if (!videoMessage || !isVideoFile(videoMessage.mimetype ?? '')) {
      await sock.sendMessage(sender, {
        text: '❌ Formato de vídeo não suportado.\n\nFormatos aceitos: MP4, MOV, AVI, WebM',
      });
      return;
    }

    const duration = videoMessage.seconds ?? 0;
    if (duration > 10) {
      await sock.sendMessage(sender, {
        text: `⏰ Vídeo muito longo!

📏 *Duração atual:* ${duration}s
⚡ *Máximo aceito:* 10s

✂️ *Dica:* Corte seu vídeo para 10 segundos ou menos e envie novamente.`,
      });
      return;
    }

    await sock.sendMessage(sender, {
      text: '🎬 Processando vídeo para GIF animado...\n\n⏳ Isso pode levar 30-60 segundos, aguarde!',
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

    const errorMessage = '😅 Ops! Erro ao processar seu vídeo.';

    await sock.sendMessage(sender, {
      text: `${errorMessage}\n\n💡 *Dicas:*\n• Vídeos até 10 segundos\n• Formatos: MP4, MOV\n• Tamanho máximo: 50MB\n\nTente novamente! 🎯`,
    });
  }
}
