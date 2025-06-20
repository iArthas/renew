from django.shortcuts import render
from rest_framework import generics
from .models import Usuario
from .serializers import UsuarioSerializer

def index(request):
    return render(request, 'core/index.html')

def productos(request):
    return render(request, 'core/productos.html')

def vender(request):
    return render(request, 'core/vender.html')

def perfil(request):
    return render(request, 'core/perfil.html')

def registrarse(request):
    return render(request, 'core/registrarse.html')

def iniciar_sesion(request):
    return render(request, 'core/iniciar_sesion.html')

def resumen_compra(request):
    return render(request, 'core/resumen_compra.html')

def pasarela_pago(request):
    return render(request, 'core/pasarela_pago.html')

def detalle_producto(request, producto_id):
    return render(request, 'core/detalles_producto.html', {
        'producto_id': producto_id
    })


class UsuarioListCreate(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class UsuarioDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer