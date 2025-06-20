from django.urls import path
from . import views
from . import api_views
from core.api_views import crear_producto
from .api_views import productos_por_usuario, eliminar_producto

urlpatterns = [
    # Páginas HTML
    path('', views.index, name='index'),
    path('productos/', views.productos, name='productos'),
    path('vender/', views.vender, name='vender'),
    path('perfil/', views.perfil, name='perfil'),
    path('registrarse/', views.registrarse, name='registrarse'),
    path('iniciar-sesion/', views.iniciar_sesion, name='iniciar_sesion'),
    path('resumen-compra/', views.resumen_compra, name='resumen_compra'),
    path('pasarela-pago/', views.pasarela_pago, name='pasarela_pago'),
    path('detalle/<int:producto_id>/', views.detalle_producto, name='detalle_producto'),

    # API endpoints personalizados (solo backend funcional)
    path('api/usuarios/', api_views.crear_usuario, name='crear_usuario'),
    path('api/iniciar-sesion/', api_views.iniciar_sesion_api, name='iniciar_sesion_api'),
    path('api/usuarios/<int:id>', api_views.usuario_detalle, name='usuario_detalle'),
    path('api/productos/', crear_producto, name='crear_producto'),
    path('api/usuarios/<int:id_usuario>/productos', productos_por_usuario, name='productos_por_usuario'),
    path('api/productos/<int:id>', eliminar_producto, name='eliminar_producto'),
    path('api/productos/<int:id>', api_views.obtener_producto_por_id, name='obtener_producto_por_id'),
    path('api/productos/<int:id>/', api_views.obtener_producto_por_id, name='obtener_producto_por_id'),
    path('api/usuarios/<int:id>/', api_views.usuario_detalle, name='usuario_detalle'),
    path('api/usuarios/<int:id>/password', api_views.cambiar_contrasena, name='cambiar_contrasena'),

]
