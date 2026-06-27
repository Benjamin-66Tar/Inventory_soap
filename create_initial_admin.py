import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InventoryPro.settings')
django.setup()

from django.contrib.auth.models import User
from inventory.models import PerfilUsuario, RolUsuario

def create_admin():
    username = 'admin'
    email = 'admin@benys.com'
    password = 'admin123'
    
    # 1. Create or get user
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email,
        'is_staff': True,
        'is_superuser': True
    })
    
    if created:
        user.set_password(password)
        user.save()
        print(f"Usuario {username} creado con éxito.")
    else:
        print(f"Usuario {username} ya existe.")
        
    # 2. Create or get PerfilUsuario
    perfil, p_created = PerfilUsuario.objects.get_or_create(user=user, defaults={
        'rol': RolUsuario.ADMIN
    })
    
    if p_created:
        print("Perfil de Administrador asociado correctamente.")
    else:
        perfil.rol = RolUsuario.ADMIN
        perfil.save()
        print("Perfil de Administrador actualizado a ADMIN.")

if __name__ == '__main__':
    create_admin()
