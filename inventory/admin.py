from django.contrib import admin
from .models import Insumos, Jabon

# Personalización del encabezado del panel (Opcional pero recomendado)
admin.site.site_header = "Administración de Inventario Benys"
admin.site.index_title = "Panel de Control de Insumos y Jabones"
admin.site.site_title = "Benys Admin"


@admin.register(Insumos)
class InsumosAdmin(admin.ModelAdmin):
    # Columnas que verás en la lista principal
    list_display = ('nombre', 'cantidad_gramos', 'proveedor', 'fecha_ingreso')

    # Filtros laterales para encontrar datos rápido
    list_filter = ('proveedor', 'fecha_ingreso')

    # Buscador por nombre o proveedor
    search_fields = ('nombre', 'proveedor')

    # Orden predeterminado (por fecha de ingreso más reciente)
    ordering = ('-fecha_ingreso',)


@admin.register(Jabon)
class JabonAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'cantidad', 'peso_gramos', 'fecha_elaboracion')
    list_filter = ('categoria', 'fecha_elaboracion')
    search_fields = ('nombre',)

    # Esto permite editar la cantidad directamente desde la lista sin entrar al detalle
    list_editable = ('cantidad',)