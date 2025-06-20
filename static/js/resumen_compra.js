document.addEventListener("DOMContentLoaded", async function () {
  const resumenVenta = document.querySelector(".resumen_venta");
  if (!resumenVenta) {
    console.error("No se encontró el contenedor resumen_venta");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productoId = urlParams.get("id");

  if (!productoId) {
    console.error("No se encontró el id del producto en la URL");
    return;
  }

  const backendUrl = window.location.origin;

  let producto;
  try {
    const resProducto = await fetch(`${backendUrl}/api/productos/${productoId}/`);
    if (!resProducto.ok) throw new Error("Producto no encontrado");
    producto = await resProducto.json();
  } catch (error) {
    console.error("Error al cargar datos del producto:", error);
    return;
  }

  // Mostrar imagen y datos en el resumen del producto
  const imagenProducto = document.getElementById("imagen_producto");
  if (imagenProducto && producto.imagen) {
    imagenProducto.src = producto.imagen;
    imagenProducto.alt = `Imagen de ${producto.nombre}`;
  }

  document.getElementById("nombre_producto").textContent = producto.nombre || "Sin nombre";
  document.getElementById("categoria_producto").textContent = producto.categoria || "N/A";
  document.getElementById("estado_producto").textContent = producto.estado || "N/A";
  document.getElementById("genero_producto").textContent = producto.genero || "N/A";
  document.getElementById("nombre_vendedor").textContent = producto.vendedor || "N/A";
  document.getElementById("descripcion_producto").textContent = producto.descripcion || "Sin descripción.";

  let precioProducto = parseFloat(producto.precio ?? 0);
  if (isNaN(precioProducto)) precioProducto = 0;

  const montoEnvio = +(precioProducto * 0.05).toFixed(2);
  const totalPagar = +(precioProducto + montoEnvio).toFixed(2);

  resumenVenta.querySelector("input#precio_producto").value = precioProducto.toFixed(2);
  resumenVenta.querySelector("input#monto_envio").value = montoEnvio.toFixed(2);
  resumenVenta.querySelector("input#total_pagar").value = totalPagar.toFixed(2);

  resumenVenta.querySelector("input#precio_producto").readOnly = true;
  resumenVenta.querySelector("input#monto_envio").readOnly = true;
  resumenVenta.querySelector("input#total_pagar").readOnly = true;

  const currentUserJSON = localStorage.getItem("currentUser");
  if (!currentUserJSON) {
    console.error("No se encontró currentUser en localStorage");
    return;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(currentUserJSON);
  } catch (e) {
    console.error("Error al parsear currentUser:", e);
    return;
  }

  try {
    const resUsuario = await fetch(`${backendUrl}/api/usuarios/${currentUser.id}/`);
    if (!resUsuario.ok) throw new Error("No se pudo obtener datos del usuario");
    const usuario = await resUsuario.json();

    const direccionInput = resumenVenta.querySelector("input#direccion_comprador");
    const distritoInput = resumenVenta.querySelector("input#distrito");  // ✅ actualizado

    if (direccionInput && usuario.direccion) direccionInput.value = usuario.direccion;
    if (distritoInput && usuario.distrito) distritoInput.value = usuario.distrito;  // ✅ actualizado

  } catch (error) {
    console.error("Error al obtener usuario de BD:", error);
  }

  document.getElementById("boton_pagar").addEventListener("click", function () {
    if (!productoId) {
      console.error("No se encontró el id del producto para redirigir a la pasarela");
      return;
    }
    window.location.href = `/pasarela-pago/?id=${productoId}`;
  });
});
