document.addEventListener("DOMContentLoaded", async () => {
  const nombreInput = document.getElementById("nombre");
  const direccionInput = document.getElementById("direccion");
  const distritoInput = document.getElementById("distrito");
  const celularInput = document.getElementById("celular");
  const emailInput = document.getElementById("email");
  const formPerfil = document.getElementById("formPerfil");
  const formCambioPass = document.getElementById("formCambioPass");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.id) {
    await Swal.fire({
      icon: 'warning',
      title: 'Por favor, inicia sesión o regístrate.',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
    window.location.href = "/iniciar-sesion/";
    return;
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  async function obtenerUsuario() {
    try {
      const res = await fetch(`/api/usuarios/${currentUser.id}`);
      if (!res.ok) throw new Error("Error al obtener datos");
      return await res.json();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos del usuario.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      console.error(error);
      return null;
    }
  }

  const usuario = await obtenerUsuario();
  if (!usuario) return;

  // Llenar campos
  nombreInput.value = usuario.nombres + " " + usuario.apellidos;
  nombreInput.readOnly = true;
  direccionInput.value = usuario.direccion;
  distritoInput.value = usuario.distrito;
  distritoInput.readOnly = true;
  celularInput.value = usuario.celular;
  emailInput.value = usuario.email;
  emailInput.readOnly = true;

  formPerfil.addEventListener("submit", async (e) => {
    e.preventDefault();

    const celular = celularInput.value.trim();
    const celularRegex = /^9\d{8}$/;

    if (!celularRegex.test(celular)) {
      await Swal.fire({
        icon: 'error',
        title: 'Número de celular inválido. Debe tener 9 dígitos y comenzar con 9.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
          direccion: direccionInput.value,
          distrito: distritoInput.value,
          celular: celular
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar datos");

      await Swal.fire({
        icon: 'success',
        title: 'Datos actualizados correctamente.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });

      window.location.reload();

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar datos.',
        text: error.message,
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      console.error(error);
    }
  });

  formCambioPass.addEventListener("submit", async (e) => {
    e.preventDefault();

    const actual = document.getElementById("actual_password").value;
    const nueva = document.getElementById("nueva_password").value;
    const confirmacion = document.getElementById("confirmar_password").value;

    if (nueva !== confirmacion) {
      await Swal.fire({
        icon: 'error',
        title: 'Las nuevas contraseñas no coinciden.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${currentUser.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ actual, nueva }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");

      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada correctamente.',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });

      formCambioPass.reset();
      window.location.reload();

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: error.message,
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      console.error(error);
    }
  });
});
