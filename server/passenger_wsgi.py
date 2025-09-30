import sys
import os

# Set project path
PROJECT_PATH = '/repositories/hockey-pockey/server'

sys.path.insert(0, PROJECT_PATH)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
