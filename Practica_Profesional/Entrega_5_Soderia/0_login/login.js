document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, passwordd: password }),
        });

        if (res.ok) {
            alert("Inicio de sesión exitoso");
            window.location.href = "/1_inicio/index.html"; // Redirige a la página de inicio
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        alert("Ocurrió un error. Intente nuevamente.");
    }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;

    try {
        const res = await fetch("http://localhost:4000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, passwordd: password }),
        });

        if (res.ok) {
            alert("Registro exitoso. Ahora puede iniciar sesión.");
            document.getElementById("registerForm").reset();
            bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
        } else {
            alert("Error en el registro. Intente nuevamente.");
        }
    } catch (error) {
        console.error("Error durante el registro:", error);
        alert("Ocurrió un error. Intente nuevamente.");
    }
});