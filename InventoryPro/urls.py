from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import InsumoViewSet, JabonViewSet

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet)
router.register(r'jabones', JabonViewSet)

urlpatterns = [
    path(r'api/', include(router.urls)),
    path('admin/', admin.site.urls), # Agrega esta línea para habilitar el panel
]

