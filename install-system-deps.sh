#!/bin/bash

echo "🔧 Installing system dependencies for canvas..."

# Update package list
sudo apt-get update

# Install canvas dependencies
sudo apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  build-essential \
  libpng-dev

echo "✅ System dependencies installed successfully!"
echo "📦 Now you can run: npm install" 