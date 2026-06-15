from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from inventory.views import InsumoViewSet, JabonViewSet, ConsumoInsumoViewSet, SalidaJabonViewSet, ProduccionViewSet
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet)
router.register(r'jabones', JabonViewSet)
router.register(r'consumos', ConsumoInsumoViewSet)
router.register(r'salidas', SalidaJabonViewSet)
router.register(r'produccion', ProduccionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls), # Agrega esta línea para habilitar el panel
    
    # Servir archivos estáticos del root de React (favicon, manifest, etc.)
    re_path(r'^(?P<path>(?:favicon\.ico|manifest\.json|logo192\.png|logo512\.png|robots\.txt))$', 
            serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'build')}),
            
    # Ruta comodín para redirigir cualquier otra url a React Router
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

