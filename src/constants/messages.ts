import { VIDEO_STICKER_CONFIG } from '../constants/config';
export const HELP_MESSAGE = `🤖 *CapyBot - Ajuda*

📸 *Como usar:*
- Envie uma imagem que eu transformo em figurinha!
- Envie um vídeo (até ${VIDEO_STICKER_CONFIG.maxDuration}s) que eu transformo em GIF animado!

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
