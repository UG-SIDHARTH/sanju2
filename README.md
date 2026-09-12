# 🕷️ Spider-Man Snakes & Ladders 3D

A cinematic, high-performance 3D board game built with **Three.js** and **Vanilla JavaScript**. Set atop a sleek Manhattan penthouse rooftop arena overlooking an illuminated city skyline (featuring Stark Tower, Oscorp, and the Daily Bugle), players race across a 100-tile board featuring classic comic-accurate Marvel heroes and villains.

---

## 🎮 Key Features & Gameplay

### ✨ Anime & Manga Art Style
- **Expressive Anime Avatars**: Mary Jane (MJ) characters feature high-detail anime faces with large sparkling eyes, gradient irises, limbal rings, winged anime eyeliner, cute manga cheek blush (`///`), minimalist nose dots, and glossy lips.
- **Manga Action Bursts (`ComicFX`)**: 3D floating onomatopoeia rendered as 24-point jagged anime starbursts with radial speedlines, thick manga ink outlines, and high-energy SFX typography (`⚡ THWIP!!`, `🎃 GYAHAHA!!`, `🌀 WARP!!`).
- **Anime Twilight Sky & Atmosphere**: Vibrant anime night sky gradient (deep void to twilight violet) with a glowing anime crescent moon, soft celestial halo, and twinkling 4-point cross star sparkles (`✨`).

### 🏃‍♀️ Natural Running Pace (No "Flash" Speed)
- **Balanced Step Cadence**: MJ traverses tiles at **0.40s per tile** (a natural, readable human running pace) instead of rushing like the Flash.
- **Synchronized Kinematics**: Walk cycle stride frequency calibrated at **7.8 rad/s** to align foot-falls with tile movement, preventing foot-sliding.
- **Optional Turbo Mode**: A 0.22s speed toggle is available via the **⚡ Turbo** button for faster gameplay whenever desired.

### 🎃 Overwhelmingly Green Goblin (Classic Comic & Anime Design)
- **Vibrant Scaly Green Body**: Rendered in radiant emerald and bright lime scales (`#16a34a` / `#22c55e` / `#86efac`) with subtle emissive green luminescence (`0x14532d`).
- **Prominent Scaly Green Torso & Head**: Muscular green scaly chest, abdomen, head, ears, brow, and chin proudly showing without being concealed by oversized garments.
- **Scaly Green Limbs & Goblin Elf Boots**: Scaly green forearms, claws, and curled-toe elf boots accented with royal purple gauntlet cuffs and shoulder harness straps.
- **Toxic Green Glider Energy**: Bat-glider features glowing emerald cutting edges (`0x22c55e`), toxic green thruster plasma, and an electric green hover aura field.
- **Vivid Green Hazard Tiles**: Board hazard tiles (28, 47, 73, 95) styled in toxic emerald and lime gradients with `🎃 GOBLIN HAZARD` badges.

### 🕸️ 4 Classic Spider-Men (Articulated Mechanical Spider Legs)
- 4 Spider-Men guard the arena, each equipped with **4 articulated mechanical spider legs (waldoes)** mounted on a spinal armor backplate with anime glowing white eye lenses.
- Landing on a Spider Trigger reels the player forward across tiers with dynamic camera tracking and web slingshot mechanics.

### 🌀 2 Bidirectional (Reversible) Quantum Portals
- **Tile 61 ⟷ Tile 69** (*Cyan Quantum Dimension*)
- **Tile 36 ⟷ Tile 7** (*Amber Multiverse Rift*)
- Fully reversible: landing on either endpoint instantly warps the player to the opposite side with gravitational suction, event horizon distortion, and dimensional emergence.

### 🐙 Tile 100 Multiverse Showdown & Doctor Octopus
- Landing on Tile 100 triggers the ultimate Multiverse evaluation.
- Classic Ditko/Romita Doctor Octopus (emerald green suit, bright yellow boots, yellow gauntlets, yellow chest harness, round goggles, bowl cut, and 4 heavy mechanical tentacles).

### ⚡ Fast-Paced Balance & Turbo Mode
- **No Endgame Stall**: Any roll equal to or exceeding 100 immediately reaches the goal.
- **Turbo Speed Toggle (`⚡ Turbo`)**: Instantly switches between normal smooth stepping and 80ms turbo pacing.
- **Interactive Leaderboard**: Real-time progress bars; click any player card to smoothly focus the camera.

