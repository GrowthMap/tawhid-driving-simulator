# Driving Simulator

A 5-level 3D driving game for the browser. Steering: **touch** (on-screen buttons) or **tilt** (device orientation). Acceleration and brake with simple physics. Obstacles increase in difficulty from level 1 to 5.

## How to run

The game uses ES modules and loads Three.js from a CDN. For best compatibility (and tilt on some browsers), serve the folder over **HTTP** rather than opening `index.html` as a file.

### Option 1: VS Code / Cursor Live Server

- Install "Live Server" and right-click `index.html` → "Open with Live Server".

### Option 2: Node (npx)

```bash
npx serve .
```

Then open the URL shown (e.g. http://localhost:3000).

### Option 3: Python

```bash
# Python 3
python -m http.server 8080
```

Open http://localhost:8080

## Controls

- **Desktop:** Arrow keys or WASD (steer, gas, brake).  
- **Touch:** On-screen Left/Right, GAS, BRAKE.  
- **Tilt:** Enable in Settings; then tilt the device left/right to steer. Gas/brake still use on-screen buttons or keyboard.

## Settings

- **Steering:** Touch or Tilt (saved in `localStorage`).

## Levels

- Level 1–5: same goal (reach the green finish zone without hitting obstacles). Difficulty increases with more and tighter obstacles.

Progress (highest level unlocked) is saved in `localStorage`.

---

## Publish on GitHub and deploy on Railway

### 1. Publish to GitHub

If you don’t have a repo yet:

1. On [GitHub](https://github.com/new), create a new repository (e.g. `tawhid-driving-game`). Don’t add a README or .gitignore (you already have them).
2. In your project folder, run:

```bash
cd "f:\Trojar Test Dev\Tawhid Game"
git init
git add .
git commit -m "Initial commit: driving simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Choose the repo you just pushed (e.g. `tawhid-driving-game`).
4. Railway will detect the Node.js app and use `npm start` (which runs `serve` to host the static files). If it doesn’t auto-detect:
   - **Settings** → **Build Command:** leave empty or `npm install`
   - **Settings** → **Start Command:** `npm start`
   - **Settings** → **Root Directory:** leave as `/` (repo root).
5. After deploy, open **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `your-app.up.railway.app`).

Your game will be live at that URL. Use **HTTPS** so tilt controls work on mobile.
