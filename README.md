# Asteroids (Fullscreen, Sprites, No Build)

Vanilla JS/Canvas Asteroids with fullscreen mode, sprite sheet, themes, and mobile controls.

## Features
- Fullscreen canvas with starfield and screenshake
- Sprite sheet for ship, thrust, bullet, and asteroids (`assets/sprites.png`)
- Themes (Neon / Amber / Classic) via CSS variables
- Mute toggle for WebAudio
- Mobile/touch controls (rotate/thrust/fire/hyperspace)

## Run locally
Any static server works:

```bash
# Python
python -m http.server 5173
# Node (serve)
npx serve .
```

Then open: http://localhost:5173/

> Tip: Opening modules directly from `file://` will fail in most browsers. Serve over HTTP.

## Deploy
- **Netlify**: drag the folder to https://app.netlify.com/drop
- **GitHub Pages**: Settings → Pages → Branch = `main` (root)

## Controls
- Keyboard: ←/→ rotate, ↑ thrust, Space fire, Shift hyperspace
- Touch: on-screen buttons (tap-and-hold for rotate/thrust)
