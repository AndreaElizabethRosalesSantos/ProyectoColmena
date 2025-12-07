async function suscribir(event) {
    if (event) event.preventDefault();

    const email = document.getElementById("email").value;

    try {
        const res = await fetch("http://localhost:3000/api/suscribir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            mostrarToast("¡Te suscribiste correctamente! 🎉", "success");
            document.getElementById("email").value = ""; // limpiar campo
        } else {
            mostrarToast(data.mensaje || "Error al suscribirte 😢", "error");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión con el servidor 😢", "error");
    }
}

function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    
    toast.textContent = mensaje;
    toast.className = "toast show " + (tipo === "success" ? "toast-success" : "toast-error");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}