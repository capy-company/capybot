import { DAILY_STICKER_LIMIT, VIDEO_STICKER_CONFIG } from '../constants/config';
export const HELP_MESSAGE = `🤖 *CapyBot - Ajuda*

📸 *Como usar:*
- Envie uma imagem que eu transformo em figurinha!
- Envie um vídeo (até ${VIDEO_STICKER_CONFIG.maxDuration}s) que eu transformo em GIF animado!

📊 *Limite diário:*
- Cada usuário pode criar até ${DAILY_STICKER_LIMIT} figurinhas por dia
- O limite é renovado às 00:00 (meia-noite)

❓ *Comandos:*
- /help - Esta mensagem
- /about - Sobre o bot
- /status - Verificar seu uso diário`;

export const ABOUT_MESSAGE = `*Sobre o CapyBot*

Transformo suas fotos em figurinhas incríveis!

Feito com ❤️ por Letícia Alexandre e Carolina de Moraes!`;

export const DEFAULT_MESSAGE =
  '🤖 Olá! Envie uma imagem que eu transformo em figurinha!\n\nDigite /help para mais informações.';

export const ERROR_MESSAGE =
  '😅 Ops! Erro ao processar sua imagem. Tente novamente mais tarde.';

export const UNSUPPORTED_MESSAGE =
  '😅 Ops! Tipo de arquivo não suportado. Envie uma imagem (JPG, PNG, WEBP).';

export const PROCESSING_MESSAGE =
  '🎨 Processando sua imagem... Aguarde um momento!';

export const ERROR_UNSUPPORTED_VIDEO_MESSAGE =
  '❌ Formato de vídeo não suportado.\n\nFormatos aceitos: MP4, MOV, AVI, WebM';

export const ERROR_MAX_DURATION_VIDEO_MESSAGE = `⏰ Vídeo muito longo!

⚡ *Máximo aceito:* ${VIDEO_STICKER_CONFIG.maxDuration}s

✂️ *Dica:* Corte seu vídeo para ${VIDEO_STICKER_CONFIG.maxDuration} segundos ou menos e envie novamente.`;

export const PROCESSING_VIDEO_MESSAGE = `🎬 Processando vídeo para GIF animado...\n\n⏳ Isso pode levar 30-60 segundos, aguarde!`;

export const ERROR_VIDEO_MESSAGE = `😅 Ops! Erro ao processar seu vídeo.\n\n💡 *Dicas:*\n• Vídeos até ${VIDEO_STICKER_CONFIG.maxDuration} segundos\n• Formatos: MP4, MOV\n• Tamanho máximo: 50MB\n\nTente novamente! 🎯`;

export const MAINTENANCE_MESSAGE = `🔧 *CapyBot em Manutenção*

Estamos realizando uma manutenção para melhorar sua experiência!

🕐 *Voltamos em breve*
Aguarde um pouco e tente novamente mais tarde.

Obrigado pela compreensão! 💙`;

export const DAILY_LIMIT_REACHED_MESSAGE = (remaining: number, limit: number) =>
  `🚫 *Limite diário de figurinhas atingido!*

📊 *Você já criou:* ${limit - remaining}/${limit} figurinhas hoje

⏰ *Limite renovado:* Às 00:00 (meia-noite)

💡 *Dica:* Volte amanhã para criar mais figurinhas incríveis! 🎨`;

export const DAILY_LIMIT_WARNING_MESSAGE = (remaining: number, limit: number) =>
  `⚠️ *Atenção!* Você tem apenas ${remaining} sticker${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'} hoje.

📊 *Uso atual:* ${limit - remaining}/${limit} figurinhas

⏰ *Limite renovado:* Às 00:00 (meia-noite)`;

export const USAGE_STATUS_MESSAGE = (
  used: number,
  remaining: number,
  limit: number
) =>
  `📊 *Status do seu uso diário*

✅ *Figurinhas criadas hoje:* ${used}/${limit}
🎯 *Figurinhas restantes:* ${remaining}

⏰ *Limite renovado:* Às 00:00 (meia-noite)

${remaining === 0 ? '🚫 *Limite atingido!* Volte amanhã para criar mais figurinhas.' : remaining <= 2 ? '⚠️ *Quase no limite!* Use com moderação.' : '🟢 *Você ainda tem bastante espaço!*'}`;
