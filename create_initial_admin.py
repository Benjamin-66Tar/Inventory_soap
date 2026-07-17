import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InventoryPro.settings')
django.setup()

from django.contrib.auth.models import User
from inventory.models import PerfilUsuario, RolUsuario

def create_admin():
    username = os.getenv('ADMIN_USERNAME')
    email = os.getenv('ADMIN_EMAIL')
    password = os.getenv('ADMIN_PASSWORD')
    
    if not username or not password or not email:
        print("Error: Las variables de entorno ADMIN_USERNAME, ADMIN_EMAIL o ADMIN_PASSWORD no están configuradas.")
        print("Asegúrate de configurarlas en el panel de Render antes de ejecutar este script.")
        return
    
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
        user.email = email
        user.set_password(password)
        user.save()
        print(f"Usuario {username} ya existía. Sus datos han sido actualizados.")
        
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
