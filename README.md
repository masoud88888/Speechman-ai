# SpeechMan AI - Text-to-Speech (TTS) Generator

A production-ready, beautiful, and highly responsive English Text-to-Speech (TTS) web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**. It converts text into high-fidelity male speech using Google AI Studio's `gemini-3.1-flash-tts-preview` model via the official `@google/genai` SDK.

## Key Features

- **Text Inputs**: A responsive text input area complete with real-time character and word counters, quick-clear, and copy-to-clipboard functionality.
- **English-Only Male Voices**: Showcases the three prebuilt Gemini male voices (`Charon` (default Narrator), `Puck` (Energetic), and `Fenrir` (Gravelly)) with native, descriptive sub-cards while hiding female voices as specified.
- **Audio Controls**: Provides dynamic play, pause, resume, stop, and replay controls, as well as an interactive progress slider for real-time seek capability.
- **Voice Configurations**: Integrates sliders to adjust playback rate, volume, and simulated tone pitch in real-time.
- **Glassmorphic Theme**: A modern responsive design featuring a dark/light toggle and persistent settings saved in `localStorage`.
- **Local History Logs**: Saves the last 20 generated speeches in browser memory (`localStorage`), each supporting immediate playback, WAV download, and single item deletion.
- **Error Handling**: Graceful client and server-side validation to catch empty texts, API limits, or configuration issues.
- **Robust Security**: Uses a server-side proxy (`server.ts`) to manage API requests and keep `GEMINI_API_KEY` hidden from the client browser.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Animations), Lucide React (Icons)
- **Backend (API Proxy)**: Express v4 + tsx
- **GenAI SDK**: `@google/genai` (Official Google AI Studio SDK)
- **WAV Conversion**: A custom utility (`/src/utils/pcmToWav.ts`) that prefixes raw 24kHz 16-bit mono PCM streams with a valid 44-byte WAV header, making the output instantly playable by the browser's native Audio APIs and downloadable as standard `.wav` files.

---

## Installation & Setup

Follow these simple steps to run the application locally or in containers:

### 1. Install Dependencies

Install all package dependencies defined in `package.json`:

```bash
npm install
```

### 2. Configure Environment Variables

The platform automatically injects your `GEMINI_API_KEY` at runtime. If you are developing locally, create a `.env` file in the root directory and add your key:

```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

### 3. Run Development Server

Launch the full-stack development server:

```bash
npm run dev
```

The app will start on port `3000`. Open [http://localhost:3000](http://localhost:3000) in your browser to view it.

---

## Production Build & Start

Compile and bundle the frontend assets and backend server for high-performance deployment:

### 1. Build the Application

Build the static client files and compile the Express server into a single optimized CJS bundle using `esbuild`:

```bash
npm run build
```

This generates:
- Built static assets in `dist/`
- Compiled server file at `dist/server.cjs`

### 2. Start Production Server

Start the application in production mode:

```bash
npm start
```

---

## File Structure

```text
vox-gemini-tts/
├── dist/                  # Production build output
├── src/
│   ├── components/        # Modular UI components
│   │   ├── Header.tsx     # Branding & theme toggle
│   │   ├── TextInput.tsx  # Input area & counters
│   │   ├── VoiceSelector. # Male-only prebuilt voice selections
│   │   ├── SettingsPanel. # Sliders for volume, speed, & pitch
│   │   ├── AudioControls. # Speak, Play, Pause, Stop, Seek, & Download
│   │   ├── HistoryList.ts # Last 20 generated speech logs
│   │   └── Toast.tsx      # Slide-in notifications
│   ├── hooks/
│   │   └── useAudioPlayer # Custom HTML5 audio wrapper hook
│   ├── services/
│   │   └── googleTTS.ts   # Backend API fetch integration
│   ├── utils/
│   │   └── pcmToWav.ts    # PCM to WAV audio converter
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── App.tsx            # Main application orchestrator
│   ├── index.css          # Tailwind and font styles
│   └── main.tsx           # React entry point
├── server.ts              # Express server and Gemini SDK router
├── vite.config.ts         # Vite bundler configuration
└── package.json           # Scripts and package definitions
```
