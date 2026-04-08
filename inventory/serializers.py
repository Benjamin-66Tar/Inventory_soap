from rest_framework import serializers
from .models import Insumos, Jabon

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
