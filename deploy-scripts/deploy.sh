#!/bin/bash

# Deployment script for Hosting.com cPanel
# This script should be run on your cPanel server

set -e

echo "Starting deployment process..."

# Set variables
PROJECT_DIR="/home/$(whoami)/public_html/hockey-pockey"
BACKUP_DIR="/home/$(whoami)/backups/hockey-pockey-$(date +%Y%m%d_%H%M%S)"
VENV_DIR="/home/$(whoami)/venv/hockey-pockey"

# Create backup of current deployment
if [ -d "$PROJECT_DIR" ]; then
    echo "Creating backup..."
    mkdir -p "$(dirname "$BACKUP_DIR")"
    cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo "Backup created at: $BACKUP_DIR"
fi

# Create project directory
mkdir -p "$PROJECT_DIR"

# Copy project files
echo "Copying project files..."
cp -r hockey/* "$PROJECT_DIR/"
cp -r client/build "$PROJECT_DIR/static/"

# Set up virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r "$PROJECT_DIR/requirements.txt"

# Set up environment variables
echo "Setting up environment variables..."
cat > "$PROJECT_DIR/.env" << EOF
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_NAME=hockey_db
DB_USER=hockey_user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourdomain.com
EOF

# Run Django migrations
echo "Running database migrations..."
cd "$PROJECT_DIR"
python manage.py migrate --settings=hockey.settings_production

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --settings=hockey.settings_production

# Set permissions
echo "Setting file permissions..."
chmod -R 755 "$PROJECT_DIR"
chmod +x "$PROJECT_DIR/manage.py"

echo "Deployment completed successfully!"
echo "Project directory: $PROJECT_DIR"
echo "Virtual environment: $VENV_DIR"
echo "Backup location: $BACKUP_DIR"
