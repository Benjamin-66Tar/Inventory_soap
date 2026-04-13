from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ConsumoInsumo

@receiver(post_save, sender=ConsumoInsumo)
def descontar_inventario(sender, instance, created, **kwargs):
    if created:
        insumo = instance.insumo
        insumo.cantidad_gramos -= instance.cantidad_usada
        insumo.save()