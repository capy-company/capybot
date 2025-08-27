import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import {
  HELP_MESSAGE,
  ABOUT_MESSAGE,
  DEFAULT_MESSAGE,
  USAGE_STATUS_MESSAGE,
} from '../constants/messages';
import {
  getUserStickerCount,
  getRemainingStickers,
} from '../services/rate-limit';
import { DAILY_STICKER_LIMIT } from '../constants/config';

export const handleText = async (
  sock: WASocket,
  sender: string,
  msg: WAMessage
): Promise<void> => {
  const phoneNumber = sender.replace('@s.whatsapp.net', '');
  const text = (
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    ''
  ).toLowerCase();

  console.log(`📝 Text received from ${phoneNumber}: ${text}`);

  let response: string;

  if (text.includes('/help') || text.includes('ajuda')) {
    response = HELP_MESSAGE;
  } else if (text.includes('/about') || text.includes('sobre')) {
    response = ABOUT_MESSAGE;
  } else if (text.includes('/status') || text.includes('status')) {
    const used = getUserStickerCount(phoneNumber);
    const remaining = getRemainingStickers(phoneNumber);
    response = USAGE_STATUS_MESSAGE(used, remaining, DAILY_STICKER_LIMIT);
  } else {
    response = DEFAULT_MESSAGE;
  }

  await sock.sendMessage(sender, { text: response });
  console.log('✅ Text response sent');
};
