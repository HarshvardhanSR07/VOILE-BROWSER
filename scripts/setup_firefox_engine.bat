@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo       Voile Browser - Firefox C++ Engine Setup
echo ========================================================
echo.
echo Step 1: Checking for MozillaBuild in C:\mozilla-build...

if exist "C:\mozilla-build\start-shell.bat" (
    echo [OK] MozillaBuild is already installed!
) else (
    echo [INFO] MozillaBuild not found. Downloading installer...
    curl.exe -L -o "%TEMP%\MozillaBuildSetup-Latest.exe" https://ftp.mozilla.org/pub/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe
    if errorlevel 1 (
        echo [ERROR] Failed to download MozillaBuild installer.
        pause
        exit /b 1
    )
    echo [INFO] Launching MozillaBuild installer. Please install to default C:\mozilla-build...
    start /wait "" "%TEMP%\MozillaBuildSetup-Latest.exe"
)

echo.
echo Step 2: Preparing Voile mozconfig...
(
    echo # Voile Browser Engine Configuration
    echo ac_add_options --enable-application=browser
    echo ac_add_options --enable-optimize
    echo ac_add_options --enable-debug
    echo mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-voile-x64
) > "%~dp0..\mozconfig"
echo [OK] mozconfig created at "%~dp0..\mozconfig"

echo.
echo Step 3: Source Code & Compilation Next Steps:
echo 1. Launch MozillaBuild shell:
echo    C:\mozilla-build\start-shell.bat
echo.
echo 2. Run bootstrap script to clone the Gecko/SpiderMonkey source tree:
echo    python3 bootstrap.py
echo.
echo 3. Compile the native engine:
echo    ./mach build
echo.
echo 4. Run your custom compiled browser:
echo    ./mach run
echo.
echo ========================================================
pause
