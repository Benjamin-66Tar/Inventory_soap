from django.db import models

class Insumos(models.Model):
    #Son detalle de los ingredientes del jabón
    nombre = models.CharField(max_length=100)
    cantidad_gramos = models.FloatField()
    proveedor = models.CharField(max_length=100)
    fecha_ingreso = models.DateField()

    def __str__(self):
        #Se mostrar el archivo administrador de Django y otros lugares
        return self.nombre

class Categoria(models.TextChoices):
    LAVANDERIA = 'LAV', 'Lavandería y Hogar'
    CUIDADO_PERSONAL = 'CP', 'Cuidado Personal y Piel'

class Jabon(models.Model):

    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField(default=0)

    categoria = models.CharField(
        max_length=3,
        choices=Categoria.choices,
        default=Categoria.CUIDADO_PERSONAL
    )

    fecha_elaboracion = models.DateField()
    peso_gramos = models.FloatField()

    def __str__(self):
        # Ahora el __str__ mostrará el nombre legible (ej: "Jabón de Avena (Cuidado Personal y Piel)")
        return f"{self.nombre} ({self.get_categoria_display()})"

class ConsumoInsumo(models.Model):
    insumo = models.ForeignKey(Insumos, on_delete=models.CASCADE, related_name='consumos')
    cantidad_usada = models.FloatField()
    fecha_uso = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Consumo de {self.cantidad_usada}g de {self.insumo.nombre}"

class MotivoSalida(models.TextChoices):
    VENTA = 'VENTA', 'Venta'
    REGALO = 'REGALO', 'Regalo'
    USO_PERSONAL = 'USO', 'Uso Personal'
    MERMA_DANO = 'MERMA', 'Merma/Daño'

class SalidaJabon(models.Model):
    jabon = models.ForeignKey(Jabon, on_delete=models.CASCADE, related_name='salidas')
    cantidad_salida = models.IntegerField()
    motivo_salida = models.CharField(
        max_length=10,
        choices=MotivoSalida.choices,
        default=MotivoSalida.VENTA
    )
    fecha_salida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.jabon.nombre} - {self.get_motivo_salida_display()}"


# inventory/models.py

class Receta(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    # Relación con insumos base para precargar (opcional)

    def __str__(self):
        return self.nombre


class Produccion(models.Model):
    TIPO_PRODUCCION = [
        ('ESTANDAR', 'Receta Estándar'),
        ('EXPERIMENTO', 'Experimento/Nuevo'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_PRODUCCION)
    receta = models.ForeignKey(Receta, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_elaboracion = models.DateTimeField(auto_now_add=True)
    unidades_resultantes = models.IntegerField(default=0)
    temperatura_mezcla = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notas = models.TextField(blank=True)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)


class DetalleProduccionInsumo(models.Model):
    """Corazón de la trazabilidad: relaciona la producción con lotes específicos de insumos"""
    produccion = models.ForeignKey(Produccion, related_name='detalles_insumos', on_delete=CASCADE)
    insumo = models.ForeignKey('Insumo', on_delete=models.CASCADE)
    lote_origen = models.CharField(max_length=50, help_text="ID del lote de materia prima")
    cantidad_utilizada = models.DecimalField(max_digits=10, decimal_places=2)
    costo_unitario_momento = models.DecimalField(max_digits=10, decimal_places=2)