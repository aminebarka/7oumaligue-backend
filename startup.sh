#!/bin/bash

# Résoudre les chemins absolus
APP_DIR="/home/site/wwwroot"
cd $APP_DIR

# Log environnement
echo "---- ENVIRONMENT ----"
printenv
echo "---- FILESYSTEM ----"
ls -l

# Démarrer l'application
echo "Starting Node.js server..."
node dist/src/server.js