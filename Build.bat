echo Compiling Vite project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Vite build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo Vite build successful!
echo Launching Android Studio...

REM Adjust the path to your Android Studio installation
npx cap sync