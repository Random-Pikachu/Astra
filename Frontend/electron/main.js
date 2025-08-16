import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ESM replacements for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide menu bar (File, Edit, Help, etc.)
    frame: true, // Keep window frame but hide menu
  });

  // Maximize window to full desktop size
  win.maximize();
  win.show();

  // In dev: load React dev server, in prod: load build files
  if (process.env.ELECTRON_DEV) {
    win.loadURL("http://localhost:5173"); // vite default port
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
