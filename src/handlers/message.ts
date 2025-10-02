import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { handleText } from './text';
import { handleImage } from './image';
import { handleVideo } from './video';
import {
  DAILY_LIMIT_WARNING_MESSAGE,
  DEFAULT_MESSAGE,
  ERROR_MESSAGE,
  MAINTENANCE_MESSAGE,
} from '../constants/messages';
import {
  isUserNotifiedMaintenance,
  markUserAsNotified,
  checkMaintenanceModeChange,
} from '../services/maintenance';
import { DAILY_STICKER_LIMIT, MAINTENANCE_MODE } from '../constants/config';
import { getRemainingStickers } from '../services/rate-limit';

export const handleMessage = async (
  sock: WASocket,
  msg: WAMessage
): Promise<void> => {
  const sender = msg.key.remoteJid as string;

  try {
    const isMaintenanceMode = MAINTENANCE_MODE;

    checkMaintenanceModeChange(isMaintenanceMode);

    if (isMaintenanceMode) {
      // If user hasn't been notified yet, send maintenance message
      if (!isUserNotifiedMaintenance(sender)) {
        await sock.sendMessage(sender, {
          text: MAINTENANCE_MESSAGE,
        });
        markUserAsNotified(sender);
        console.log(`🔧 Maintenance message sent to: ${sender}`);
      }
      return;
    }

    const phoneNumber = sender.replace('@s.whatsapp.net', '');
    const remaining = getRemainingStickers(phoneNumber);

    const messageType = getMessageType(msg);

    switch (messageType) {
      case 'text':
        await handleText(sock, sender, msg);
        break;

      case 'image':
        if (remaining <= 0) {
          await sock.sendMessage(sender, {
            text: DAILY_LIMIT_WARNING_MESSAGE(remaining, DAILY_STICKER_LIMIT),
          });
          return;
        }
        await handleImage(sock, sender, msg);
        break;

      case 'video':
        if (remaining <= 0) {
          await sock.sendMessage(sender, {
            text: DAILY_LIMIT_WARNING_MESSAGE(remaining, DAILY_STICKER_LIMIT),
          });
          return;
        }
        await handleVideo(sock, sender, msg);
        break;

      default:
        if (!msg.message?.associatedChildMessage) {
          await sock.sendMessage(sender, {
            text: DEFAULT_MESSAGE,
          });
        }
        break;
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await sock.sendMessage(sender, {
      text: ERROR_MESSAGE,
    });
  }
};

const getMessageType = (msg: WAMessage): string => {
  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
    return 'text';
  } else if (msg.message?.imageMessage) {
    return 'image';
  } else if (msg.message?.videoMessage) {
    return 'video';
  } else {
    return 'unknown';
  }
};
