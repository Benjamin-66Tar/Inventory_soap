from rest_framework import viewsets
from .models import Insumos
from .serializers import InsumoSerializer

class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumoSerializer

