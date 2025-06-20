function validarSesion_vender() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (isLoggedIn !== 'true') {
    const paginaActual = window.location.href;

    Swal.fire({
      icon: 'warning',
      title: 'Acceso restringido',
      text: 'Por favor, inicia sesión o regístrate para poder vender productos.',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      window.location.href = `/iniciar-sesion/?redirect=${encodeURIComponent(paginaActual)}`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  validarSesion_vender();
});
