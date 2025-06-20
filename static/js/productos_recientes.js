document.addEventListener('DOMContentLoaded', async function () {
  const contenedor = document.querySelector('.productos');
  const backendUrl = '/api/productos/';  // ✔️ corregido

  if (!contenedor) {
    console.error('No se encontró el contenedor .productos');
    return;
  }

  async function obtenerProductos() {
    try {
      const response = await fetch(backendUrl);
      const productos = await response.json();

      if (!Array.isArray(productos) || productos.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center;">No hay productos disponibles.</p>';
        return;
      }

      const ultimosProductos = productos.slice(0, 4);
      mostrarProductos(ultimosProductos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      contenedor.innerHTML = '<p style="text-align: center;">Error al cargar productos.</p>';
    }
  }

  function mostrarProductos(productos) {
    contenedor.innerHTML = '';

    productos.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto');

      const imagenSrc = producto.imagen || '';
      const precio = parseFloat(producto.precio ?? producto.precioFinal ?? 0);
      const precioFormateado = isNaN(precio) ? '0.00' : precio.toFixed(2);

      productoDiv.innerHTML = `
        <div class="prenda">
          <img class="imageprenda" src="${imagenSrc}" alt="Imagen de ${producto.nombre}">
        </div>
        <div class="info_prenda">
          <h3>${producto.nombre}</h3>
          <div class="precio_prenda">
            <p>S/ ${precioFormateado}</p>
          </div>
          <div class="precio_prenda">
            <span>${producto.estado}</span>
            <span>${producto.categoria}</span>
            <span>${producto.genero}</span>              
          </div>   
          <div class="vendedor">
            <span>${producto.vendedor}</span>     
          </div>
        </div>
        <button class="boton_agregar" data-id="${producto.id}">
          Lo quiero!
        </button>
      `;

      contenedor.appendChild(productoDiv);
    });

    contenedor.addEventListener('click', e => {
      const boton = e.target.closest('.boton_agregar');
      if (boton) {
        const id = boton.getAttribute('data-id');
        window.location.href = `/detalle/${id}/`;
      }
    });
  }

  obtenerProductos();
});
