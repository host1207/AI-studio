@echo off
setlocal
cd /d "%~dp0"
set "APP_URL=http://127.0.0.1:3000"

echo Starting Angles Studio...
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found. Install Node.js, then run this file again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js with npm enabled.
  pause
  exit /b 1
)

if not exist "node_modules\express\package.json" (
  echo Installing Angles server dependencies...
  call npm.cmd ci --ignore-scripts --no-audit --no-fund
  if errorlevel 1 (
    call npm.cmd install --ignore-scripts --no-audit --no-fund
  )
  if errorlevel 1 (
    echo ERROR: Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

if exist "scripts\ensure-tracker-bundle.js" (
  echo Verifying Pages 08-10 ^(Tracker / Exam Info / Registry^) bundle...
  node scripts\ensure-tracker-bundle.js
  if errorlevel 1 (
    echo.
    echo ERROR: Could not verify or build Pages 08-10 ^(public\tracker-suite.js^).
    echo Make sure you cloned the entire repository ^(not just Angles-ultimate^) and have internet on first build.
    pause
    exit /b 1
  )
)

echo Waiting for Angles to start; the browser will open automatically.
start "" /min powershell.exe -NoProfile -WindowStyle Hidden -Command "$u='%APP_URL%'; for($i=0;$i -lt 80;$i++){try{$r=Invoke-WebRequest -UseBasicParsing -Uri ($u+'/api/health') -TimeoutSec 1;if($r.StatusCode -eq 200){Start-Process $u;exit}}catch{};Start-Sleep -Milliseconds 250}"
echo Keep this window open while using the app. Press Ctrl+C to stop the server.
call npm.cmd start
if errorlevel 1 echo Angles stopped with an error. Check the messages above.
pause