### 🔊 Procedural Web Audio Synthesizer
- 100% procedurally synthesized audio using the **Web Audio API** (zero external MP3/WAV assets to load).
- Sound effects include: web "THWIP!", glider roar, goblin cackle, portal warp sweeps, footstep taps, and victory fanfares.
- Bulletproof fail-safe design preventing audio context interruptions on restricted browsers.

---

## ⚡ Low-Spec Hardware Optimization

Engineered to run at a smooth **60 FPS** on budget systems (such as **Intel Pentium CPUs, Intel HD integrated graphics, and 4GB DDR3 RAM**):

- **Zero Real-Time Shadow Overhead**: Eliminates 2048×2048 depth-pass shadow rendering for a 3x–5x framerate boost on integrated GPUs.
- **Strict 1.0 Pixel Ratio (DPR)**: Caps `setPixelRatio` at 1.0 to prevent GPU fragment overload.
- **Lightweight 256×256 Tile Textures**: Board memory consumption reduced from ~140 MB to ~26 MB, eliminating HDD texture paging.
- **Minimalist Clean Architecture**: Removed high-poly tree models and particle physics loops in favor of sleek, low-poly corner pedestals with LED neon rims.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm

### Installation & Local Run
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (runs on Port 9000)
npm run dev

# 3. Open in your browser
http://localhost:9000/
```

> **Note**: The application is configured by default to run strictly on **Port 9000** (`strictPort: true` in `vite.config.js`).

### Production Build
```bash
# Compile and minify for production into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## 🐳 Docker & Cloudflare Tunnel Deployment

The project includes pre-configured Docker and Nginx configurations:

```bash
# Run with Docker Compose
docker compose up -d --build
```
- **Internal Nginx Port**: Binds to `9000`.
- **Public Domain**: Integrated with Cloudflare Tunnel (`cloudflared.config.yml`).

---

## ⌨️ Controls & Shortcuts

| Action | Control |
|---|---|
| **Roll Dice** | Click **ROLL DICE** or press <kbd>SPACE</kbd> |
| **Focus Player Camera** | Click on any player's card in the side panel |
| **Toggle Turbo Speed** | Click the **⚡ Turbo** button in the top bar |
| **Toggle Sound** | Click the **🔊 Sound** button in the top bar |
| **Change Camera Angle** | Click the **🎥 Camera** button in the top bar |
| **Zoom In / Out** | Use the floating zoom buttons (<kbd>➕</kbd> / <kbd>➖</kbd> / <kbd>🔍</kbd>) |

---

## 📂 Project Structure

```
sanju2/
├── index.html               # Main HTML entry & UI overlays
├── package.json             # Project dependencies & npm scripts
├── vite.config.js           # Vite configuration (fixed on Port 9000)
├── nginx.conf               # Nginx server configuration (Port 9000)
├── docker-compose.yml       # Container orchestration
├── cloudflared.config.yml   # Cloudflare Tunnel configuration
└── src/
    ├── main.js              # Application bootstrap & WebGL renderer setup
    ├── style.css            # Comic & glassmorphism UI styles
    ├── game/
    │   ├── GameManager.js   # Match rules, turn flow, hazards & portals
    │   ├── Board.js         # 100-tile board generation & tile textures
    │   ├── SpiderMan.js     # Spider-Man 3D model & waldoes animation
    │   ├── GreenGoblin.js   # Classic Green Goblin 3D model & glider flight
    │   ├── DrOctopus.js     # Doctor Octopus 3D model & tentacles
    │   ├── Portal.js        # Bidirectional quantum multiverse portals
    │   ├── Dice3D.js        # 3D physics-style dice roll animation
    │   ├── Environment.js   # Manhattan skyline, rooftop arena & lighting
    │   ├── AudioManager.js  # Procedural Web Audio sound effects
    │   ├── CharacterFactory.js # Player avatar models & hair configurations
    │   ├── CameraDirector.js# Cinematic camera angles & focus transitions
    │   └── ComicFX.js       # Comic action popups & banners
    └── ui/
        └── HUD.js           # HUD elements, leaderboard & modal controllers
```

---

## 📜 License
Private Marvel-themed educational project. Spider-Man, Green Goblin, Doctor Octopus, and related characters are trademarks of Marvel Characters, Inc.
