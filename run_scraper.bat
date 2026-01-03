@echo off
echo.
echo ========================================
echo   Google Maps Real Estate Scraper
echo ========================================
echo.
echo Select Country:
echo.
echo 1. Egypt
echo 2. Saudi Arabia
echo 3. United Arab Emirates
echo 4. Algeria
echo 5. Iraq
echo 6. Sudan
echo 7. Yemen
echo.
set /p choice="Enter number (1-7): "

if "%choice%"=="1" set country=Egypt
if "%choice%"=="2" set country=Saudi Arabia
if "%choice%"=="3" set country=United Arab Emirates
if "%choice%"=="4" set country=Algeria
if "%choice%"=="5" set country=Iraq
if "%choice%"=="6" set country=Sudan
if "%choice%"=="7" set country=Yemen

if not defined country (
    echo Invalid choice!
    pause
    exit /b
)

echo.
echo Selected: %country%
echo.
echo Make sure VPN is connected!
pause

cd scraper
node google_maps_scraper.js --country="%country%"
pause
