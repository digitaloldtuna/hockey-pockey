import sys
import os

# Set project path
PROJECT_PATH = '/home/bossyold/repositories/hockey-pockey/server'

sys.path.insert(0, PROJECT_PATH)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
