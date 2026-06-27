from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from inventory.views import (
    InsumoViewSet, JabonViewSet, ConsumoInsumoViewSet, SalidaJabonViewSet,
    ProduccionViewSet, CategoriaViewSet, ConfiguracionSistemaView, RecetaViewSet,
    UsuariosViewSet, BitacoraViewSet, LoginView, ForgotPasswordView,
    ResetPasswordView, InvitacionView, RegistroInvitacionView, BackupRestoreView
)
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
router.register(r'categorias', CategoriaViewSet)
router.register(r'recetas', RecetaViewSet)
router.register(r'admin/usuarios', UsuariosViewSet, basename='admin-usuarios')
router.register(r'admin/bitacora', BitacoraViewSet, basename='admin-bitacora')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/configuracion/', ConfiguracionSistemaView.as_view()),
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/recuperar-password/', ForgotPasswordView.as_view(), name='auth-forgot'),
    path('api/auth/restablecer-password/', ResetPasswordView.as_view(), name='auth-reset'),
    path('api/admin/invitar/', InvitacionView.as_view(), name='admin-invitar'),
    path('api/auth/registro-invitacion/', RegistroInvitacionView.as_view(), name='auth-invite-register'),
    path('api/admin/respaldo/', BackupRestoreView.as_view(), name='admin-backup-restore'),
    path('admin/', admin.site.urls),
    
    # Servir archivos estáticos del root de React (favicon, manifest, etc.)
    re_path(r'^(?P<path>(?:favicon\.ico|manifest\.json|logo192\.png|logo512\.png|robots\.txt))$', 
            serve, {'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'build')}),
            
    # Ruta comodín para redirigir cualquier otra url a React Router
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

