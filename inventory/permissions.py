from rest_framework import permissions
from inventory.models import RolUsuario

class EsAdministrador(permissions.BasePermission):
    """Acceso exclusivo para el Administrador"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perfil = getattr(request.user, 'perfil', None)
        return perfil is not None and perfil.rol == RolUsuario.ADMIN

class EsSupervisor(permissions.BasePermission):
    """Acceso para Supervisor y Administrador"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perfil = getattr(request.user, 'perfil', None)
        if perfil is None:
            return False
        return perfil.rol in [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]

class EsOperadorOMas(permissions.BasePermission):
    """Cualquier usuario autenticado tiene acceso de lectura.
    Supervisor y Administrador tienen acceso de escritura (POST, PUT, DELETE)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        perfil = getattr(request.user, 'perfil', None)
        if perfil is None:
            return False
        
        # Lectura para todos
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Escritura solo para ADMIN y SUPERVISOR
        return perfil.rol in [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]

class EsRecetaOCategoria(permissions.BasePermission):
    """Lectura para Supervisor y Operador (necesario para selectores).
    Escritura (crear, editar, borrar) exclusivo para el Administrador."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        perfil = getattr(request.user, 'perfil', None)
        if perfil is None:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return perfil.rol == RolUsuario.ADMIN
