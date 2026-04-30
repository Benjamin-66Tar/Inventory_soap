from django.db import transaction
from rest_framework import serializers
from .models import Produccion, DetalleProduccionInsumo


class ProduccionService:
    @staticmethod
    @transaction.atomic
    def registrar_produccion(datos_produccion, detalles_data):
        # 1. Validar Stock de todos los insumos antes de procesar
        for detalle in detalles_data:
            insumo = detalle['insumo']
            cantidad = detalle['cantidad_utilizada']
            if insumo.cantidad_gramos < cantidad:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {insumo.nombre}. Disponible: {insumo.cantidad_gramos}g"
                )

        # 2. Crear la cabecera de Producción
        produccion = Produccion.objects.create(**datos_produccion)

        # 3. Actualizar Stock del Jabón Terminado
        if produccion.jabon_producido and produccion.unidades_resultantes > 0:
            jabon = produccion.jabon_producido
            jabon.cantidad += produccion.unidades_resultantes
            jabon.save()

        # 4. Crear Detalles y Descontar Stock de Insumos
        for detalle in detalles_data:
            insumo = detalle['insumo']
            cantidad = float(detalle['cantidad_utilizada'])

            # Obtener costo del insumo (asumiendo que podría no estar en el detalle)
            costo = detalle.get('costo_unitario_momento') or getattr(insumo, 'precio_unitario', 0)

            DetalleProduccionInsumo.objects.create(
                produccion=produccion,
                insumo=insumo,
                cantidad_utilizada=cantidad,
                lote_origen=detalle['lote_origen'],
                costo_unitario_momento=costo
            )

            # Descuento real de materia prima
            insumo.cantidad_gramos -= cantidad
            insumo.save()

        return produccion