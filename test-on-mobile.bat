@echo off
setlocal EnableDelayedExpansion

echo.
echo ===================================
echo   Mobile Development Server
echo ===================================
echo.

echo [INFO] A new command window will open for the web server.
echo [INFO] Keep that new window open, but you can minimize it.
echo.

echo [STEP 1] Adding firewall rule (if possible)...
set "rule_name=Mobile Dev Server Port 8080"
netsh advfirewall firewall show rule name="%rule_name%" >nul
if %errorlevel% neq 0 (
    echo [WARN] Could not find or create firewall rule.
    echo         Please ensure you have created it manually.
) else (
    echo [OK] Firewall rule is present.
)
echo.

echo [STEP 2] Finding your local IP address...
set "ip_address="
for /f "tokens=1,2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    if not defined ip_address (
        set "temp_ip=%%b"
        set "ip_address=!temp_ip: =!"
    )
)

if not defined ip_address goto ip_not_found
echo [OK] Found local IP address: %ip_address%
echo.
goto start_server

:ip_not_found
echo [ERROR] Could not automatically find your local IP address.
pause
exit /b 1

:start_server
set "port=8080"
set "url=http://%ip_address%:%port%"

echo [STEP 3] Starting the local web server in a new window...
where npm >nul 2>&1
if errorlevel 1 goto npm_not_found

start "Mobile Dev Server" npx http-server . -p %port% -c-1 --cors

echo [OK] Server is starting up. Please wait a moment...
timeout /t 5 >nul
echo.

echo [STEP 4] Your server is running!
echo          Scan the QR code below with your phone.
echo.
echo ==========================================================
echo.
echo    URL: %url%
echo.
npx qrcode-terminal "%url%" -s
echo.
echo ==========================================================
echo.
echo [IMPORTANT] A new window titled 'Mobile Dev Server' is running.
echo             To stop the server, simply close that new window.
echo.
goto end

:npm_not_found
echo [ERROR] Node.js (npm) is not installed.
echo         Cannot start the server. Please install from https://nodejs.org/
goto end

:end
endlocal
pause 