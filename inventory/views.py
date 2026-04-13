from rest_framework import viewsets
from .models import Insumos, Jabon, ConsumoInsumo, SalidaJabon
from .serializers import InsumoSerializer, JabonSerializer, ConsumoInsumoSerializer, SalidaJabonSerializer

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