# Voice Typing — Speech to Text

Convert speech to text, instantly. A free, browser-based voice transcription tool powered by the Web Speech API. No server, no signup, no data leaves your device.

## Features

- **Cursor-aware insertion** — click anywhere in the text area and start speaking; your words appear exactly where the cursor is
- **Real-time preview** — see live in-progress transcription below the text area before it commits
- **Full editability** — type, delete, select, and paste alongside voice input; it's a normal text area with a voice superpower
- **Copy & Clear** — one-click copy of all text to clipboard, or clear the entire text area
- **Zero server** — everything runs in your browser via the Web Speech API; no audio is sent anywhere
- **Free** — no credits, no subscription, no "upgrade to pro"

## Browser Support

| Browser | Status |
|---|---|
| Chrome | ✅ Supported |
| Edge | ✅ Supported |
| Safari | ✅ Supported |
| Firefox | ❌ Not supported (no Web Speech API implementation) |

The app gracefully detects unsupported browsers and shows a fallback message.

## Built With

- [Next.js](https://nextjs.org/) 16
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (headings)
- [Geist](https://vercel.com/font) (UI text)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome, Edge, or Safari.

## Deploy on Vercel

The easiest way to deploy:

```bash
npm i -g vercel
vercel
```

Or connect your Git repository to [Vercel](https://vercel.com/new) for automatic deployments.

## Project Structure

```
app/
├── global.d.ts       # Web Speech API type declarations
├── globals.css       # Tailwind imports and theme variables
├── layout.tsx        # Root layout with font loading
└── page.tsx          # Main speech-to-text component
```

## How It Works

1. **Place your cursor** in the text area where you want text to appear
2. **Click "Start Listening"** — the browser requests microphone permission
3. **Speak** — speech is streamed to the `SpeechRecognition` API
4. **Final results** are spliced into the text at the saved cursor position
5. **Interim results** appear as a muted preview below the text area
6. **Move the cursor anytime** — subsequent speech lands at the new position

All recognition runs locally in your browser. No data leaves your device.
