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