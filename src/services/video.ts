import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { VIDEO_STICKER_CONFIG } from '../constants/config';

const SQUARE_TOLERANCE = 0.1;

export const processVideoToAnimatedStickers = async (
  videoPath: string
): Promise<{ square?: Buffer; original?: Buffer }> => {
  const tempDir = path.resolve('./temp');
  const timestamp = Date.now();

  const squareOutputPath = path.resolve(
    tempDir,
    `sticker_square_${timestamp}.webp`
  );
  const originalOutputPath = path.resolve(
    tempDir,
    `sticker_original_${timestamp}.webp`
  );

  try {
    console.log('🎬 Starting video processing for both formats...');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const videoInfo = await validateVideoForSticker(videoPath);
    const aspectRatio = videoInfo.width / videoInfo.height;
    const isSquare = Math.abs(aspectRatio - 1) <= SQUARE_TOLERANCE;

    if (isSquare) {
      console.log('🔲 Video is already square, creating single sticker...');
      const squareOutputPath = path.resolve(
        tempDir,
        `sticker_${timestamp}.webp`
      );

      await processVideoWithFFmpeg(videoPath, squareOutputPath, 'square');
      const squareBuffer = fs.readFileSync(squareOutputPath);

      if (fs.existsSync(squareOutputPath)) {
        fs.unlinkSync(squareOutputPath);
      }

      console.log(`✅ Single sticker created: ${squareBuffer.length} bytes`);

      return {
        square: squareBuffer,
      };
    }

    // Process square sticker (512x512)
    console.log('🔲 Processing square sticker...');
    await processVideoWithFFmpeg(videoPath, squareOutputPath, 'square');

    // Process original format sticker
    console.log('📐 Processing original format sticker...');
    await processVideoWithFFmpeg(videoPath, originalOutputPath, 'original');

    const squareBuffer = fs.readFileSync(squareOutputPath);
    const originalBuffer = fs.readFileSync(originalOutputPath);

    // Clean temporary files
    if (fs.existsSync(squareOutputPath)) {
      fs.unlinkSync(squareOutputPath);
    }
    if (fs.existsSync(originalOutputPath)) {
      fs.unlinkSync(originalOutputPath);
    }

    console.log(
      `✅ Both stickers created: Square ${(squareBuffer.length / 1024).toFixed(2)} KB, Original ${(originalBuffer.length / 1024).toFixed(2)} KB`
    );

    return {
      square: squareBuffer,
      original: originalBuffer,
    };
  } catch (error: any) {
    console.error('❌ Error processing video:', error);
    throw new Error(`Video processing failed: ${error?.message}`);
  }
};

const processVideoWithFFmpeg = (
  inputPath: string,
  outputPath: string,
  format: 'square' | 'original'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Processing ${format} format...`);

    let videoFilter: string;

    if (format === 'square') {
      // Square format, cropping to 1:1 aspect ratio
      videoFilter =
        'scale=512:512:force_original_aspect_ratio=increase,crop=512:512';
    } else {
      // Use pad filter to add transparent padding while preserving aspect ratio
      videoFilter =
        'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
    }

    ffmpeg(inputPath)
      .fps(VIDEO_STICKER_CONFIG.fps)
      .duration(VIDEO_STICKER_CONFIG.maxDuration)
      .outputOptions([
        '-c:v libwebp_anim',
        '-pix_fmt yuva420p', // Best pixel format for cross-platform compatibility
        `-vf ${videoFilter},fps=12`, // 12 FPS for good balance of smoothness and size
        '-loop 0',
        '-an', // No audio
        '-preset default',
        '-quality 50', // Balanced quality for good visual result
        '-compression_level 6', // Higher compression for smaller files
        '-qmin 10', // Lower minimum quality threshold
        '-qmax 50', // Higher maximum quality threshold
        '-method 6', // Best compression method (slower but smaller)
        '-metadata:s:v:0 alpha_mode=1', // Ensure alpha channel metadata for transparency
        '-f webp',
      ])
      .output(outputPath)
      .format('webp')
      .on('start', (commandLine: string) => {
        console.log(`🔄 FFmpeg ${format}:`, commandLine);
      })
      .on('progress', (progress: any) => {
        console.log(
          `📊 ${format} progress: ${Math.round(progress.percent || 0)}%`
        );
      })
      .on('end', () => {
        console.log(`✅ ${format} sticker completed`);
        resolve();
      })
      .on('error', (error: any) => {
        console.error(`❌ FFmpeg ${format} error:`, error);
        reject(error);
      })
      .run();
  });
};

const validateVideoForSticker = async (
  videoPath: string
): Promise<{
  width: number;
  height: number;
  duration: number;
  fileSize: number;
}> => {
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

      const duration = metadata.format.duration ?? 0;
      if (duration > VIDEO_STICKER_CONFIG.maxDuration) {
        reject(
          new Error(
            `Video too long. Maximum: ${VIDEO_STICKER_CONFIG.maxDuration}s`
          )
        );
        return;
      }

      const fileSize = metadata.format.size ?? 0;
      if (fileSize > VIDEO_STICKER_CONFIG.maxFileSize) {
        reject(new Error('File too large. Maximum: 50MB'));
        return;
      }

      const width = videoStream.width ?? 0;
      const height = videoStream.height ?? 0;

      console.log(
        `📐 Video valid: ${width}x${height}, ${duration}s, ${Math.round(fileSize / 1024)}KB`
      );

      resolve({
        width,
        height,
        duration,
        fileSize,
      });
    });
  });
};

export const optimizeVideoForProcessing = async (
  inputPath: string,
  outputPath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(' Optimizing vídeo...');

    ffmpeg(inputPath)
      .size('720x720')
      .fps(15)
      .duration(VIDEO_STICKER_CONFIG.maxDuration)
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 28',
        '-an', // Remove audio
      ])

      .output(outputPath)
      .on('end', () => {
        console.log('✅ Video optimized');
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
    'video/x-msvideo',
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

      const estimatedSize = totalFrames * 2 * 1024;

      resolve({
        estimatedSize,
        duration,
        fps,
      });
    });
  });
};
