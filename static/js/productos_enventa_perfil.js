document.addEventListener('DOMContentLoaded', async function () {
  const contenedorProductos = document.querySelector('.lista_productos');

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.id) {
    await Swal.fire({
      icon: 'warning',
      title: 'Por favor, inicia sesión.',
      confirmButtonText: 'OK'
    });
    window.location.href = "/iniciar-sesion/";
    return;
  }

  async function cargarProductos() {
    contenedorProductos.innerHTML = '';

    try {
      const res = await fetch(`/api/usuarios/${currentUser.id}/productos`);
      if (!res.ok) throw new Error('Error al obtener productos');
      const productos = await res.json();

      if (!productos.length) {
        contenedorProductos.innerHTML = "<p>No tienes productos publicados.</p>";
        return;
      }

      productos.forEach((producto, index) => {
        const divProducto = document.createElement('div');
        divProducto.classList.add('producto');
        divProducto.dataset.productoId = producto.id;

        divProducto.innerHTML = `
          <a href="#">
            <div class="prenda">
              <img class="imageprenda" src="${producto.imagen}" alt="prenda">
            </div>
          </a>
          <div class="info_prenda">
            <a class="a1" href="#">${producto.nombre}</a>
            <div class="precio_prenda">
              <p>S/ ${producto.precioFinal}</p>
            </div>
            <div class="precio_prenda">
              <span>${producto.estado}</span>
              <span>${producto.categoria}</span>
              <span>${producto.genero}</span>              
            </div>
            <div class="vendedor"><span>${producto.vendedor}</span></div>
          </div>
          <button class="boton_eliminar" data-index="${index}">Eliminar</button>
          <button class="boton_vendido" data-index="${index}">Vendido</button>
        `;

        contenedorProductos.appendChild(divProducto);
      });

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cargar productos.',
        confirmButtonText: 'OK'
      });
      console.error(error);
    }
  }

  await cargarProductos();

  contenedorProductos.addEventListener('click', async (e) => {
    if (e.target.classList.contains('boton_eliminar')) {
      const productoDiv = e.target.closest('.producto');
      const productoId = productoDiv?.dataset.productoId;
      if (!productoId) return;

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Quieres eliminar este producto?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false
      });

      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`/api/productos/${productoId}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al eliminar producto');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        });

        await cargarProductos();

      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el producto.',
          confirmButtonText: 'OK'
        });
        console.error(error);
      }
    }

    if (e.target.classList.contains('boton_vendido')) {
      const index = e.target.getAttribute('data-index');
      await Swal.fire({
        icon: 'info',
        title: 'Función no implementada',
        text: `Marcar como vendido producto #${index}`,
        confirmButtonText: 'OK'
      });
    }
  });
});
