from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
import uuid

class Insumos(models.Model):
    #Son detalle de los ingredientes del jabón
    nombre = models.CharField(max_length=100, unique=True)
    cantidad_gramos = models.FloatField(validators=[MinValueValidator(0.0)])
    proveedor = models.CharField(max_length=100)
    fecha_ingreso = models.DateField()
    umbral_advertencia = models.FloatField(default=100.0, validators=[MinValueValidator(0.0)])
    umbral_critico = models.FloatField(default=50.0, validators=[MinValueValidator(0.0)])

    def __str__(self):
        #Se mostrar el archivo administrador de Django y otros lugares
        return self.nombre

class ConfiguracionSistema(models.Model):
    unidad_peso = models.CharField(max_length=10, default='g')  # 'g', 'oz', 'pzs'
    dias_curado_defecto = models.IntegerField(default=28)
    umbral_critico_stock = models.IntegerField(default=5)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Configuración Global del Sistema"

class CategoriaEnum(models.TextChoices):
    LAVANDERIA = 'LAV', 'Lavandería y Hogar'
    CUIDADO_PERSONAL = 'CP', 'Cuidado Personal y Piel'

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Jabon(models.Model):
    nombre = models.CharField(max_length=100)
    cantidad = models.IntegerField(default=0)
    categoria = models.ForeignKey(
        'Categoria',
        on_delete=models.PROTECT,
        related_name='jabones'
    )
    fecha_elaboracion = models.DateField()
    peso_gramos = models.FloatField()

    def __str__(self):
        cat_nombre = self.categoria.nombre if self.categoria else "Sin Categoría"
        return f"{self.nombre} ({cat_nombre})"

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
    notas = models.TextField(blank=True, default='')
    fecha_salida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.jabon.nombre} - {self.get_motivo_salida_display()}"


class Receta(models.Model):
    jabon = models.OneToOneField(
        'Jabon',
        on_delete=models.CASCADE,
        related_name='receta',
        null=True,
        blank=True
    )
    cantidad_piezas_base = models.IntegerField(default=10)

    def __str__(self):
        jabon_nombre = self.jabon.nombre if self.jabon else "Desconocido"
        return f"Receta de {jabon_nombre} ({self.cantidad_piezas_base} piezas)"


class RecetaInsumo(models.Model):
    receta = models.ForeignKey(
        Receta,
        on_delete=models.CASCADE,
        related_name='ingredientes'
    )
    insumo = models.ForeignKey(
        'Insumos',
        on_delete=models.CASCADE
    )
    cantidad_base = models.FloatField()

    def __str__(self):
        return f"{self.cantidad_base}g de {self.insumo.nombre} para {self.receta}"


class Produccion(models.Model):
    TIPO_PRODUCCION = [
        ('ESTANDAR', 'Receta Estándar'),
        ('EXPERIMENTO', 'Experimento/Nuevo'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_PRODUCCION)
    receta = models.ForeignKey(Receta, on_delete=models.SET_NULL, null=True, blank=True)
    jabon_producido = models.ForeignKey(
        Jabon,
        on_delete=models.CASCADE,
        related_name='producciones',
        null=True,
        blank=True
    )
    fecha_elaboracion = models.DateTimeField(auto_now_add=True)
    unidades_resultantes = models.IntegerField(default=0)
    temperatura_mezcla = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notas = models.TextField(blank=True)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    en_curado = models.BooleanField(default=True)
    fecha_termino_curado = models.DateField(null=True, blank=True)
    completada = models.BooleanField(default=False)


class DetalleProduccionInsumo(models.Model):
    """Corazón de la trazabilidad: relaciona la producción con lotes específicos de insumos"""
    produccion = models.ForeignKey(Produccion, related_name='detalles_insumos', on_delete=models.CASCADE)
    insumo = models.ForeignKey('Insumos', on_delete=models.CASCADE)
    lote_origen = models.CharField(max_length=50, help_text="ID del lote de materia prima")
    cantidad_utilizada = models.DecimalField(max_digits=10, decimal_places=2)
    costo_unitario_momento = models.DecimalField(max_digits=10, decimal_places=2)

class RolUsuario(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    SUPERVISOR = 'SUPERVISOR', 'Supervisor'
    OPERADOR = 'OPERADOR', 'Operador'

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(
        max_length=15,
        choices=RolUsuario.choices,
        default=RolUsuario.OPERADOR
    )

    def __str__(self):
        return f"{self.user.username} ({self.get_rol_display()})"

class Invitacion(models.Model):
    email = models.EmailField(unique=True)
    rol = models.CharField(
        max_length=15,
        choices=RolUsuario.choices,
        default=RolUsuario.OPERADOR
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        from django.utils import timezone
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=48)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Invitación para {self.email} ({self.rol})"

class BitacoraActividades(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    accion = models.CharField(max_length=255)
    detalles = models.TextField(blank=True, default='')
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.usuario.username if self.usuario else "Sistema/Anónimo"
        return f"{self.fecha_hora} - {user_str}: {self.accion}"

class RecuperacionClave(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Código de recuperación para {self.email} ({self.code})"