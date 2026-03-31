from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.views import InsumoViewSet

router = DefaultRouter()
router.register(r'isumos', InsumoViewSet)

urlpatterns = [
    path(r'api/', include(router.urls)),
]

