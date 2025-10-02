/**
 * Service to manage the bot's maintenance mode
 * Controls which users have already received the maintenance message
 */

// Set to store IDs of users who have already received the maintenance message
const usersNotifiedMaintenance = new Set<string>();

// Variable to track previous maintenance mode state
let previousMaintenanceMode: boolean | null = null;

/**
 * Checks if a user has already been notified about maintenance
 * @param userId - User ID (remoteId)
 * @returns true if user has been notified, false otherwise
 */
export const isUserNotifiedMaintenance = (userId: string): boolean => {
  return usersNotifiedMaintenance.has(userId);
};

/**
 * Marks a user as notified about maintenance
 * @param userId - User ID (remoteId)
 */
export const markUserAsNotified = (userId: string): void => {
  usersNotifiedMaintenance.add(userId);
};

/**
 * Removes a user from the notified list (used when exiting maintenance mode)
 * @param userId - User ID (remoteId)
 */
export const removeUserFromNotified = (userId: string): void => {
  usersNotifiedMaintenance.delete(userId);
};

/**
 * Clears all notified users (used when exiting maintenance mode)
 */
export const clearAllNotifications = (): void => {
  usersNotifiedMaintenance.clear();
};

/**
 * Returns the number of users that have been notified
 */
export const getNotifiedUsersCount = (): number => {
  return usersNotifiedMaintenance.size;
};

/**
 * Checks if maintenance mode has changed and clears notifications if needed
 * @param currentMaintenanceMode - Current maintenance mode state
 */
export const checkMaintenanceModeChange = (
  currentMaintenanceMode: boolean
): void => {
  // If this is the first check, just set the previous state
  if (previousMaintenanceMode === null) {
    previousMaintenanceMode = currentMaintenanceMode;
    return;
  }

  // If maintenance mode was disabled (was true, now false)
  if (previousMaintenanceMode === true && currentMaintenanceMode === false) {
    clearAllNotifications();
    console.log(
      '🔧 Maintenance mode disabled. Cleared all user notifications.'
    );
  }

  // If maintenance mode was enabled (was false, now true)
  if (previousMaintenanceMode === false && currentMaintenanceMode === true) {
    console.log('🔧 Maintenance mode enabled.');
  }

  // Update previous state
  previousMaintenanceMode = currentMaintenanceMode;
};
