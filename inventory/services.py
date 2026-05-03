from django.db import transaction
from rest_framework import serializers
from .models import Produccion, DetalleProduccionInsumo
from datetime import timedelta
from django.utils import timezone


class ProduccionService:
    @staticmethod
    @transaction.atomic
    def registrar_produccion(datos_produccion, detalles_data):
        # 1. Validar Stock de insumos antes de procesar
        for detalle in detalles_data:
            insumo = detalle['insumo']
            cantidad = detalle['cantidad_utilizada']
            if insumo.cantidad_gramos < cantidad:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {insumo.nombre}. Disponible: {insumo.cantidad_gramos}g"
                )

        # --- SECCIÓN CRÍTICA: LÓGICA DE CURADO ---
        tiempo = datos_produccion.pop('tiempo_curado', None)
        unidad = datos_produccion.pop('unidad_tiempo', 'DIAS')

        # Usamos un bloque try/except para capturar valores que no sean números
        try:
            # REGLA LÓGICA: Si el usuario define un tiempo válido (ej. 1, 3, 15)
            if tiempo is not None and str(tiempo).strip() != "" and int(tiempo) > 0:
                valor = int(tiempo)
                if unidad == 'DIAS':
                    delta = timedelta(days=valor)
                elif unidad == 'SEMANAS':
                    delta = timedelta(weeks=valor)
                elif unidad == 'MESES':
                    delta = timedelta(days=valor * 30)

                fecha_fin = timezone.now().date() + delta
            else:
                # REGLA LÓGICA: Si NO define días o es 0 -> 28 días por defecto[cite: 1, 8]
                fecha_fin = timezone.now().date() + timedelta(days=28)
        except (ValueError, TypeError):
            # Si el dato llega corrupto, aplicamos el estándar de seguridad de 28 días
            fecha_fin = timezone.now().date() + timedelta(days=28)

        # 2. Crear el registro con la fecha final calculada[cite: 8]
        produccion = Produccion.objects.create(
            **datos_produccion,
            en_curado=True,
            fecha_termino_curado=fecha_fin
        )

        # 3. Actualizar Stock del Jabón Terminado[cite: 8]
        if produccion.jabon_producido and produccion.unidades_resultantes > 0:
            jabon = produccion.jabon_producido
            jabon.cantidad += produccion.unidades_resultantes
            jabon.save()

        # 4. Crear Detalles y Descontar Stock de Insumos[cite: 8]
        for detalle in detalles_data:
            insumo = detalle['insumo']
            cantidad = float(detalle['cantidad_utilizada'])
            costo = detalle.get('costo_unitario_momento') or getattr(insumo, 'precio_unitario', 0)

            DetalleProduccionInsumo.objects.create(
                produccion=produccion,
                insumo=insumo,
                cantidad_utilizada=cantidad,
                lote_origen=detalle['lote_origen'],
                costo_unitario_momento=costo
            )

            insumo.cantidad_gramos -= cantidad
            insumo.save()

        return produccion