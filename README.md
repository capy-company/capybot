# CapyBot

<div align="center">
  <img src="assets/capy_logo.png" alt="CapyBot Logo" width="200">
</div>

CapyBot is a WhatsApp bot that can create stickers. It's built with TypeScript and uses the Baileys library for WhatsApp Web API integration.

## Features

- **Image Stickers**: Convert images to WhatsApp stickers
- **Video Stickers**: Create animated stickers from videos (max 15 seconds)
- **Media Processing**: Support for various image and video formats
- **Real-time Messaging**: Handle incoming WhatsApp messages automatically
- **QR Code Authentication**: Easy setup with QR code scanning

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **FFmpeg** (for video processing)

### Installing FFmpeg

#### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Using MacPorts
sudo port install ffmpeg
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows

Download from [FFmpeg official website](https://ffmpeg.org/download.html) or use Chocolatey:

```bash
choco install ffmpeg
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/capy-company/capybot.git
   cd capybot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## Running the Bot

### Development Mode

For development with hot reload:

```bash
npm run dev
```

### Production Mode

First build, then run:

```bash
npm run build
npm start
```

### Alternative Development Commands

```bash
# Using ts-node with watch mode
npm run dev:node

# Using tsx (recommended for development)
npm run dev
```

## First Time Setup

1. **Start the bot** using one of the commands above
2. **Scan the QR code** that appears in your terminal with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Scan the QR code displayed in your terminal
3. **Wait for connection** - you should see "✅ CapyBot connected successfully!" in your terminal
4. Send a message to your own number (if you're using your own WhatsApp account) or to the number to which you've linked the bot.

## Project Structure

```
capybot/
├── src/
│   ├── bot.ts              # Main bot entry point
│   ├── constants/           # Configuration constants
│   ├── handlers/            # Message and media handlers
│   ├── services/            # Media processing services
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── auth_info/               # WhatsApp authentication data (auto-generated)
├── temp/                    # Temporary media files
├── dist/                    # Compiled JavaScript files
└── package.json
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled bot
- `npm run dev` - Run in development mode with hot reload
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run quality` - Run lint, format check, and build
- `npm run clean` - Remove compiled files

## Configuration

The bot uses default configurations for media processing. You can modify these in `src/constants/config.ts`:

- **Video Stickers**: Max 15 seconds, 50MB file size
- **Dimensions**: 512x512 pixels
- **FPS**: 60 frames per second
- **Quality**: Medium

### Sticker settings

Sticker creation settings are located in `src/constants/config.ts`. You can adjust:

- Maximum sticker size (dimensions and/or file size)
- Sticker quality

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Make sure FFmpeg is installed and accessible in your PATH
   - Restart your terminal after installation

2. **Authentication issues**
   - Delete the `auth_info/` folder and restart the bot
   - Scan the new QR code

3. **Port conflicts**
   - The bot doesn't use specific ports, but ensure no other WhatsApp Web sessions are active

4. **Media processing errors**
   - Check file formats and sizes
   - Ensure FFmpeg is properly installed

## Development

### Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

### TypeScript

- Strict mode enabled
- ES2022 target
- ESNext modules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `npm run quality`
5. Commit your changes
6. Push to your branch
7. Create a pull request

## Upcoming Features

- [ ] - Rate limiting:
  - Limit the number of stickers per minute.
  - Implement spam prevention mechanisms.
- [ ] - Media enhancements:
  - Research maximum sticker size limits.
  - Background removal for images
  - Text-to-sticker generation
- [ ] - Performance optimizations
  - Queue system for processing stickers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- [Letícia Alexandre](https://github.com/leticiafrontend)
- [Carolina de Moraes](https://github.com/CarolinaMoraes)

## Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This bot is for personal use. Please respect WhatsApp's terms of service and use responsibly.
