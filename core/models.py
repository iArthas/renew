from django.db import models

class Usuario(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255)
    distrito = models.CharField(max_length=100)
    dni = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    celular = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    creadoEl = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"


class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50)
    estado = models.CharField(max_length=50)
    genero = models.CharField(max_length=20)
    precioFinal = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='productos/')
    imagenes_secundarias = models.JSONField(null=True, blank=True)
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    vendido = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre


class Venta(models.Model):
    comprador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='compras')
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ventas')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    direccion_calle = models.CharField(max_length=255)
    distrito = models.CharField(max_length=100)
    precio_producto = models.DecimalField(max_digits=10, decimal_places=2)
    monto_envio = models.DecimalField(max_digits=10, decimal_places=2)
    total_pago = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_venta = models.DateTimeField(auto_now_add=True)
    metodo_pago = models.CharField(max_length=50, null=True, blank=True)
    estado_envio = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f"Venta #{self.id}"
