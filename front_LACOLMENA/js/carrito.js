// front_LACOLMENA/js/carrito.js
const API_BASE = "http://localhost:3000/api";

// Cargar carrito al iniciar
document.addEventListener("DOMContentLoaded", cargarCarrito);

async function cargarCarrito() {
  // Obtener usuario ID
  const usuarioId = localStorage.getItem("usuarioId");
  
  if (!usuarioId) {
    mostrarMensaje("No estás identificado. Ve a la tienda y agrega productos.");
    return;
  }
  
  try {
    // Obtener carrito del usuario
    const response = await fetch(`${API_BASE}/carrito/${usuarioId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const carrito = await response.json();
    
    if (carrito.items && carrito.items.length > 0) {
      mostrarCarritoConProductos(carrito);
    } else {
      mostrarCarritoVacio();
    }
    
  } catch (error) {
    console.error("Error al cargar carrito:", error);
    mostrarMensaje("Error al cargar el carrito. Verifica la conexión.");
  }
}

function mostrarCarritoConProductos(carrito) {
  // Ocultar mensaje de carrito vacío
  document.getElementById("carrito-vacio").style.display = "none";
  
  // Mostrar sección de carrito con productos
  const carritoContenido = document.getElementById("carrito-contenido");
  carritoContenido.style.display = "block";
  
  // Generar HTML de productos
  let productosHTML = "";
  carrito.items.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    
    productosHTML += `
      <div class="carrito-item">
        <div class="item-info">
          <h4>${item.nombre}</h4>
          <p>Precio: $${item.precio}</p>
          <div class="controles-cantidad">
            <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
            <span>${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
            <button onclick="eliminarItem(${item.id})" class="btn-eliminar">Eliminar</button>
          </div>
        </div>
        <div class="item-subtotal">
          <strong>$${subtotal.toFixed(2)}</strong>
        </div>
      </div>
    `;
  });
  
  document.getElementById("items-carrito").innerHTML = productosHTML;
  
  // Mostrar totales (SIN ENVÍO)
  if (carrito.resumen) {
    document.getElementById("subtotal").textContent = carrito.resumen.subtotal.toFixed(2);
    document.getElementById("impuestos").textContent = carrito.resumen.impuestos.toFixed(2);
    // Quitar o comentar la línea de envío si existe en tu HTML
    // document.getElementById("envio").textContent = carrito.resumen.envio.toFixed(2);
    document.getElementById("total").textContent = carrito.resumen.total.toFixed(2);
  }
}

function mostrarCarritoVacio() {
  document.getElementById("carrito-vacio").style.display = "block";
  document.getElementById("carrito-contenido").style.display = "none";
}

function mostrarMensaje(texto) {
  const container = document.querySelector(".carrito-container") || document.body;
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <p>${texto}</p>
      <a href="tienda.html"><button>Ir a la tienda</button></a>
    </div>
  `;
}

async function cambiarCantidad(itemId, nuevaCantidad) {
  if (nuevaCantidad < 1) {
    if (confirm("¿Eliminar este producto del carrito?")) {
      await eliminarItem(itemId);
    }
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/carrito/actualizar/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cantidad: nuevaCantidad
      })
    });
    
    if (response.ok) {
      cargarCarrito(); // Recargar
    } else {
      const error = await response.json();
      alert(`Error: ${error.mensaje}`);
    }
  } catch (error) {
    alert("Error al actualizar cantidad");
  }
}

async function eliminarItem(itemId) {
  if (!confirm("¿Eliminar este producto del carrito?")) return;
  
  try {
    const response = await fetch(`${API_BASE}/carrito/eliminar/${itemId}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      cargarCarrito();
    } else {
      alert("Error al eliminar producto");
    }
  } catch (error) {
    alert("Error al eliminar producto");
  }
}

async function vaciarCarrito() {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) return;
  
  if (!confirm("¿Vaciar todo el carrito?")) return;
  
  try {
    const response = await fetch(`${API_BASE}/carrito/vaciar/${usuarioId}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      mostrarCarritoVacio();
    } else {
      alert("Error al vaciar carrito");
    }
  } catch (error) {
    alert("Error al vaciar carrito");
  }
}

async function crearOrden() {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) return;
  
  if (!confirm("¿Confirmar compra y crear orden?")) return;
  
  try {
    const response = await fetch(`${API_BASE}/carrito/crear-orden/${usuarioId}`, {
      method: "POST"
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      alert(`✅ Orden #${resultado.orden.id} creada\nTotal: $${resultado.orden.total}\n\nGracias por tu compra.`);
      mostrarCarritoVacio();
    } else {
      alert(`Error: ${resultado.mensaje}`);
    }
  } catch (error) {
    alert("Error al crear orden");
  }
}