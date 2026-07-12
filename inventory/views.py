import json
import random
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from django.http import HttpResponse

from .models import (
    Insumos, Jabon, ConsumoInsumo, SalidaJabon, Produccion, Categoria,
    ConfiguracionSistema, Receta, RecetaInsumo, PerfilUsuario, Invitacion,
    BitacoraActividades, RecuperacionClave, RolUsuario
)
from .serializers import (
    InsumoSerializer, JabonSerializer, ConsumoInsumoSerializer,
    SalidaJabonSerializer, ProduccionSerializer, CategoriaSerializer,
    ConfiguracionSistemaSerializer, RecetaSerializer, UserSerializer,
    InvitacionSerializer, BitacoraActividadesSerializer
)
from .permissions import (
    EsAdministrador, EsSupervisor, EsOperadorOMas, EsRecetaOCategoria
)

# Helper para registrar acciones en la bitácora
def registrar_bitacora(user, accion, detalles=''):
    try:
        u = user if (user and user.is_authenticated) else None
        BitacoraActividades.objects.create(usuario=u, accion=accion, detalles=detalles)
    except Exception as e:
        print("Error al registrar bitacora:", e)


# --- APIS DE AUTENTICACIÓN ---

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username_or_email', '').strip()
        password = request.data.get('password', '').strip()

        if not username_or_email or not password:
            return Response({'error': 'Por favor ingresa usuario/correo y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar por username o por email
        user = None
        if '@' in username_or_email:
            try:
                user = User.objects.get(email__iexact=username_or_email)
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(username__iexact=username_or_email)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response({'error': 'Credenciales incorrectas.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Esta cuenta ha sido suspendida. Contacta al Administrador.'}, status=status.HTTP_403_FORBIDDEN)

        # Autenticar
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user is None:
            return Response({'error': 'Credenciales incorrectas.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generar token
        token, created = Token.objects.get_or_create(user=authenticated_user)
        
        # Obtener rol
        perfil = getattr(authenticated_user, 'perfil', None)
        rol = perfil.rol if perfil else RolUsuario.OPERADOR
        rol_display = perfil.get_rol_display() if perfil else 'Operador'

        registrar_bitacora(authenticated_user, "Inicio de Sesión", f"Inicio de sesión exitoso en el sistema. Rol: {rol_display}")

        return Response({
            'token': token.key,
            'username': authenticated_user.username,
            'email': authenticated_user.email,
            'first_name': authenticated_user.first_name,
            'last_name': authenticated_user.last_name,
            'role': rol
        })


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Por favor ingresa tu correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'message': 'Si el correo está registrado, se enviará un código de recuperación.'})

        # Generar código de 6 dígitos
        code = f"{random.randint(100000, 999999)}"
        RecuperacionClave.objects.create(email=email, code=code)

        # MOCK de envío de correo en la terminal de Django
        print("\n" + "="*50)
        print(f"MOCK EMAIL ENVIADO A: {email}")
        print(f"CÓDIGO DE RECUPERACIÓN TEMPORAL: {code}")
        print("="*50 + "\n")

        registrar_bitacora(user, "Solicitud Recuperación Clave", f"Se generó código de recuperación temporal.")

        return Response({'message': 'Si el correo está registrado, se enviará un código de recuperación.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        code = request.data.get('code', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not email or not code or not new_password:
            return Response({'error': 'Por favor llena todos los campos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'Correo o código inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar último código
        recuperacion = RecuperacionClave.objects.filter(email__iexact=email, code=code, is_used=False).last()
        if not recuperacion:
            return Response({'error': 'Código de verificación incorrecto o ya utilizado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar expiración (15 minutos)
        limite = timezone.now() - timezone.timedelta(minutes=15)
        if recuperacion.created_at < limite:
            return Response({'error': 'El código de verificación ha expirado (límite 15 minutos).'}, status=status.HTTP_400_BAD_REQUEST)

        # Restablecer contraseña
        user.set_password(new_password)
        user.save()

        recuperacion.is_used = True
        recuperacion.save()

        registrar_bitacora(user, "Restablecimiento Contraseña", f"Contraseña restablecida correctamente vía código temporal.")

        return Response({'message': 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.'})


class InvitacionView(APIView):
    permission_classes = [EsAdministrador]

    def post(self, request):
        email = request.data.get('email', '').strip()
        rol = request.data.get('rol', '').strip()

        if not email or not rol:
            return Response({'error': 'Por favor proporciona el email y el rol.'}, status=status.HTTP_400_BAD_REQUEST)

        if rol not in RolUsuario.values:
            return Response({'error': 'Rol inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar si el email ya tiene una cuenta
        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Ya existe un usuario registrado con este correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear o actualizar invitación para este email
        Invitacion.objects.filter(email__iexact=email, is_used=False).delete()
        invitacion = Invitacion.objects.create(email=email, rol=rol)

        # Generar link de invitación
        link_registro = f"/registro?token={invitacion.token}"

        # MOCK de envío de correo en la terminal de Django
        print("\n" + "="*50)
        print(f"MOCK INVITACIÓN ENVIADA A: {email}")
        print(f"ROL ASIGNADO: {invitacion.get_rol_display()}")
        print(f"ENLACE ÚNICO DE REGISTRO: {link_registro}")
        print("="*50 + "\n")

        registrar_bitacora(request.user, "Envío de Invitación", f"Invitación enviada a {email} con rol {invitacion.get_rol_display()}")

        return Response({
            'message': f'Invitación enviada con éxito a {email}.',
            'link': link_registro
        })


class RegistroInvitacionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get('token', '')
        if not token:
            return Response({'error': 'Token no proporcionado.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitacion = Invitacion.objects.get(token=token)
        except (Invitacion.DoesNotExist, ValueError):
            return Response({'error': 'Invitación inválida.'}, status=status.HTTP_404_NOT_FOUND)

        if invitacion.is_used:
            return Response({'error': 'Este enlace de invitación ya ha sido utilizado.'}, status=status.HTTP_400_BAD_REQUEST)

        if invitacion.is_expired:
            return Response({'error': 'Este enlace de invitación ha expirado (validez de 48 horas).'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'email': invitacion.email,
            'rol': invitacion.rol,
            'rol_display': invitacion.get_rol_display()
        })

    def post(self, request):
        token = request.data.get('token', '').strip()
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()

        if not token or not username or not password or not first_name or not last_name:
            return Response({'error': 'Por favor completa todos los campos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitacion = Invitacion.objects.get(token=token)
        except (Invitacion.DoesNotExist, ValueError):
            return Response({'error': 'Invitación inválida.'}, status=status.HTTP_404_NOT_FOUND)

        if invitacion.is_used or invitacion.is_expired:
            return Response({'error': 'Invitación no disponible o expirada.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validaciones de usuario duplicado
        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'Este nombre de usuario ya está en uso. Por favor elige otro.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=invitacion.email).exists():
            return Response({'error': 'Este correo ya tiene un usuario asociado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario y perfil de forma transaccional
        try:
            with transaction.atomic():
                user = User.objects.create(
                    username=username,
                    email=invitacion.email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                user.set_password(password)
                user.save()

                PerfilUsuario.objects.create(user=user, rol=invitacion.rol)

                invitacion.is_used = True
                invitacion.save()

                registrar_bitacora(user, "Registro por Invitación", f"Usuario registrado exitosamente con rol {invitacion.get_rol_display()}")

                return Response({'message': '¡Registro completado con éxito! Ya puedes iniciar sesión.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Ocurrió un error en el registro: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- APIS DE ADMINISTRACIÓN ---

class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        # Excluir al admin activo para que no se suspenda o elimine a sí mismo
        return User.objects.all().exclude(pk=self.request.user.pk).order_by('-date_joined')

    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        user = self.get_object()
        is_active = request.data.get('is_active')
        
        if is_active is None:
            return Response({'error': 'is_active requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = bool(is_active)
        user.save()

        estado_str = "Activado" if user.is_active else "Suspendido"
        registrar_bitacora(request.user, f"Gestión Usuario - {estado_str}", f"Se cambió el estado del usuario {user.username} a {estado_str.lower()}.")

        return Response({'status': f'Usuario {estado_str.lower()} correctamente.'})

    @action(detail=True, methods=['patch'])
    def cambiar_rol(self, request, pk=None):
        user = self.get_object()
        nuevo_rol = request.data.get('rol')
        
        if not nuevo_rol or nuevo_rol not in RolUsuario.values:
            return Response({'error': 'Rol inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        perfil, created = PerfilUsuario.objects.get_or_create(user=user)
        rol_anterior = perfil.get_rol_display()
        perfil.rol = nuevo_rol
        perfil.save()

        registrar_bitacora(request.user, "Gestión Usuario - Cambio Rol", f"Se cambió el rol del usuario {user.username} de {rol_anterior} a {perfil.get_rol_display()}.")

        return Response({'status': 'Rol actualizado correctamente.'})

    @action(detail=False, methods=['get'])
    def invitaciones_pendientes(self, request):
        invs = Invitacion.objects.filter(is_used=False, expires_at__gt=timezone.now()).order_by('-fecha_creacion')
        serializer = InvitacionSerializer(invs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def eliminar_invitacion(self, request):
        inv_id = request.data.get('id')
        if not inv_id:
            return Response({'error': 'ID de invitación requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            inv = Invitacion.objects.get(id=inv_id)
            email = inv.email
            inv.delete()
            registrar_bitacora(request.user, "Gestión Usuario - Eliminar Invitación", f"Se eliminó la invitación pendiente para {email}.")
            return Response({'status': 'Invitación eliminada.'})
        except Invitacion.DoesNotExist:
            return Response({'error': 'Invitación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)


class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BitacoraActividades.objects.all().order_by('-fecha_hora')
    serializer_class = BitacoraActividadesSerializer
    permission_classes = [EsAdministrador]

    def get_queryset(self):
        queryset = BitacoraActividades.objects.all().order_by('-fecha_hora')
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(accion__icontains=search) | 
                Q(detalles__icontains=search) | 
                Q(usuario__username__icontains=search)
            )
        return queryset


class BackupRestoreView(APIView):
    permission_classes = [EsAdministrador]

    def get(self, request):
        """Exportar datos en formato JSON"""
        data = {
            'categorias': list(Categoria.objects.all().values('id', 'nombre')),
            'insumos': list(Insumos.objects.all().values('id', 'nombre', 'cantidad_gramos', 'proveedor', 'fecha_ingreso')),
            'jabones': list(Jabon.objects.all().values('id', 'nombre', 'cantidad', 'categoria_id', 'fecha_elaboracion', 'peso_gramos')),
            'recetas': list(Receta.objects.all().values('id', 'jabon_id', 'cantidad_piezas_base')),
            'recetas_insumos': list(RecetaInsumo.objects.all().values('id', 'receta_id', 'insumo_id', 'cantidad_base')),
            'producciones': list(Produccion.objects.all().values(
                'id', 'tipo', 'receta_id', 'jabon_producido_id', 'fecha_elaboracion', 'unidades_resultantes',
                'temperatura_mezcla', 'notas', 'costo_total', 'en_curado', 'fecha_termino_curado', 'completada'
            )),
            'salidas': list(SalidaJabon.objects.all().values('id', 'jabon_id', 'cantidad_salida', 'motivo_salida', 'notas', 'fecha_salida')),
            'consumos': list(ConsumoInsumo.objects.all().values('id', 'insumo_id', 'cantidad_usada', 'fecha_uso')),
        }
        
        # Formatear fechas a string para evitar errores de serialización
        for k in ['insumos', 'jabones', 'producciones', 'salidas', 'consumos']:
            for row in data[k]:
                for field in ['fecha_ingreso', 'fecha_elaboracion', 'fecha_termino_curado', 'fecha_salida', 'fecha_uso']:
                    if field in row and row[field]:
                        row[field] = str(row[field])

        # Formatear DecimalFields a float
        for row in data['producciones']:
            if row['temperatura_mezcla'] is not None: row['temperatura_mezcla'] = float(row['temperatura_mezcla'])
            if row['costo_total'] is not None: row['costo_total'] = float(row['costo_total'])

        response = HttpResponse(json.dumps(data, indent=4), content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="respaldo_inventario_benys.json"'
        
        registrar_bitacora(request.user, "Respaldo - Exportar Datos", "Se exportó la base de datos completa a un archivo JSON.")
        return response

    def post(self, request):
        """Importar datos masivamente desde un JSON cargado"""
        archivo = request.FILES.get('file')
        if not archivo:
            return Response({'error': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            content = archivo.read()
            data = json.loads(content)
        except Exception as e:
            return Response({'error': f'Archivo inválido: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        required_keys = ['categorias', 'insumos', 'jabones', 'recetas', 'recetas_insumos', 'producciones', 'salidas', 'consumos']
        if not all(k in data for k in required_keys):
            return Response({'error': 'El archivo no contiene la estructura de respaldo correcta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                ConsumoInsumo.objects.all().delete()
                SalidaJabon.objects.all().delete()
                DetalleProduccionInsumo.objects.all().delete()
                Produccion.objects.all().delete()
                RecetaInsumo.objects.all().delete()
                Receta.objects.all().delete()
                Jabon.objects.all().delete()
                Categoria.objects.all().delete()
                Insumos.objects.all().delete()

                # 1. Cargar Categorías
                for item in data['categorias']:
                    Categoria.objects.create(id=item['id'], nombre=item['nombre'])

                # 2. Cargar Insumos
                for item in data['insumos']:
                    Insumos.objects.create(
                        id=item['id'], nombre=item['nombre'], cantidad_gramos=item['cantidad_gramos'],
                        proveedor=item['proveedor'], fecha_ingreso=item['fecha_ingreso']
                    )

                # 3. Cargar Jabones
                for item in data['jabones']:
                    Jabon.objects.create(
                        id=item['id'], nombre=item['nombre'], cantidad=item['cantidad'],
                        categoria_id=item['categoria_id'], fecha_elaboracion=item['fecha_elaboracion'],
                        peso_gramos=item['peso_gramos']
                    )

                # 4. Cargar Recetas
                for item in data['recetas']:
                    Receta.objects.create(id=item['id'], jabon_id=item['jabon_id'], cantidad_piezas_base=item['cantidad_piezas_base'])

                # 5. Cargar Recetas Insumos
                for item in data['recetas_insumos']:
                    RecetaInsumo.objects.create(
                        id=item['id'], receta_id=item['receta_id'], insumo_id=item['insumo_id'],
                        amount=item['cantidad_base'] if 'cantidad_base' in item else item.get('cantidad_base', 0.0)
                    )

                # 6. Cargar Producciones
                for item in data['producciones']:
                    Produccion.objects.create(
                        id=item['id'], tipo=item['tipo'], receta_id=item['receta_id'],
                        jabon_producido_id=item['jabon_producido_id'], fecha_elaboracion=item['fecha_elaboracion'],
                        unidades_resultantes=item['unidades_resultantes'], temperatura_mezcla=item['temperatura_mezcla'],
                        notes=item.get('notas', ''), costo_total=item['costo_total'], en_curado=item['en_curado'],
                        fecha_termino_curado=item['fecha_termino_curado'] if item['fecha_termino_curado'] and item['fecha_termino_curado'] != 'None' else None,
                        completada=item['completada']
                    )

                # 7. Cargar Salidas
                for item in data['salidas']:
                    SalidaJabon.objects.create(
                        id=item['id'], jabon_id=item['jabon_id'], cantidad_salida=item['cantidad_salida'],
                        motivo_salida=item['motivo_salida'], notas=item.get('notas', '')
                    )

                # 8. Cargar Consumos
                for item in data['consumos']:
                    ConsumoInsumo.objects.create(
                        id=item['id'], insumo_id=item['insumo_id'], cantidad_usada=item['cantidad_usada']
                    )

            registrar_bitacora(request.user, "Respaldo - Importar Datos", "Se importó una base de datos de respaldo con éxito, sobreescribiendo el inventario.")
            return Response({'status': 'Importación exitosa. La base de datos ha sido restaurada.'})
        except Exception as e:
            return Response({'error': f'Error al restaurar datos: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- VIEWSETS DE INVENTARIO Y PRODUCCIÓN PROTEGIDOS ---

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EsRecetaOCategoria]

    def perform_create(self, serializer):
        cat = serializer.save()
        registrar_bitacora(self.request.user, "Crear Categoría", f"Se creó la categoría de jabones: {cat.nombre}")

    def perform_destroy(self, instance):
        nombre = instance.nombre
        instance.delete()
        registrar_bitacora(self.request.user, "Eliminar Categoría", f"Se eliminó la categoría: {nombre}")


class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    permission_classes = [EsRecetaOCategoria]

    def get_queryset(self):
        queryset = Receta.objects.all()
        jabon_id = self.request.query_params.get('jabon', None)
        if jabon_id is not None:
            queryset = queryset.filter(jabon_id=jabon_id)
        return queryset

    def perform_create(self, serializer):
        receta = serializer.save()
        jabon_nombre = receta.jabon.nombre if receta.jabon else "Desconocido"
        registrar_bitacora(self.request.user, "Crear Receta", f"Se creó receta estándar para el jabón: {jabon_nombre}")

    def perform_update(self, serializer):
        receta = serializer.save()
        jabon_nombre = receta.jabon.nombre if receta.jabon else "Desconocido"
        registrar_bitacora(self.request.user, "Editar Receta", f"Se actualizó la receta estándar para el jabón: {jabon_nombre}")


class ConfiguracionSistemaView(APIView):
    permission_classes = [EsRecetaOCategoria]  # Lectura para todos, escritura solo Admin

    def get(self, request):
        config = ConfiguracionSistema.get_solo()
        serializer = ConfiguracionSistemaSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = ConfiguracionSistema.get_solo()
        serializer = ConfiguracionSistemaSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            registrar_bitacora(request.user, "Modificar Configuración", "Se cambiaron los parámetros generales del sistema.")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumoSerializer
    permission_classes = [EsOperadorOMas]

    def perform_create(self, serializer):
        insumo = serializer.save()
        registrar_bitacora(self.request.user, "Registrar Insumo", f"Se registró nueva materia prima: {insumo.nombre} ({insumo.cantidad_gramos}g)")

    def perform_update(self, serializer):
        insumo = serializer.save()
        registrar_bitacora(self.request.user, "Modificar Insumo", f"Se actualizó o reabasteció la materia prima: {insumo.nombre} (Cantidad actual: {insumo.cantidad_gramos}g)")


class JabonViewSet(viewsets.ModelViewSet):
    queryset = Jabon.objects.all()
    serializer_class = JabonSerializer
    permission_classes = [EsOperadorOMas]

    def get_permissions(self):
        if self.action == 'destroy':
            return [EsAdministrador()]
        return super().get_permissions()

    def perform_create(self, serializer):
        jabon = serializer.save()
        registrar_bitacora(self.request.user, "Crear Perfil Jabón", f"Se registró un nuevo tipo de jabón en catálogo: {jabon.nombre}")

    def perform_destroy(self, instance):
        nombre = instance.nombre
        instance.delete()
        registrar_bitacora(
            self.request.user, 
            "Eliminar Jabón", 
            f"Se eliminó por completo el tipo de jabón del catálogo: {nombre} y todos sus registros asociados."
        )


class ConsumoInsumoViewSet(viewsets.ModelViewSet):
    queryset = ConsumoInsumo.objects.all()
    serializer_class = ConsumoInsumoSerializer
    permission_classes = [EsOperadorOMas]


class SalidaJabonViewSet(viewsets.ModelViewSet):
    queryset = SalidaJabon.objects.all()
    serializer_class = SalidaJabonSerializer
    permission_classes = [EsOperadorOMas]

    def perform_create(self, serializer):
        salida = serializer.save()
        registrar_bitacora(
            self.request.user, "Registrar Salida Jabón", 
            f"Se retiraron {salida.cantidad_salida} piezas de {salida.jabon.nombre}. Motivo: {salida.get_motivo_salida_display()}. Notas: {salida.notas}"
        )


class ProduccionViewSet(viewsets.ModelViewSet):
    queryset = Produccion.objects.all()
    serializer_class = ProduccionSerializer
    permission_classes = [EsOperadorOMas]

    def perform_create(self, serializer):
        prod = serializer.save()
        jabon_nombre = prod.jabon_producido.nombre if prod.jabon_producido else "Desconocido"
        registrar_bitacora(
            self.request.user, "Registrar Producción", 
            f"Se fabricó lote P-{prod.id} de {jabon_nombre} ({prod.unidades_resultantes} pzs). Tipo: {prod.tipo}"
        )

    @action(detail=True, methods=['post'])
    def finalizar_curado(self, request, pk=None):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil or perfil.rol not in [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]:
            return Response({'error': 'No tienes permisos para finalizar el curado.'}, status=status.HTTP_403_FORBIDDEN)

        produccion = self.get_object()

        produccion.en_curado = False
        produccion.completada = True
        produccion.save()

        if produccion.jabon_producido and produccion.unidades_resultantes > 0:
            jabon = produccion.jabon_producido
            jabon.cantidad += produccion.unidades_resultantes
            jabon.save()

        jabon_nombre = produccion.jabon_producido.nombre if produccion.jabon_producido else "Desconocido"
        registrar_bitacora(
            request.user, "Finalizar Curado", 
            f"Se completó el curado del lote P-{produccion.id} ({produccion.unidades_resultantes} pzs de {jabon_nombre}). Movidos a inventario listo."
        )

        return Response({'status': 'Jabón movido al inventario correctamente'})