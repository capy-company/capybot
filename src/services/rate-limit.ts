import { DAILY_STICKER_LIMIT } from '../constants/config';

interface UserStickerUsage {
  count: number;
  lastReset: number;
}

// Storage for user usage data
const userUsage = new Map<string, UserStickerUsage>();

/**
 * Gets start of day timestamp (00:00:00)
 */
const getStartOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Checks if user has exceeded daily sticker limit
 */
export const canCreateSticker = (phoneNumber: string): boolean => {
  const now = Date.now();
  const today = getStartOfDay(now);

  const usage = userUsage.get(phoneNumber);

  // If no usage record or it's a new day, user can create sticker
  if (!usage || usage.lastReset < today) {
    return true;
  }

  // Check if user has exceeded limit
  return usage.count < DAILY_STICKER_LIMIT;
};

/**
 * Records that user has created a sticker
 */
export const recordStickerCreation = (phoneNumber: string): void => {
  const now = Date.now();
  const today = getStartOfDay(now);

  const usage = userUsage.get(phoneNumber);

  if (!usage || usage.lastReset < today) {
    // New day or new user, reset count
    userUsage.set(phoneNumber, {
      count: 1,
      lastReset: today,
    });
  } else {
    // Same day, increment count
    usage.count++;
    userUsage.set(phoneNumber, usage);
  }

  console.log(
    `📊 User ${phoneNumber} sticker count: ${getUserStickerCount(phoneNumber)}/${DAILY_STICKER_LIMIT}`
  );
};

/**
 * Gets current sticker count for user today
 */
export const getUserStickerCount = (phoneNumber: string): number => {
  const now = Date.now();
  const today = getStartOfDay(now);

  const usage = userUsage.get(phoneNumber);

  if (!usage || usage.lastReset < today) {
    return 0;
  }

  return usage.count;
};

/**
 * Gets remaining stickers for user today
 */
export const getRemainingStickers = (phoneNumber: string): number => {
  return Math.max(0, DAILY_STICKER_LIMIT - getUserStickerCount(phoneNumber));
};

/**
 * Cleans up old usage data (older than 2 days)
 */
export const cleanupOldUsageData = (): void => {
  const twoDaysAgo = getStartOfDay(Date.now()) - 2 * 24 * 60 * 60 * 1000;

  for (const [phoneNumber, usage] of userUsage.entries()) {
    if (usage.lastReset < twoDaysAgo) {
      userUsage.delete(phoneNumber);
      console.log(`🗑️ Cleaned up old usage data for ${phoneNumber}`);
    }
  }
};

// Initialize and log the daily limit
console.log(
  `📊 Rate limit service initialized with daily limit: ${DAILY_STICKER_LIMIT}`
);

// Cleanup old data every hour
setInterval(cleanupOldUsageData, 60 * 60 * 1000);
