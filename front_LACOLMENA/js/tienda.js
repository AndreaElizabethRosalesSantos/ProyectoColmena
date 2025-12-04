let todosProductos = [];

// Cargar productos
async function cargarProductos() {
  try {
    const res = await fetch("http://localhost:3000/api/productos");
    const productos = await res.json();

    todosProductos = productos;
    mostrarProductos(todosProductos);

  } catch (error) {
    console.error("Error:", error);
  }
}

// Mostrar productos
function mostrarProductos(list) {
  const contenedor = document.getElementById("products");
  contenedor.innerHTML = "";

  list.forEach(prod => {
    //para ver si esta agotado o no
    const disponible = Number(prod.disponibilidad) > 0;
    const enOferta = Number(prod.oferta) > 1;

    contenedor.innerHTML += `
        <div class="card">         
            <img src="media/${prod.imagen}" class="card-img">
            
            <div class="card-content">
                <h3 class="card-title">${prod.nombre}</h3>
                <p class="card-desc">${prod.descripcion}</p>
                <p class="price-area">$${prod.precio}</p>

                ${
                  disponible 
                    ? `<button class="btn-cart" onclick='agregarCarrito(${JSON.stringify(prod)})'>
                          Agregar al carrito
                       </button>`
                    : `<button class="btn-cart" disabled class="btn-disabled">
                          AGOTADO
                       </button>`
                }
            </div>
        </div>`;
  });
}

// Aplicar filtros
function aplicarFiltros() {
  let filtro = [...todosProductos];

  const search = document.getElementById("search-text")?.value?.toLowerCase() || "";
  const category = document.getElementById("filtro-categoria").value;
  const min = Number(document.getElementById("precio-min").value);
  const max = Number(document.getElementById("precio-max").value);
  const solOfertas = document.getElementById("filtro-ofertas").checked;

  // Filtro de búsqueda
  if (search) {
    filtro = filtro.filter(p =>
      p.nombre.toLowerCase().includes(search) ||
      p.descripcion.toLowerCase().includes(search)
    );
  }

  // Categoría
  if (category) {
    filtro = filtro.filter(p => p.categoria === category);
  }

  // Precio
  if (min) filtro = filtro.filter(p => p.precio >= min);
  if (max) filtro = filtro.filter(p => p.precio <= max);

  // Solo ofertas
  if (solOfertas) {
    filtro = filtro.filter(p => Number(p.ofertas) === 1);
  }

  mostrarProductos(filtro);
}

// Activar filtros al cambiar cualquier campo
["filtro-categoria", "precio-min", "precio-max", "filtro-ofertas"].forEach(id => {
  document.getElementById(id).addEventListener("input", aplicarFiltros);
});

cargarProductos();

// ============ FUNCIÓN MODIFICADA PARA CONECTAR CON EL CARRITO ============
async function agregarCarrito(producto) {
  console.log("Producto agregado:", producto);
  
  // 1. Obtener usuario ID
  let usuarioId = localStorage.getItem('usuarioId');
  
  if (!usuarioId) {
    usuarioId = prompt("Ingresa tu ID de usuario (para pruebas usa 1, 2, 3...):");
    if (!usuarioId) {
      alert("Necesitas un ID de usuario para agregar al carrito");
      return;
    }
    localStorage.setItem('usuarioId', usuarioId);
  }
  
  // 2. Mostrar mensaje de carga en el botón
  const boton = event.target;
  const textoOriginal = boton.textContent;
  boton.textContent = "Agregando...";
  boton.disabled = true;
  
  try {
    // 3. Llamar a la API del carrito
    const response = await fetch("http://localhost:3000/api/carrito/agregar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId: parseInt(usuarioId),
        productoId: parseInt(producto.id),
        cantidad: 1
      })
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      // 4. Mostrar notificación
      mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
      
      // 5. Actualizar contador del carrito
      await actualizarContadorCarrito(usuarioId);
      
    } else {
      alert(`Error: ${resultado.mensaje || "No se pudo agregar al carrito"}`);
    }
    
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("Error de conexión. Verifica que el servidor esté corriendo.");
    
  } finally {
    // 6. Restaurar el botón después de 1 segundo
    setTimeout(() => {
      boton.textContent = textoOriginal;
      boton.disabled = false;
    }, 1000);
  }
}

// ============ FUNCIONES AUXILIARES NUEVAS ============

// Función para mostrar notificación
function mostrarNotificacion(mensaje) {
  // Crear elemento de notificación
  const notificacion = document.createElement("div");
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #48bb78;
    color: white;
    padding: 12px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  // Agregar al body
  document.body.appendChild(notificacion);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notificacion.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
  
  // Agregar estilos para animaciones si no existen
  if (!document.querySelector("#notificacion-estilos")) {
    const estilos = document.createElement("style");
    estilos.id = "notificacion-estilos";
    estilos.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(estilos);
  }
}

// Función para actualizar contador del carrito
async function actualizarContadorCarrito(usuarioId) {
  try {
    const response = await fetch(`http://localhost:3000/api/carrito/${usuarioId}`);
    
    if (response.ok) {
      const carrito = await response.json();
      const cantidadItems = carrito.items ? carrito.items.length : 0;
      
      // Buscar y actualizar todos los contadores del carrito en la página
      const cartCountElements = document.querySelectorAll(".cart-count");
      const cartIcons = document.querySelectorAll(".cart-icon");
      
      // Actualizar elementos con clase cart-count
      cartCountElements.forEach(el => {
        el.textContent = cantidadItems;
        el.style.display = cantidadItems > 0 ? "inline" : "none";
      });
      
      // Actualizar iconos del carrito
      cartIcons.forEach(icon => {
        if (cantidadItems > 0) {
          if (!icon.querySelector(".cart-count")) {
            const countSpan = document.createElement("span");
            countSpan.className = "cart-count";
            countSpan.textContent = cantidadItems;
            countSpan.style.cssText = `
              background: red;
              color: white;
              border-radius: 50%;
              padding: 2px 6px;
              font-size: 12px;
              margin-left: 5px;
            `;
            icon.appendChild(countSpan);
          } else {
            icon.querySelector(".cart-count").textContent = cantidadItems;
          }
        } else {
          const countSpan = icon.querySelector(".cart-count");
          if (countSpan) {
            countSpan.remove();
          }
        }
      });
    }
  } catch (error) {
    console.error("Error al actualizar contador:", error);
  }
}

// Inicializar contador al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = localStorage.getItem("usuarioId");
  if (usuarioId) {
    actualizarContadorCarrito(usuarioId);
  }
});