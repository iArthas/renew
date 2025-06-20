document.addEventListener('DOMContentLoaded', async function () {
  const listaProductos = document.querySelector('.lista_productos');
  const footer = document.querySelector('footer');

  const filtroCategoria = document.getElementById('filtro-categoria');
  const filtroGenero = document.getElementById('filtro-genero');
  const botonFiltrar = document.querySelector('.aplicar_filtros');

  let productos = [];

  if (footer) footer.style.display = 'none';

  async function obtenerProductos() {
    try {
      const response = await fetch('/api/productos/');
      if (!response.ok) throw new Error("No se pudo cargar");

      productos = await response.json();
      mostrarProductos(productos);
      aplicarCategoriaGuardada();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      listaProductos.innerHTML = '<p style="text-align: center;">No se pudieron cargar los productos.</p>';
      if (footer) footer.style.display = 'none';

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos.',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  }

  function mostrarProductos(productosFiltrados) {
    listaProductos.innerHTML = '';

    if (productosFiltrados.length === 0) {
      listaProductos.innerHTML = '<p style="text-align: center;">No se encontraron productos.</p>';
      listaProductos.style.height = '100vh';
      if (footer) footer.style.display = 'none';
      return;
    }

    productosFiltrados.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto');

      // Si usas MEDIA_URL en Django
      let imagenSrc = producto.imagen;
      if (!imagenSrc.startsWith('http')) {
        imagenSrc = '/media/' + imagenSrc;
      }

      productoDiv.innerHTML = `
        <a href="/detalle/${producto.id}/">
          <div class="prenda">
            <img class="imageprenda" src="${imagenSrc}" alt="prenda">
          </div>
        </a>
        <div class="info_prenda">
          <a href="/detalle/${producto.id}/">
            <h3>${producto.nombre}</h3>
          </a>
          <div class="precio_prenda">
            <p>S/ ${producto.precio}</p>
          </div>
          <div class="precio_prenda">
            <span>${producto.estado}</span>
            <span>${producto.categoria}</span>
            <span>${producto.genero}</span>              
          </div>   
          <div class="vendedor" style="display: none;">
            <span>${producto.vendedor?.nombre || ''}</span>     
          </div>
        </div>
        <button class="boton_agregar" data-id="${producto.id}">
          Lo quiero!
        </button>
      `;

      listaProductos.appendChild(productoDiv);
    });

    listaProductos.style.height = '100%';
    if (footer) footer.style.display = productosFiltrados.length > 9 ? 'block' : 'none';
  }

  async function aplicarCategoriaGuardada() {
    const categoriaGuardada = localStorage.getItem('categoriaFiltrada');
    if (categoriaGuardada) {
      filtroCategoria.value = categoriaGuardada;
      const filtrados = productos.filter(p => p.categoria === categoriaGuardada);
      if (filtrados.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron productos con la categoría que elegiste.',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        mostrarProductos(productos);
      } else {
        mostrarProductos(filtrados);
      }
      localStorage.removeItem('categoriaFiltrada');
    }
  }

  botonFiltrar.addEventListener('click', async () => {
    const categoria = filtroCategoria.value;
    const genero = filtroGenero.value;

    const filtrados = productos.filter(p => {
      const matchCategoria = !categoria || p.categoria === categoria;
      const matchGenero = !genero || p.genero === genero;
      return matchCategoria && matchGenero;
    });

    if (filtrados.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: 'No se encontraron productos con el filtro que elegiste.',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      mostrarProductos(productos);
    } else {
      mostrarProductos(filtrados);
    }
  });

  listaProductos.addEventListener('click', function (e) {
    const boton = e.target.closest('.boton_agregar');
    if (boton) {
      const id = boton.getAttribute('data-id');
      window.location.href = `/detalle/${id}/`;
    }
  });

  obtenerProductos();
});
