import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { handleText } from './text';
import { handleImage } from './image';
import { handleVideo } from './video';
import {
  DEFAULT_MESSAGE,
  ERROR_MESSAGE,
  MAINTENANCE_MESSAGE,
} from '../constants/messages';
import {
  isUserNotifiedMaintenance,
  markUserAsNotified,
  checkMaintenanceModeChange,
} from '../services/maintenance';
import { MAINTENANCE_MODE } from '../constants/config';

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

    const messageType = getMessageType(msg);

    switch (messageType) {
      case 'text':
        await handleText(sock, sender, msg);
        break;

      case 'image':
        await handleImage(sock, sender, msg);
        break;

      case 'video':
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
