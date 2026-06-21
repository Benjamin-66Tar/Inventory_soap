from rest_framework import serializers
from .models import Insumos, Jabon, ConsumoInsumo, SalidaJabon, DetalleProduccionInsumo, Produccion, Categoria, ConfiguracionSistema, Receta, RecetaInsumo
from django.db import transaction
from  .services import ProduccionService

class InsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumos
        #Aquí defines que datos quieres enviar a react
        fields = ['id', 'nombre', 'cantidad_gramos', 'proveedor', 'fecha_ingreso']

    def validate_cantidad_gramos(self, value):
        #Es un validador en el caso de un productos se este ponga negativo
        if value < 0:
            raise serializers.ValidationError("¡Cuidado! No puedes tener inventario negativo.")
        return value

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

class ConfiguracionSistemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSistema
        fields = ['unidad_peso', 'dias_curado_defecto', 'umbral_critico_stock']

class RecetaInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.ReadOnlyField(source='insumo.nombre')

    class Meta:
        model = RecetaInsumo
        fields = ['id', 'insumo', 'insumo_nombre', 'cantidad_base']

class RecetaSerializer(serializers.ModelSerializer):
    ingredientes = RecetaInsumoSerializer(many=True)
    jabon_nombre = serializers.ReadOnlyField(source='jabon.nombre')

    class Meta:
        model = Receta
        fields = ['id', 'jabon', 'jabon_nombre', 'cantidad_piezas_base', 'ingredientes']

    def create(self, validated_data):
        ingredientes_data = validated_data.pop('ingredientes')
        receta = Receta.objects.create(**validated_data)
        for ing in ingredientes_data:
            RecetaInsumo.objects.create(receta=receta, **ing)
        return receta

    def update(self, instance, validated_data):
        ingredientes_data = validated_data.pop('ingredientes', None)
        instance.cantidad_piezas_base = validated_data.get('cantidad_piezas_base', instance.cantidad_piezas_base)
        instance.jabon = validated_data.get('jabon', instance.jabon)
        instance.save()

        if ingredientes_data is not None:
            # Delete old ingredients and recreate
            instance.ingredientes.all().delete()
            for ing in ingredientes_data:
                RecetaInsumo.objects.create(receta=instance, **ing)
        return instance

class JabonSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    cantidad_curando = serializers.SerializerMethodField()
    cantidad_lista = serializers.SerializerMethodField()

    class Meta:
        model = Jabon
        fields = [
            'id', 'nombre', 'cantidad', 'categoria', 'categoria_nombre', 'fecha_elaboracion', 
            'peso_gramos', 'cantidad_curando', 'cantidad_lista'
        ]

    def get_cantidad_curando(self, obj):
        from django.db.models import Sum
        total = obj.producciones.filter(en_curado=True).aggregate(Sum('unidades_resultantes'))['unidades_resultantes__sum']
        return total if total is not None else 0

    def get_cantidad_lista(self, obj):
        return obj.cantidad

class ConsumoInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumoInsumo
        fields = '__all__'

class SalidaJabonSerializer(serializers.ModelSerializer):
    # Esto permite ver el nombre del motivo en lugar del código (ej: 'Venta' en lugar de 'VENTA')
    motivo_display = serializers.CharField(source='get_motivo_salida_display', read_only=True)

    class Meta:
        model = SalidaJabon
        fields = ['id', 'jabon', 'cantidad_salida', 'motivo_salida', 'motivo_display', 'fecha_salida']


class DetalleProduccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleProduccionInsumo
        fields = ['insumo', 'lote_origen', 'cantidad_utilizada', 'costo_unitario_momento']
        extra_kwargs = {
            'costo_unitario_momento': {'required': False, 'allow_null': True}
        }


class ProduccionSerializer(serializers.ModelSerializer):
    jabon_nombre = serializers.ReadOnlyField(source='jabon_producido.nombre')
    jabon_categoria_nombre = serializers.ReadOnlyField(source='jabon_producido.categoria.nombre')
    detalles_insumos = DetalleProduccionSerializer(many=True, required=False)

    tiempo_curado = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    unidad_tiempo = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Produccion
        fields = [
            'id', 'tipo', 'receta', 'jabon_producido', 'jabon_nombre', 'jabon_categoria_nombre',
            'fecha_elaboracion', 'unidades_resultantes', 'temperatura_mezcla', 'notas',
            'costo_total', 'en_curado', 'fecha_termino_curado', 'completada', 'detalles_insumos',
            'tiempo_curado', 'unidad_tiempo'
        ]

    def create(self, validated_data):
        # Extraemos los detalles para enviarlos al servicio por separado
        detalles_data = validated_data.pop('detalles_insumos')

        # Llamada al Service Layer
        return ProduccionService.registrar_produccion(validated_data, detalles_data)