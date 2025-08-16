export const VIDEO_STICKER_CONFIG = {
  maxDuration: 10, // seconds
  maxFileSize: 50 * 1024 * 1024, // 50MB
  dimensions: {
    width: 512,
    height: 512,
  },
  fps: 60,
  quality: 'medium',
} as const;
