@echo off
setlocal

echo.
echo ===================================
echo   Mobile Server Cleanup
echo ===================================
echo.

set "rule_name=Mobile Dev Server Port 8080"

echo [INFO] This script will remove the firewall rule named:
echo        "%rule_name%"
echo.

echo [STEP 1] Checking for the firewall rule...
netsh advfirewall firewall show rule name="%rule_name%" >nul
if %errorlevel% neq 0 (
    echo [INFO] Firewall rule does not exist. Nothing to do.
    goto end
)

echo [STEP 2] Firewall rule found. Deleting...
netsh advfirewall firewall delete rule name="%rule_name%" >nul
if %errorlevel% equ 0 (
    echo [OK] Successfully deleted the firewall rule.
) else (
    echo [ERROR] Failed to delete the firewall rule.
    echo         You may need to remove it manually from the Windows Defender Firewall settings.
)

:end
echo.
echo [OK] Cleanup complete.
echo.
pause
endlocal 