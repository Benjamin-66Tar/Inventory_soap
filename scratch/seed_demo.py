import os
import sys
import django
from datetime import datetime, timedelta

# Agregar la ruta base del proyecto a sys.path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'InventoryPro.settings')
django.setup()

from django.contrib.auth.models import User
from inventory.models import (
    Insumos, Categoria, Jabon, Receta, RecetaInsumo,
    Produccion, DetalleProduccionInsumo, SalidaJabon,
    ConfiguracionSistema, PerfilUsuario, RolUsuario,
    BitacoraActividades
)

def run():
    print("Iniciando sembrado de datos Demo...")

    # 1. Limpieza de datos (excepto superusuarios)
    print("Limpiando datos existentes...")
    BitacoraActividades.objects.all().delete()
    DetalleProduccionInsumo.objects.all().delete()
    Produccion.objects.all().delete()
    RecetaInsumo.objects.all().delete()
    Receta.objects.all().delete()
    SalidaJabon.objects.all().delete()
    Jabon.objects.all().delete()
    Categoria.objects.all().delete()
    Insumos.objects.all().delete()
    ConfiguracionSistema.objects.all().delete()
    
    # Borrar usuarios que no son superusuarios
    User.objects.filter(is_superuser=False).delete()

    # 2. Configuración global
    print("Creando configuración del sistema...")
    config = ConfiguracionSistema.objects.create(
        unidad_peso='g',
        umbral_critico_stock=10
    )

    # 3. Categorías
    print("Creando categorías...")
    cat_personal = Categoria.objects.create(nombre="Cuidado Personal")
    cat_exfoliantes = Categoria.objects.create(nombre="Exfoliantes")
    cat_aroma = Categoria.objects.create(nombre="Aromaterapia")

    # 4. Insumos
    print("Creando insumos...")
    ins_coco = Insumos.objects.create(
        nombre="Aceite de Coco",
        cantidad_gramos=2500,
        proveedor="Distribuidora Química S.A.",
        fecha_ingreso=datetime.now() - timedelta(days=20)
    )
    ins_oliva = Insumos.objects.create(
        nombre="Aceite de Oliva",
        cantidad_gramos=3000,
        proveedor="Aceites del Sur",
        fecha_ingreso=datetime.now() - timedelta(days=20)
    )
    ins_glicerina = Insumos.objects.create(
        nombre="Glicerina Pura",
        cantidad_gramos=6000,
        proveedor="Mercado Libre",
        fecha_ingreso=datetime.now() - timedelta(days=15)
    )
    ins_lavanda = Insumos.objects.create(
        nombre="Aceite Esencial de Lavanda",
        cantidad_gramos=500,
        proveedor="Aromas Naturales",
        fecha_ingreso=datetime.now() - timedelta(days=10)
    )

    # 5. Jabones
    print("Creando perfiles de jabón...")
    jab_lavanda = Jabon.objects.create(
        nombre="Jabón Relajante de Lavanda",
        categoria=cat_aroma,
        cantidad=45,
        peso_gramos=100,
        fecha_elaboracion=datetime.now() - timedelta(days=35)
    )
    jab_cafe = Jabon.objects.create(
        nombre="Jabón Exfoliante de Café",
        categoria=cat_exfoliantes,
        cantidad=20,
        peso_gramos=120,
        fecha_elaboracion=datetime.now() - timedelta(days=30)
    )
    jab_avena = Jabon.objects.create(
        nombre="Jabón Suave de Avena",
        categoria=cat_personal,
        cantidad=10,
        peso_gramos=90,
        fecha_elaboracion=datetime.now() - timedelta(days=5)
    )

    # 6. Recetas
    print("Creando recetas estándar...")
    rec_lavanda = Receta.objects.create(jabon=jab_lavanda, cantidad_piezas_base=10)
    RecetaInsumo.objects.create(receta=rec_lavanda, insumo=ins_coco, cantidad_base=250)
    RecetaInsumo.objects.create(receta=rec_lavanda, insumo=ins_oliva, cantidad_base=250)
    RecetaInsumo.objects.create(receta=rec_lavanda, insumo=ins_glicerina, cantidad_base=500)
    RecetaInsumo.objects.create(receta=rec_lavanda, insumo=ins_lavanda, cantidad_base=20)

    rec_cafe = Receta.objects.create(jabon=jab_cafe, cantidad_piezas_base=10)
    RecetaInsumo.objects.create(receta=rec_cafe, insumo=ins_coco, cantidad_base=300)
    RecetaInsumo.objects.create(receta=rec_cafe, insumo=ins_oliva, cantidad_base=200)
    RecetaInsumo.objects.create(receta=rec_cafe, insumo=ins_glicerina, cantidad_base=500)

    # 7. Producciones (Historial y Lotes)
    print("Creando historial de producciones y lotes...")
    # Producción finalizada (Avena)
    prod_avena = Produccion.objects.create(
        jabon_producido=jab_avena,
        unidades_resultantes=10,
        tipo='ESTANDAR',
        notas="Lote inicial de avena para stock",
        en_curado=False,
        completada=True,
        fecha_termino_curado=(datetime.now() - timedelta(days=7)).date()
    )
    # Sobrescribir fecha_elaboracion con update
    Produccion.objects.filter(id=prod_avena.id).update(fecha_elaboracion=datetime.now() - timedelta(days=35))
    
    DetalleProduccionInsumo.objects.create(
        produccion=prod_avena, 
        insumo=ins_glicerina, 
        cantidad_utilizada=500, 
        lote_origen="N/A", 
        costo_unitario_momento=0.05
    )

    # Producción en curado (Lavanda)
    prod_lavanda = Produccion.objects.create(
        jabon_producido=jab_lavanda,
        unidades_resultantes=30,
        tipo='ESTANDAR',
        notas="Producción mensual estándar",
        en_curado=True,
        completada=False,
        fecha_termino_curado=(datetime.now() + timedelta(days=23)).date()
    )
    # Sobrescribir fecha_elaboracion con update
    Produccion.objects.filter(id=prod_lavanda.id).update(fecha_elaboracion=datetime.now() - timedelta(days=5))

    DetalleProduccionInsumo.objects.create(produccion=prod_lavanda, insumo=ins_coco, cantidad_utilizada=750, lote_origen="N/A", costo_unitario_momento=0.05)
    DetalleProduccionInsumo.objects.create(produccion=prod_lavanda, insumo=ins_oliva, cantidad_utilizada=750, lote_origen="N/A", costo_unitario_momento=0.05)
    DetalleProduccionInsumo.objects.create(produccion=prod_lavanda, insumo=ins_glicerina, cantidad_utilizada=1500, lote_origen="N/A", costo_unitario_momento=0.05)
    DetalleProduccionInsumo.objects.create(produccion=prod_lavanda, insumo=ins_lavanda, cantidad_utilizada=60, lote_origen="N/A", costo_unitario_momento=0.05)

    # 8. Salidas
    print("Creando salidas registradas...")
    salida = SalidaJabon.objects.create(
        jabon=jab_lavanda,
        cantidad_salida=5,
        motivo_salida='VENTA',
        notas="Venta directa de demostración a cliente"
    )
    SalidaJabon.objects.filter(id=salida.id).update(fecha_salida=datetime.now() - timedelta(days=2))

    # 9. Usuarios Demo
    print("Creando usuarios demo multi-rol...")
    users_data = [
        ('admin.demo', 'admin@demo.com', RolUsuario.ADMIN),
        ('supervisor.demo', 'supervisor@demo.com', RolUsuario.SUPERVISOR),
        ('operador.demo', 'operador@demo.com', RolUsuario.OPERADOR)
    ]
    for username, email, rol in users_data:
        user = User.objects.create_user(username=username, email=email, password='demo123')
        user.first_name = username.split('.')[0].capitalize()
        user.last_name = "Demo"
        user.is_staff = True if rol == RolUsuario.ADMIN else False
        user.save()
        
        perfil = PerfilUsuario.objects.create(user=user, rol=rol)
        print(f"Creado usuario: {username} con rol {rol}")

    # 10. Logs en Bitácora
    print("Creando bitácora de sistema demo...")
    u_admin = User.objects.get(username='admin.demo')
    BitacoraActividades.objects.create(
        usuario=u_admin,
        accion="Sembrado de Base de Datos Demo",
        detalles="Se inicializó la base de datos con datos simulados y usuarios demo para demostración."
    )
    BitacoraActividades.objects.create(
        usuario=u_admin,
        accion="Creación de Jabón",
        detalles="Creado jabón de avena en el inventario."
    )

    print("Sembrado finalizado con éxito!")

if __name__ == '__main__':
    run()
