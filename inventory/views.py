from rest_framework import viewsets
from .models import Insumos, Jabon, ConsumoInsumo, SalidaJabon, Produccion
from .serializers import InsumoSerializer, JabonSerializer, ConsumoInsumoSerializer, SalidaJabonSerializer, ProduccionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumoSerializer

class JabonViewSet(viewsets.ModelViewSet):
    queryset = Jabon.objects.all()
    serializer_class = JabonSerializer

class ConsumoInsumoViewSet(viewsets.ModelViewSet):
    queryset = ConsumoInsumo.objects.all()
    serializer_class = ConsumoInsumoSerializer

class SalidaJabonViewSet(viewsets.ModelViewSet):
    queryset = SalidaJabon.objects.all()
    serializer_class = SalidaJabonSerializer

class ProduccionViewSet(viewsets.ModelViewSet):
    queryset = Produccion.objects.all()
    serializer_class = ProduccionSerializer

    @action(detail=True, methods=['post'])
    def finalizar_curado(self, request, pk=None):
        """Cambia el estado del lote para que deje de aparecer en el panel de curado"""
        produccion = self.get_object()  #

        # Cambiamos los estados según tus modelos
        produccion.en_curado = False  #
        produccion.completada = True  #
        produccion.save()  #

        # Sumamos las unidades al inventario listo para usar
        if produccion.jabon_producido and produccion.unidades_resultantes > 0:
            jabon = produccion.jabon_producido
            jabon.cantidad += produccion.unidades_resultantes
            jabon.save()

        return Response({'status': 'Jabón movido al inventario correctamente'})