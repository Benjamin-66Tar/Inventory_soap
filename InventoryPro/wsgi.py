import os
from django.core.wsgi import get_wsgi_application

# Asegúrate de que el nombre coincida exactamente con tu carpeta
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InventoryPro.settings')

application = get_wsgi_application()