document.addEventListener("DOMContentLoaded", () => {
  const loginform = document.getElementById("loginform");
  const errorElement = document.getElementById("error");

  loginform.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    errorElement.textContent = "";

    try {
      const response = await fetch("/api/iniciar-sesion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")  // ← si tienes el token
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorElement.textContent = data.error || "Error al iniciar sesión";
        return;
      }

      // Guardar usuario activo
      localStorage.setItem("currentUser", JSON.stringify(data.usuario));
      localStorage.setItem("isLoggedIn", "true");

      // Redirección
      Swal.fire({
        title: '¡Bienvenido Renewer!',
        text: 'Haz clic en OK para continuar.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        const redirectURL = new URLSearchParams(window.location.search).get("redirect");
        window.location.href = redirectURL ? decodeURIComponent(redirectURL) : "/perfil/";
      });

    } catch (error) {
      errorElement.textContent = "No se pudo conectar al servidor.";
      console.error(error);
    }
  });

  // ✅ Función para obtener token CSRF
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
});
