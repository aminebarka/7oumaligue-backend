@echo off
setlocal enabledelayedexpansion

REM Script de surveillance pour Windows
REM Usage: monitor.bat

echo 🚀 Démarrage de la surveillance du serveur 7ouma Ligue...

REM Créer le dossier logs s'il n'existe pas
if not exist "logs" mkdir logs

REM Fichier de log
set LOG_FILE=logs\monitor.log

REM Fonction pour écrire dans les logs
:writeLog
set message=%1
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"
echo [%timestamp%] %message% >> %LOG_FILE%
echo [%timestamp%] %message%
goto :eof

REM Vérifier si PM2 est installé
pm2 --version >nul 2>&1
if errorlevel 1 (
    call :writeLog "❌ PM2 n'est pas installé. Installation..."
    npm install -g pm2
)

REM Démarrer le serveur s'il n'est pas en cours
pm2 status | findstr "7oumaligue-backend" >nul
if errorlevel 1 (
    call :writeLog "🚀 Démarrage du serveur avec PM2..."
    pm2 start ecosystem.config.js
    timeout /t 5 /nobreak >nul
)

:monitor_loop
call :writeLog "🔍 Vérification de la santé du serveur..."

REM Vérifier si le serveur répond
curl -s https://backend-7oumaligue-hrd4bqesgcefg5h4.francecentral-01.azurewebsites.net/health >nul 2>&1
if errorlevel 1 (
    call :writeLog "⚠️ Serveur non réactif, redémarrage..."
    pm2 restart 7oumaligue-backend
    timeout /t 10 /nobreak >nul
) else (
    call :writeLog "✅ Serveur en bonne santé"
)

REM Attendre 30 secondes avant la prochaine vérification
timeout /t 30 /nobreak >nul
goto monitor_loop 