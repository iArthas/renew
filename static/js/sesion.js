document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const contenedorBotones = document.getElementById("botonesSesion");

    if (contenedorBotones) {
        contenedorBotones.innerHTML = "";

        // Obtener la URL correcta desde el atributo data
        const loginUrl = contenedorBotones.dataset.loginUrl || "/iniciar-sesion/";

        if (isLoggedIn === "true") {
            const perfilBtn = document.createElement("button");
            perfilBtn.textContent = "Mi perfil";
            perfilBtn.className = "button";
            perfilBtn.onclick = () => window.location.href = "/perfil/";
            contenedorBotones.appendChild(perfilBtn);

            const logoutBtn = document.createElement("button");
            logoutBtn.textContent = "Cerrar sesión";
            logoutBtn.className = "button";
            logoutBtn.onclick = () => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("productoSeleccionado");
                window.location.href = "/";
            };
            contenedorBotones.appendChild(logoutBtn);
        } else {
            const loginBtn = document.createElement("button");
            loginBtn.textContent = "Iniciar Sesión";
            loginBtn.className = "button";
            loginBtn.onclick = () => window.location.href = loginUrl;
            contenedorBotones.appendChild(loginBtn);
        }
    }

    // Marcar el enlace activo
    const enlaces = document.querySelectorAll(".textonav");
    const actual = window.location.pathname;
    enlaces.forEach(enlace => {
        if (enlace.getAttribute("href") === actual) {
            enlace.classList.add("activo");
        }
    });
});
