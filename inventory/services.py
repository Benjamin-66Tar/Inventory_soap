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

        try:
            # Verificamos si tiempo existe y no es nulo/vacío
            if tiempo is not None and str(tiempo).strip() != "":
                valor = int(tiempo)
                if valor > 0:
                    if unidad == 'DIAS':
                        delta = timedelta(days=valor)
                    elif unidad == 'SEMANAS':
                        delta = timedelta(weeks=valor)
                    elif unidad == 'MESES':
                        delta = timedelta(days=valor * 30)

                    fecha_fin = timezone.now().date() + delta
                else:
                    # Si el usuario puso 0, aplicamos el default
                    fecha_fin = timezone.now().date() + timedelta(days=28)
            else:
                # Si tiempo es None o vacío
                fecha_fin = timezone.now().date() + timedelta(days=28)
        except (ValueError, TypeError):
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