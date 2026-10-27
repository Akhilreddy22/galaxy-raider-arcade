# Galaxy Raider - Retro Arcade Space Shooter 🚀👾

A fast-paced, retro synthwave arcade space shooter built with pure **HTML5 Canvas**, **JavaScript (ES6+)**, and the **Web Audio API**. Zero dependencies, lightning-fast 60 FPS performance, procedural retro sound effects, particle physics, and responsive controls for desktop and mobile.

---

## 🎮 Play the Game

### Run Locally:
```bash
# Using Python built-in HTTP server:
cd galaxy-raider-game
python3 -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

### Deploy Free to GitHub Pages:
1. Go to your repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Branch**, select `main` and `/ (root)`.
3. Click **Save** — your game will be live online in 60 seconds!

---

## ✨ Features

- **Procedural Synthesizer Sound Engine**:
  - Uses the native browser **Web Audio API** to synthesize retro 8-bit laser blasts, explosions, power-up chimes, and alarms dynamically without needing external `.mp3` files.
- **Weapon & Power-Up System**:
  - **Single Laser** -> **Dual Lasers** -> **Triple Spread Plasma** -> **Quad-Beam Supercannon**.
  - **Shield Boost (S)**: Restores ship shields and activates temporary energy barriers.
  - **Nuke Bomb (B)**: Screen-clearing EMP blast vaporizing enemy bullets and ships.
- **Dynamic Wave & Boss Engine**:
  - Swarms of fast **Scouts** and armored **Cruisers**.
  - **Mothership Boss Battles** every 5 waves with animated health bars and multi-cannon spread patterns.
- **Physics & Visual Polish**:
  - Multi-layer parallax starfield background.
  - Neon particle explosion engine with screen shake.
  - Floating score & bonus combo notifications.
  - CRT scanlines arcade aesthetic.
- **Persistent High Scores**:
  - Tracks and saves your personal best score locally in `localStorage`.
- **Cross-Platform Responsive Controls**:
  - Full desktop keyboard support (Arrow keys / WASD / Spacebar / B / P).
  - Mobile touch drag and tap controls.

---

## 🕹️ Controls

| Action | Desktop Controls | Mobile / Touch |
| :--- | :--- | :--- |
| **Move Ship** | Arrow Keys or `W`, `A`, `S`, `D` | Drag finger across screen |
| **Fire Lasers** | `Spacebar` or `K` | Tap & hold screen |
| **Screen Nuke** | `B` Key or 💣 button | Tap **💣 NUKE** button |
| **Pause / Resume** | `P` Key or ⏸ button | Tap **⏸ Pause** button |
| **Mute / Unmute** | Audio Button | Tap **🔊 Audio** button |

---

## 📁 Project Structure

```
galaxy-raider-game/
├── index.html        # Main HTML layout, HUD, overlays, and canvas viewport
├── css/
│   └── style.css     # Synthwave neon styling, CRT scanlines, and glow animations
├── js/
│   ├── audio.js      # Web Audio API procedural sound synthesizer
│   ├── entities.js   # Player, Starfield, Enemies, Bullets, Particles & Powerups
│   └── game.js       # Core game loop, wave manager, collision engine & controls
└── README.md         # Documentation & guide
```
