import {
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import { handleMessage } from './handlers/message';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'info' }),
    version,
  });

  sock.ev.on('creds.update', saveCreds);

  // Handle QR code generation
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('--------------------------------');
      console.log(qr);
      console.log('--------------------------------');
      console.log('QR Code received, scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('✅ CapyBot connected successfully!');
      console.log('🎉 Send a message to test!');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
      console.log('❌ Connection closed:', lastDisconnect);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (msg && !msg.key.fromMe) {
      await handleMessage(sock, msg);
    }
  });
}

startBot();
