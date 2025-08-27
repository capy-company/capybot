import { DAILY_STICKER_LIMIT, WHITE_LIST } from '../constants/config';

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
    `📊 User ${phoneNumber} sticker count: ${usage?.count ?? 0}/${DAILY_STICKER_LIMIT}`
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
  if (WHITE_LIST.includes(phoneNumber)) {
    return 1000;
  }

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
