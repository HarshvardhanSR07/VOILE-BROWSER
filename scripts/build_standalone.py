import os
import shutil
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"C:\Users\Harsh\.gemini\antigravity\scratch\Browser"
DIST_DIR = os.path.join(ROOT_DIR, "release", "Voile-win32-x64")
ELECTRON_DIST = os.path.join(ROOT_DIR, "node_modules", "electron", "dist")

print("=== Building Standalone Voile Desktop Application for Windows ===")

# 1. Clean release directory
if os.path.exists(DIST_DIR):
    print(f"Removing old release at {DIST_DIR}...")
    shutil.rmtree(DIST_DIR, ignore_errors=True)

os.makedirs(DIST_DIR, exist_ok=True)

# 2. Copy all files from Electron dist
print("Copying Electron binary runtime...")
for item in os.listdir(ELECTRON_DIST):
    s = os.path.join(ELECTRON_DIST, item)
    d = os.path.join(DIST_DIR, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

# 3. Rename electron.exe to Voile.exe
src_exe = os.path.join(DIST_DIR, "electron.exe")
dst_exe = os.path.join(DIST_DIR, "Voile.exe")
if os.path.exists(src_exe):
    if os.path.exists(dst_exe):
        try:
            os.remove(dst_exe)
        except Exception:
            pass
    if os.path.exists(dst_exe):
        try:
            os.remove(src_exe)
        except Exception:
            pass
    else:
        os.rename(src_exe, dst_exe)
    print(f"Created standalone executable: {dst_exe}")

# 4. Prepare resources/app directory
resources_dir = os.path.join(DIST_DIR, "resources")
default_asar = os.path.join(resources_dir, "default_app.asar")
if os.path.exists(default_asar):
    os.remove(default_asar)

app_dir = os.path.join(resources_dir, "app")
os.makedirs(app_dir, exist_ok=True)

# 5. Copy package.json
shutil.copy2(os.path.join(ROOT_DIR, "package.json"), os.path.join(app_dir, "package.json"))

# 6. Copy electron scripts (main.cjs, preload.cjs)
shutil.copytree(os.path.join(ROOT_DIR, "electron"), os.path.join(app_dir, "electron"))

# 7. Copy built frontend (dist/)
shutil.copytree(os.path.join(ROOT_DIR, "dist"), os.path.join(app_dir, "dist"))

# 8. Copy public directory (chameleon_shield.js, icons, etc.)
shutil.copytree(os.path.join(ROOT_DIR, "public"), os.path.join(app_dir, "public"))

# 9. Copy runtime production dependencies for AdBlockEngine
runtime_pkgs = [
    "@ghostery/adblocker-electron",
    "@ghostery/adblocker",
    "@ghostery/adblocker-content",
    "@ghostery/adblocker-extended-selectors",
    "@ghostery/url-parser",
    "tldts-experimental",
    "tldts-core",
    "@remusao/guess-url-type",
    "@remusao/small",
    "@remusao/smaz",
    "@remusao/smaz-compress",
    "@remusao/trie",
    "@remusao/smaz-decompress",
    "@ghostery/adblocker-electron-preload",
    "cross-fetch",
    "node-fetch",
    "whatwg-url",
    "tr46",
    "webidl-conversions"
]

app_node_modules = os.path.join(app_dir, "node_modules")
os.makedirs(app_node_modules, exist_ok=True)
for pkg in runtime_pkgs:
    src_pkg = os.path.join(ROOT_DIR, "node_modules", pkg)
    dst_pkg = os.path.join(app_node_modules, pkg)
    if os.path.exists(src_pkg):
        os.makedirs(os.path.dirname(dst_pkg), exist_ok=True)
        shutil.copytree(src_pkg, dst_pkg)

print("\n=== SUCCESS: Voile Standalone Desktop Application Built Successfully! ===")
print(f"Executable location: {dst_exe}")
print("You can launch Voile by running Voile.exe directly without any localhost or dev server.")
