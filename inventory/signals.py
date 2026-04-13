from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ConsumoInsumo, SalidaJabon

@receiver(post_save, sender=ConsumoInsumo)
def descontar_inventario(sender, instance, created, **kwargs):
    if created:
        insumo = instance.insumo
        insumo.cantidad_gramos -= instance.cantidad_usada
        insumo.save()

@receiver(post_save, sender=SalidaJabon)
def descontar_stock_jabon(sender, instance, created, **kwargs):
    if created:
        jabon = instance.jabon
        jabon.cantidad -= instance.cantidad_salida
        jabon.save()