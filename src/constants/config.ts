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

export const MAINTENANCE_MODE =
  process.env.MAINTENANCE_MODE === 'true' || false;

export const DAILY_STICKER_LIMIT =
  Number(process.env.DAILY_STICKER_LIMIT) || 10;
