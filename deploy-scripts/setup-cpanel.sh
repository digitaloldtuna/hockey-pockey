#!/bin/bash

# Setup script for cPanel hosting
# Run this script once to set up your cPanel environment

echo "Setting up cPanel environment for Hockey Pockey app..."

# Create necessary directories
mkdir -p ~/public_html/hockey-pockey
mkdir -p ~/venv
mkdir -p ~/logs
mkdir -p ~/backups

# Set up Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv ~/venv/hockey-pockey
source ~/venv/hockey-pockey/bin/activate

# Install basic packages
pip install --upgrade pip
pip install gunicorn

# Create .htaccess for Django
cat > ~/public_html/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /hockey-pockey/wsgi.py/$1 [QSA,L]
EOF

# Create passenger_wsgi.py for cPanel
cat > ~/public_html/passenger_wsgi.py << 'EOF'
import sys
import os

# Add the project directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'hockey-pockey'))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hockey.settings_production')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
EOF

# Create .htaccess for static files
cat > ~/public_html/hockey-pockey/static/.htaccess << 'EOF'
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /hockey-pockey/static/$1 [L]
EOF

echo "cPanel setup completed!"
echo "Next steps:"
echo "1. Upload your project files to ~/public_html/hockey-pockey/"
echo "2. Run the deploy.sh script"
echo "3. Configure your database in cPanel"
echo "4. Set up your domain to point to the hockey-pockey directory"
