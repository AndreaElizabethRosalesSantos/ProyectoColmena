document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("mensaje").value;

    const data = { nombre, email, mensaje };

    try {
        const response = await fetch("http://localhost:3000/api/contacto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            mostrarToast("Mensaje enviado correctamente ✔️", "success");
            document.getElementById("contactForm").reset();
        } else {
            mostrarToast("Error: " + result.error, "error");
        }

    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión con el servidor 😢", "error");
    }
});


function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    
    toast.textContent = mensaje;
    toast.className = "toast show " + (tipo === "success" ? "toast-success" : "toast-error");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}