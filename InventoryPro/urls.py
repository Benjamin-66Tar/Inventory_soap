from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import InsumoViewSet, JabonViewSet, ConsumoInsumoViewSet, SalidaJabonViewSet, ProduccionViewSet

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet)
router.register(r'jabones', JabonViewSet)
router.register(r'consumos', ConsumoInsumoViewSet)
router.register(r'salidas', SalidaJabonViewSet)
router.register(r'produccion', ProduccionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls), # Agrega esta línea para habilitar el panel
]

