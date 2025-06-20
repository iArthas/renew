document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('formProducto');
  if (!formulario) return;

  formulario.addEventListener('submit', async function (event) {
    event.preventDefault();
    const submitButton = formulario.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';

    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const estado = document.getElementById('estado').value;
    const genero = document.getElementById('genero').value;
    const precioOriginal = parseFloat(document.getElementById('precio').value);
    const descripcion = document.getElementById('descripcion').value;
    const imagenFile = document.getElementById('imagen').files[0];
    const imagenesSecundarias = document.getElementById('imagen_2').files;
    const errorImagenSecundaria = document.getElementById('imagen_2_error');

    if (!nombre || !categoria || !estado || !genero || !precioOriginal || !descripcion || !imagenFile) {
      await Swal.fire({ icon: 'warning', title: 'Completa todos los campos.' });
      submitButton.disabled = false;
      submitButton.textContent = 'Agregar prenda';
      return;
    }

    if (imagenesSecundarias.length !== 3) {
      errorImagenSecundaria.textContent = "Debes subir exactamente 3 imágenes secundarias.";
      submitButton.disabled = false;
      submitButton.textContent = 'Agregar prenda';
      return;
    } else {
      errorImagenSecundaria.textContent = "";
    }

    // Validación extra: formato y tamaño máximo (2MB por imagen)
    const formatosValidos = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 2;

    const validarImagen = (archivo) => {
      return formatosValidos.includes(archivo.type) && archivo.size <= maxSizeMB * 1024 * 1024;
    };

    if (!validarImagen(imagenFile)) {
      await Swal.fire({ icon: 'error', title: 'Imagen principal no válida', text: 'Debe ser .jpg, .png o .webp y pesar máx. 2MB.' });
      submitButton.disabled = false;
      submitButton.textContent = 'Agregar prenda';
      return;
    }

    for (let i = 0; i < imagenesSecundarias.length; i++) {
      if (!validarImagen(imagenesSecundarias[i])) {
        await Swal.fire({ icon: 'error', title: 'Imagen secundaria inválida', text: `La imagen #${i + 1} no cumple los requisitos.` });
        submitButton.disabled = false;
        submitButton.textContent = 'Agregar prenda';
        return;
      }
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      await Swal.fire({ icon: 'error', title: 'Inicia sesión para publicar.' });
      window.location.href = "/iniciar-sesion/";
      return;
    }

    const precioFinal = (precioOriginal * 1.1).toFixed(2);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('categoria', categoria);
      formData.append('estado', estado);
      formData.append('genero', genero);
      formData.append('precioFinal', precioFinal);
      formData.append('descripcion', descripcion);
      formData.append('vendedor_id', currentUser.id);
      formData.append('imagen', imagenFile);

      for (let i = 0; i < imagenesSecundarias.length; i++) {
        formData.append('imagenesSecundarias', imagenesSecundarias[i]);
      }

      const response = await fetch("/api/productos/", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar el producto.");
      }

      await Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: 'Tu producto será evaluado antes de publicarse con un recargo del 10%.'
      });

      formulario.reset();
      window.location.href = "/productos/";

    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo registrar el producto.' });
    }

    submitButton.disabled = false;
    submitButton.textContent = 'Agregar prenda';
  });
});
