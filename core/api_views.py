from django.http import JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Usuario, Producto
import os
import uuid
from django.forms.models import model_to_dict
from django.conf import settings  # ✅ ESTA LÍNEA
# from django.contrib.auth.hashers import make_password, check_password  # opcional si se desea seguridad

@csrf_exempt
@require_http_methods(["POST"])
def crear_usuario(request):
    try:
        data = json.loads(request.body)
        usuario = Usuario.objects.create(
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            direccion=data['direccion'],
            distrito=data['distrito'],
            dni=data['dni'],
            email=data['email'],
            celular=data['celular'],
            password=data['password']  # 🔐 puedes usar make_password(data['password']) si deseas
        )
        return JsonResponse({'message': 'Usuario creado correctamente'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def iniciar_sesion_api(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        usuario = Usuario.objects.filter(email=email).first()
        if usuario and usuario.password == password:  # 🔐 usa check_password si encriptas
            return JsonResponse({
                'message': 'Inicio de sesión exitoso',
                'usuario': {
                    'id': usuario.id,
                    'nombres': usuario.nombres,
                    'apellidos': usuario.apellidos,
                    'email': usuario.email,
                    'direccion': usuario.direccion,
                    'celular': usuario.celular,
                    'distrito': usuario.distrito
                }
            })
        else:
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET", "PUT"])
def usuario_detalle(request, id):
    try:
        usuario = Usuario.objects.get(id=id)
    except Usuario.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

    if request.method == 'GET':
        return JsonResponse({
            'id': usuario.id,
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'direccion': usuario.direccion,
            'distrito': usuario.distrito,
            'celular': usuario.celular,
            'email': usuario.email
        })

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            usuario.direccion = data.get('direccion', usuario.direccion)
            usuario.distrito = data.get('distrito', usuario.distrito)
            usuario.celular = data.get('celular', usuario.celular)
            usuario.save()
            return JsonResponse({'message': 'Perfil actualizado correctamente'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def crear_producto(request):
    if request.method == 'GET':
        productos = Producto.objects.select_related('vendedor').order_by('-creado_en')
        data = []

        for producto in productos:
            imagen_url = request.build_absolute_uri(producto.imagen.url)
            imagenes_secundarias_url = [
                request.build_absolute_uri(settings.MEDIA_URL + img) if not img.startswith('http') else img
                for img in producto.imagenes_secundarias or []
            ]

            data.append({
                'id': producto.id,
                'nombre': producto.nombre,
                'categoria': producto.categoria,
                'estado': producto.estado,
                'genero': producto.genero,
                'precio': str(producto.precioFinal),
                'descripcion': producto.descripcion,
                'imagen': imagen_url,
                'imagenes_secundarias': imagenes_secundarias_url,
                'vendedor': f"{producto.vendedor.nombres} {producto.vendedor.apellidos}",
                'vendido': producto.vendido,
                'creado_en': producto.creado_en.isoformat()
            })

        return JsonResponse(data, safe=False, status=200)

    if request.method == 'POST':
        try:
            nombre = request.POST.get('nombre')
            categoria = request.POST.get('categoria')
            estado = request.POST.get('estado')
            genero = request.POST.get('genero')
            precioFinal = request.POST.get('precioFinal')
            descripcion = request.POST.get('descripcion')
            vendedor_id = request.POST.get('vendedor_id')
            imagen = request.FILES.get('imagen')

            if not all([nombre, categoria, estado, genero, precioFinal, descripcion, vendedor_id, imagen]):
                return JsonResponse({'error': 'Faltan campos obligatorios'}, status=400)

            # Obtener y validar vendedor
            try:
                vendedor = Usuario.objects.get(id=vendedor_id)
            except Usuario.DoesNotExist:
                return JsonResponse({'error': 'Vendedor no encontrado'}, status=400)

            # Guardar imágenes secundarias como rutas
            imagenes_secundarias_archivos = request.FILES.getlist('imagenesSecundarias')
            if len(imagenes_secundarias_archivos) != 3:
                return JsonResponse({'error': 'Se requieren exactamente 3 imágenes secundarias'}, status=400)

            imagenes_secundarias_urls = []
            for archivo in imagenes_secundarias_archivos:
                nombre_archivo = f"{uuid.uuid4()}_{archivo.name}"
                ruta_relativa = f"productos/imagenes_secundarias/{nombre_archivo}"
                ruta_absoluta = os.path.join(settings.MEDIA_ROOT, 'productos', 'imagenes_secundarias', nombre_archivo)
                os.makedirs(os.path.dirname(ruta_absoluta), exist_ok=True)
                with open(ruta_absoluta, 'wb+') as destino:
                    for chunk in archivo.chunks():
                        destino.write(chunk)
                imagenes_secundarias_urls.append(ruta_relativa)

            producto = Producto.objects.create(
                nombre=nombre,
                categoria=categoria,
                estado=estado,
                genero=genero,
                precioFinal=precioFinal,
                descripcion=descripcion,
                imagen=imagen,
                imagenes_secundarias=imagenes_secundarias_urls,
                vendedor=vendedor
            )

            return JsonResponse({'message': 'Producto creado exitosamente'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@require_http_methods(["GET"])
def productos_por_usuario(request, id_usuario):
    try:
        usuario = Usuario.objects.get(id=id_usuario)
        productos = Producto.objects.filter(vendedor=usuario)

        lista = []
        for p in productos:
            lista.append({
                'id': p.id,
                'nombre': p.nombre,
                'categoria': p.categoria,
                'estado': p.estado,
                'genero': p.genero,
                'precioFinal': p.precioFinal,
                'descripcion': p.descripcion,
                'imagen': p.imagen.url if p.imagen else '',
                'vendido': p.vendido,
                'vendedor': f'{usuario.nombres} {usuario.apellidos}'
            })

        return JsonResponse(lista, safe=False)

    except Usuario.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_producto(request, id):
    try:
        producto = Producto.objects.get(id=id)
        producto.delete()
        return JsonResponse({'message': 'Producto eliminado'})
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    

@csrf_exempt
@require_http_methods(["GET"])
def detalle_producto_api(request, producto_id):
    try:
        producto = Producto.objects.select_related('vendedor').get(id=producto_id)
        imagen_url = request.build_absolute_uri(producto.imagen.url)
        imagenes_secundarias_url = [
            request.build_absolute_uri(settings.MEDIA_URL + img) if not img.startswith('http') else img
            for img in producto.imagenes_secundarias or []
        ]
        return JsonResponse({
            'id': producto.id,
            'nombre': producto.nombre,
            'categoria': producto.categoria,
            'estado': producto.estado,
            'genero': producto.genero,
            'precioFinal': str(producto.precioFinal),
            'descripcion': producto.descripcion,
            'imagen': imagen_url,
            'imagenes_secundarias': imagenes_secundarias_url,
            'vendedor': f"{producto.vendedor.nombres} {producto.vendedor.apellidos}",
            'vendido': producto.vendido,
            'creado_en': producto.creado_en.isoformat()
        })
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def obtener_producto_por_id(request, id):
    try:
        producto = Producto.objects.select_related('vendedor').get(id=id)

        imagen_url = request.build_absolute_uri(producto.imagen.url)
        imagenes_secundarias_url = [
            request.build_absolute_uri(settings.MEDIA_URL + img) if not img.startswith('http') else img
            for img in producto.imagenes_secundarias or []
        ]

        data = {
            'id': producto.id,
            'nombre': producto.nombre,
            'categoria': producto.categoria,
            'estado': producto.estado,
            'genero': producto.genero,
            'precio': str(producto.precioFinal),
            'descripcion': producto.descripcion,
            'imagen': imagen_url,
            'imagenes_secundarias': imagenes_secundarias_url,
            'vendedor': f"{producto.vendedor.nombres} {producto.vendedor.apellidos}",
            'vendido': producto.vendido,
            'creado_en': producto.creado_en.isoformat()
        }

        return JsonResponse(data, status=200)
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)


@csrf_exempt
@require_http_methods(["PUT"])
def cambiar_contrasena(request, id):
    try:
        usuario = Usuario.objects.get(id=id)
        data = json.loads(request.body)
        actual = data.get("actual")
        nueva = data.get("nueva")

        if usuario.password != actual:
            return JsonResponse({"error": "Contraseña actual incorrecta"}, status=400)

        usuario.password = nueva
        usuario.save()
        return JsonResponse({"message": "Contraseña actualizada correctamente"})

    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
