document.addEventListener('DOMContentLoaded', function () {
  const pathParts = window.location.pathname.split('/');
  const productoId = pathParts[pathParts.length - 2];

  if (!productoId) {
    console.error('No se encontró el ID del producto.');
    return;
  }

  const backendUrl = window.location.origin;

  fetch(`${backendUrl}/api/productos/${productoId}/`)
    .then(res => {
      if (!res.ok) throw new Error('Producto no encontrado');
      return res.json();
    })
    .then(producto => {
      document.getElementById('imagen_producto').src = producto.imagen;
      document.getElementById('imagen_producto').alt = `Imagen de ${producto.nombre || 'producto'}`;
      document.getElementById('nombre_producto').textContent = producto.nombre || 'Sin nombre';
      document.getElementById('precio_producto').textContent = 'S/ ' + (producto.precio || '0.00');
      document.getElementById('categoria_producto').textContent = producto.categoria || 'N/A';
      document.getElementById('estado_producto').textContent = producto.estado || 'N/A';
      document.getElementById('genero_producto').textContent = producto.genero || 'N/A';
      document.getElementById('nombre_vendedor').textContent = producto.vendedor || 'N/A';
      document.getElementById('descripcion_producto').textContent = producto.descripcion || 'Sin descripción.';

      // 🔧 Galería secundaria
      const contenedorSecundarias = document.getElementById('imagenes_secundarias');
      if (contenedorSecundarias && producto.imagenes_secundarias) {
        try {
          let imagenesArray = producto.imagenes_secundarias;
          // Asegúrate de que esté en formato de array
          if (typeof imagenesArray === 'string') {
            imagenesArray = JSON.parse(imagenesArray);
          }

          if (Array.isArray(imagenesArray)) {
            contenedorSecundarias.innerHTML = '';
            imagenesArray.forEach((imgSrc, index) => {
              const img = document.createElement('img');
              img.src = imgSrc;
              img.alt = `Imagen secundaria ${index + 1}`;
              img.classList.add('imagen-secundaria');
              contenedorSecundarias.appendChild(img);
            });
          }
        } catch (err) {
          console.warn("Error procesando imagenes_secundarias:", err);
        }
      }

      const botonComprar = document.getElementById('boton_comprar');
      if (botonComprar) {
        botonComprar.addEventListener('click', () => {
          const isLoggedIn = localStorage.getItem('isLoggedIn');
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));

          if (isLoggedIn !== 'true') {
            alert('Por favor inicia sesión para continuar con la compra.');
            const redir = encodeURIComponent(window.location.href);
            window.location.href = `/iniciar-sesion/?redirect=${redir}`;
            return;
          }

          if (!currentUser || !currentUser.nombres || !currentUser.apellidos) {
            alert('No se encontró el usuario en sesión.');
            window.location.href = `/iniciar-sesion/?redirect=${encodeURIComponent(window.location.href)}`;
            return;
          }

          const nombreUsuario = `${currentUser.nombres} ${currentUser.apellidos}`.toLowerCase();
          const nombreVendedor = (producto.vendedor || '').toLowerCase();

          if (nombreUsuario === nombreVendedor) {
            alert("Este producto lo vendes tú.");
            window.location.href = '/perfil/#vendo';
          } else {
            window.location.href = `/resumen-compra/?id=${productoId}`;
          }
        });
      }
    })
    .catch(error => {
      console.error(error);
      alert('Error al cargar el producto.');
    });
});
