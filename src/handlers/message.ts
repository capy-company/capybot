import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { handleText } from './text';
import { handleImage } from './image';
import { handleVideo } from './video';
import { DEFAULT_MESSAGE, ERROR_MESSAGE } from '../constants/messages';

export const handleMessage = async (
  sock: WASocket,
  msg: WAMessage
): Promise<void> => {
  const sender = msg.key.remoteJid as string;

  try {
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
        await sock.sendMessage(sender, {
          text: DEFAULT_MESSAGE,
        });
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
