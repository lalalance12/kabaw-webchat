# Kabaw WebChat - React Frontend

A modern React single-page application for real-time WebSocket messaging, built for the Kabaw Chat technical evaluation.

## 🚀 Features

- **Real-time WebSocket Communication**: Connect to `ws://localhost:8080/ws` for live messaging
- **Auto-reconnection**: Automatically attempts to reconnect on disconnect (up to 5 attempts)
- **Modern UI**: Glassmorphism design with smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Console Logging**: Full logging of WebSocket events in browser console

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- The Kabaw WebSocket server running on `localhost:8080`

## 🛠️ Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kabaw-webchat

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`

## 🔌 Connecting to the WebSocket Server

1. **Start the WebSocket server** (in the kabaw-sockets folder):
   ```bash
   go run main.go
   ```

2. **Start this React app**:
   ```bash
   npm run dev
   ```

3. **Open the app** at `http://localhost:5173/`

4. **Enter your username** and channel (defaults to "general")

5. **Click "Connect to WebSocket"** to start chatting!

## 🏗️ Project Structure

```
kabaw-webchat/
├── src/
│   ├── components/
│   │   ├── ChatContainer.tsx    # Main chat orchestration
│   │   ├── ConnectionStatus.tsx # WebSocket status indicator
│   │   ├── MessageInput.tsx     # Message input form
│   │   ├── MessageList.tsx      # Chat message display
│   │   └── index.ts             # Barrel exports
│   ├── hooks/
│   │   └── useWebSocket.ts      # Custom WebSocket hook
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind + custom styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Dark | `#0B3A66` | Darker backgrounds, shadows |
| Primary | `#0D3B66` | Headers, primary elements |
| Accent Dark | `#2BB673` | Button gradients |
| Accent | `#2ECC71` | Highlights, success states |

## 💬 Console Logging

The app logs all WebSocket activity to the browser console:

- `[FRONTEND-CONNECT]` - Connection attempts and success
- `[FRONTEND-MESSAGE]` - Incoming messages (JSON formatted)
- `[FRONTEND-SEND]` - Outgoing messages
- `[FRONTEND-DISCONNECT]` - Disconnection events
- `[FRONTEND-USER-ID]` - User ID assignment from server
- `[FRONTEND-ERROR]` - Connection errors
- `[FRONTEND-RECONNECT]` - Reconnection attempts

## 🧪 Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling with @theme tokens
- **Native WebSocket API** - Real-time communication

## 📝 License

This project was created for the Kabaw Chat technical evaluation.
