#!/bin/bash

# Build script for local development and testing
# This script builds the React app and prepares for deployment

set -e

echo "Building Hockey Pockey app for deployment..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd client
npm ci

# Build React app
echo "Building React app..."
npm run build

# Go back to project root
cd ..

# Install Python dependencies
echo "Installing Python dependencies..."
cd hockey
pip install -r requirements.txt

# Run Django migrations
echo "Running Django migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create deployment package
echo "Creating deployment package..."
cd ..
mkdir -p dist
cp -r hockey dist/
cp -r client/build dist/client_build
cp -r deploy-scripts dist/

# Create production requirements
cd hockey
pip freeze > ../dist/requirements.txt
cd ..

echo "Build completed!"
echo "Deployment package created in: dist/"
echo "Contents:"
ls -la dist/
