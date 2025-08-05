# Test Docker Local - 7ouma Ligue Backend (PowerShell)
# ===================================================

Write-Host "🐳 Test Docker Local - 7ouma Ligue Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Fonction pour afficher les messages colorés
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
    Write-Success "Docker est installé"
} catch {
    Write-Error "Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
}

# Vérifier si Docker est en cours d'exécution
try {
    docker info | Out-Null
    Write-Success "Docker est en cours d'exécution"
} catch {
    Write-Error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
}

Write-Status "Docker est disponible et en cours d'exécution"

# Nettoyer les anciens conteneurs et images si demandé
if ($args[0] -eq "--clean") {
    Write-Status "Nettoyage des anciens conteneurs et images..."
    try {
        docker stop $(docker ps -q --filter ancestor=7oumaligue-backend) 2>$null
        docker rm $(docker ps -aq --filter ancestor=7oumaligue-backend) 2>$null
        docker rmi 7oumaligue-backend 2>$null
        Write-Success "Nettoyage terminé"
    } catch {
        Write-Warning "Aucun conteneur ou image à nettoyer"
    }
}

# Construire l'image
Write-Status "Construction de l'image Docker..."
try {
    docker build -t 7oumaligue-backend .
    Write-Success "Image construite avec succès"
} catch {
    Write-Error "Échec de la construction de l'image"
    exit 1
}

# Variables d'environnement de test
$env:DATABASE_URL = "postgresql://testuser:testpass@localhost:5432/7oumaligue_test"
$env:JWT_SECRET = "test-jwt-secret-key-for-local-testing"
$env:STRIPE_SECRET_KEY = "sk_test_test_stripe_key"
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "test@example.com"
$env:SMTP_PASS = "test-password"
$env:NODE_ENV = "test"
$env:PORT = "8080"
$env:RATE_LIMIT_WINDOW_MS = "900000"
$env:RATE_LIMIT_MAX_REQUESTS = "1000"
$env:ENABLE_RATE_LIMIT = "false"

Write-Status "Variables d'environnement de test configurées"

# Lancer le conteneur avec variables d'environnement
Write-Status "Démarrage du conteneur de test..."
Write-Status "Le serveur sera accessible sur http://localhost:3000"

try {
    docker run -it --rm `
        --name 7oumaligue-backend-test `
        -p 3000:8080 `
        -e DATABASE_URL="$env:DATABASE_URL" `
        -e JWT_SECRET="$env:JWT_SECRET" `
        -e STRIPE_SECRET_KEY="$env:STRIPE_SECRET_KEY" `
        -e SMTP_HOST="$env:SMTP_HOST" `
        -e SMTP_PORT="$env:SMTP_PORT" `
        -e SMTP_USER="$env:SMTP_USER" `
        -e SMTP_PASS="$env:SMTP_PASS" `
        -e NODE_ENV="$env:NODE_ENV" `
        -e PORT="$env:PORT" `
        -e RATE_LIMIT_WINDOW_MS="$env:RATE_LIMIT_WINDOW_MS" `
        -e RATE_LIMIT_MAX_REQUESTS="$env:RATE_LIMIT_MAX_REQUESTS" `
        -e ENABLE_RATE_LIMIT="$env:ENABLE_RATE_LIMIT" `
        7oumaligue-backend
} catch {
    Write-Error "Erreur lors du démarrage du conteneur"
    exit 1
}

# Le script se termine quand le conteneur s'arrête
Write-Status "Test terminé" 