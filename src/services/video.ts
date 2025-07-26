import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const VIDEO_STICKER_CONFIG = {
  maxDuration: 10, // seconds
  maxFileSize: 500 * 1024, // 500KB
  dimensions: {
    width: 512,
    height: 512,
  },
  fps: 60,
  quality: 'medium',
} as const;

export async function processVideoToAnimatedSticker(
  videoPath: string,
  outputPath?: string
): Promise<Buffer> {
  const tempDir = './temp';
  const timestamp = Date.now();
  const tempOutputPath =
    outputPath || path.join(tempDir, `sticker_${timestamp}.webp`);

  try {
    console.log('🎬 Iniciando processamento de vídeo para sticker animado...');

    // Garantir que pasta temp existe
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 1. Validar vídeo
    await validateVideoForSticker(videoPath);

    // 2. Processar vídeo com FFmpeg
    await processVideoWithFFmpeg(videoPath, tempOutputPath);

    // 3. Ler resultado
    const stickerBuffer = fs.readFileSync(tempOutputPath);

    // 4. Limpar arquivo temporário
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }

    console.log(`✅ Sticker animado criado: ${stickerBuffer.length} bytes`);
    return stickerBuffer;
  } catch (error) {
    console.error('❌ Erro ao processar vídeo:', error);
    throw new Error(`Falha no processamento do vídeo: ${error.message}`);
  }
}

const processVideoWithFFmpeg = (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .size('512x512')
      .aspect('1:1')
      .autopad(true, 'black')

      .fps(VIDEO_STICKER_CONFIG.fps)
      .duration(VIDEO_STICKER_CONFIG.maxDuration)

      .outputOptions([
        '-vcodec libwebp',
        '-vf scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2',
        '-loop 0', // Infinite loop
        '-preset default',
        '-an', // No audio
        '-vsync 0',
        '-q:v 75', // Quality (0-100, lower = better quality)
      ])
      .output(outputPath)
      .format('webp')

      // Event handlers
      .on('start', commandLine => {
        console.log('🔄 FFmpeg started:', commandLine);
      })
      .on('progress', progress => {
        console.log(`📊 Progress: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', () => {
        console.log('✅ FFmpeg processing completed');
        resolve();
      })
      .on('error', error => {
        console.error('❌ FFmpeg error:', error);
        reject(error);
      })
      .run();
  });
};

const validateVideoForSticker = async (videoPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (error, metadata) => {
      if (error) {
        reject(new Error(`Error analyzing video: ${error.message}`));
        return;
      }

      const videoStream = metadata.streams.find(
        stream => stream.codec_type === 'video'
      );

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      // Verificar duração
      const duration = metadata.format.duration ?? 0;
      if (duration > VIDEO_STICKER_CONFIG.maxDuration) {
        reject(
          new Error(
            `Video too long. Maximum: ${VIDEO_STICKER_CONFIG.maxDuration}s`
          )
        );
        return;
      }

      // Verificar tamanho do arquivo
      const fileSize = metadata.format.size ?? 0;
      if (fileSize > 50 * 1024 * 1024) {
        // 50MB max input
        reject(new Error('File too large. Maximum: 50MB'));
        return;
      }

      console.log(
        ` Video valid: ${duration}s, ${Math.round(fileSize / 1024)}KB`
      );
      resolve();
    });
  });
};

export const optimizeVideoForProcessing = async (
  inputPath: string,
  outputPath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(' Otimizando vídeo...');

    ffmpeg(inputPath)
      // Reduzir resolução se muito grande
      .size('720x720')
      .fps(15)
      .duration(VIDEO_STICKER_CONFIG.maxDuration)

      // Codec eficiente
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 28',
        '-an', // Remove áudio
      ])

      .output(outputPath)
      .on('end', () => {
        console.log(' Video optimized');
        resolve(outputPath);
      })
      .on('error', reject)
      .run();
  });
};

export const isVideoFile = (mimetype: string): boolean => {
  const videoMimetypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // AVI
    'video/webm',
  ];

  return videoMimetypes.includes(mimetype);
};

export const estimateStickerSize = async (
  videoPath: string
): Promise<{
  estimatedSize: number;
  duration: number;
  fps: number;
}> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }

      const duration = Math.min(
        metadata.format.duration || 0,
        VIDEO_STICKER_CONFIG.maxDuration
      );
      const fps = VIDEO_STICKER_CONFIG.fps;
      const totalFrames = duration * fps;

      // Estimativa grosseira: ~2KB por frame para WebP
      const estimatedSize = totalFrames * 2 * 1024;

      resolve({
        estimatedSize,
        duration,
        fps,
      });
    });
  });
};
