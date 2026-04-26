from rest_framework import serializers
from .models import Insumos, Jabon, ConsumoInsumo, SalidaJabon, DetalleProduccionInsumo, Produccion

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

class JabonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jabon

        fields = ['id', 'nombre', 'cantidad', 'categoria', 'fecha_elaboracion', 'peso_gramos']

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


class ProduccionSerializer(serializers.ModelSerializer):
    detalles_insumos = DetalleProduccionSerializer(many=True)

    class Meta:
        model = Produccion
        fields = '__all__'

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles_insumos')
        produccion = Produccion.objects.create(**validated_data)

        for detalle in detalles_data:
            insumo = detalle['insumo']
            # CORRECCIÓN: Usar 'cantidad_gramos' en lugar de 'stock'
            insumo.cantidad_gramos -= detalle['cantidad_utilizada']
            insumo.save()

            DetalleProduccionInsumo.objects.create(produccion=produccion, **detalle)

        return produccion