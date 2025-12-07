@echo off
echo Taking screenshot from Android device...

REM Get current timestamp for filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%

REM Take screenshot on device
adb shell screencap -p /sdcard/screenshot.png

if %ERRORLEVEL% NEQ 0 (
    echo Failed to take screenshot. Make sure:
    echo 1. USB debugging is enabled on your device
    echo 2. Device is connected via USB
    echo 3. ADB drivers are installed
    pause
    exit /b 1
)

REM Pull screenshot to PC
echo Pulling screenshot to PC...
adb pull /sdcard/screenshot.png screenshots\screenshot_%timestamp%.png

if %ERRORLEVEL% NEQ 0 (
    echo Failed to pull screenshot from device
    pause
    exit /b 1
)

REM Clean up device
adb shell rm /sdcard/screenshot.png

echo Screenshot saved to: screenshots\screenshot_%timestamp%.png
echo Done!

pause
