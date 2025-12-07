// ============ CONFIGURACIÓN GLOBAL ============
const USUARIO_ID = localStorage.getItem("ID_USUARIO");
const API_BASE_URL = "http://localhost:3000/api";
let todosProductos = [];

// ============ FUNCIONES DE NOTIFICACIONES ============
function mostrarNotificacion(mensaje) {
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
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
  
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

// ============ FUNCIONES DE PRODUCTOS ============
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE_URL}/productos`);
    const productos = await res.json();
    todosProductos = productos;
    mostrarProductos(todosProductos);
  } catch (error) {
    console.error("Error:", error);
  }
}

function mostrarProductos(list) {
  const contenedor = document.getElementById("products");
  contenedor.innerHTML = "";

  list.forEach(prod => {
    const disponible = Number(prod.disponibilidad) > 0;

    contenedor.innerHTML += `
      <div class="card">         
        <img src="media/${prod.imagen}" class="card-img">
        
        <div class="card-content">
          <h3 class="card-title">${prod.nombre}</h3>
          <p class="card-desc">${prod.descripcion}</p>
          <p class="price-area">$${prod.precio}</p>

          <div class="card-actions">
            ${disponible
              ? `<button class="btn-cart" onclick='agregarCarrito(${JSON.stringify(prod)})'>Agregar al carrito</button>`
              : `<button class="btn-cart" disabled class="btn-disabled">AGOTADO</button>`
            }

            <button class="btn-deseo" onclick="agregarListaDeseos(${prod.id})">❤️</button>
          </div>
        </div>
      </div>`;
  });
}

async function aplicarFiltros() {
  const search = document.getElementById("search-text").value;
  const categoria = document.getElementById("filtro-categoria").value;
  const min = document.getElementById("precio-min").value;
  const max = document.getElementById("precio-max").value;
  const ofertas = document.getElementById("filtro-ofertas").checked ? 1 : 0;

  const url = new URL(`${API_BASE_URL}/productos/filtrar`);

  if (search) url.searchParams.append("search", search);
  if (categoria) url.searchParams.append("categoria", categoria);
  if (min) url.searchParams.append("min", min);
  if (max) url.searchParams.append("max", max);
  if (ofertas) url.searchParams.append("ofertas", 1);

  const res = await fetch(url);
  const filtrados = await res.json();

  mostrarProductos(filtrados);
}

// ============ FUNCIONES CARRITO ============
async function agregarCarrito(producto) {
  if (!USUARIO_ID) {
    alert("Necesitas iniciar sesión para agregar al carrito");
    return;
  }

  const boton = event.target;
  const original = boton.textContent;
  boton.textContent = "Agregando...";
  boton.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/carrito/agregar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: parseInt(USUARIO_ID),
        productoId: parseInt(producto.id),
        cantidad: 1
      })
    });

    const data = await response.json();

    if (response.ok) {
      mostrarNotificacion(`"${producto.nombre}" agregado al carrito`);
      await actualizarContadorCarrito();
    } else {
      alert(data.mensaje || "No se pudo agregar al carrito");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      boton.textContent = original;
      boton.disabled = false;
    }, 1000);
  }
}

async function actualizarContadorCarrito() {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  if (!usuarioId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/carrito/${usuarioId}`);
    
    if (response.ok) {
      const carrito = await response.json();
      const cantidadItems = carrito.items ? carrito.items.length : 0;
      
      const cartCountElements = document.querySelectorAll(".cart-count");
      const cartIcons = document.querySelectorAll(".cart-icon");
      
      cartCountElements.forEach(el => {
        el.textContent = cantidadItems;
        el.style.display = cantidadItems > 0 ? "inline" : "none";
      });
      
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

// ============ FUNCIONES LISTA DE DESEOS ============
async function agregarListaDeseos(productoId) {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  
  if (!usuarioId) {
    alert("Necesitas iniciar sesión para usar la lista de deseos");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/listadeseos/agregar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        usuarioId: parseInt(usuarioId), 
        productoId: parseInt(productoId) 
      })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarNotificacion("Producto agregado a tu lista de deseos ❤");
      await actualizarContadorDeseos();
    } else {
      alert(data.mensaje || "Error al agregar a lista");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
}

async function cargarListaDeseos() {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  const cont = document.getElementById("listaDeseosContenido");

  if (!usuarioId) {
    cont.innerHTML = "<p>Debes iniciar sesión para ver tu lista de deseos.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/listadeseos/${usuarioId}`);
    
    if (!res.ok) {
      cont.innerHTML = "<p>Error al cargar la lista de deseos.</p>";
      return;
    }

    const lista = await res.json();

    if (!Array.isArray(lista) || lista.length === 0) {
      cont.innerHTML = "<p>No tienes productos en tu lista de deseos.</p>";
      return;
    }

    cont.innerHTML = lista.map(p => `
      <div class="whislist">
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="media/${p.imagen}" alt="${p.nombre}" width="50">
          <div>
            <strong>${p.nombre}</strong><br>
            <small>$${p.precio}</small>
          </div>
        </div>
        <div>
          <button onclick="eliminarDeListaDeseos(${p.id})" style="background:none;border:none;cursor:pointer;font-size:18px">❌</button>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Error cargando lista de deseos:", error);
    cont.innerHTML = "<p>Error al cargar la lista de deseos.</p>";
  }
}

async function eliminarDeListaDeseos(productoId) {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  if (!usuarioId) {
    alert("Debes iniciar sesión.");
    return;
  }

  if (!confirm("¿Eliminar este producto de tu lista de deseos?")) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/listadeseos/${usuarioId}/producto/${productoId}`, {
      method: "DELETE"
    });

    if (res.ok) {
      mostrarNotificacion("Producto eliminado de tus deseos");
      await cargarListaDeseos();
      await actualizarContadorDeseos();
    } else {
      const data = await res.json();
      alert(data.mensaje || "No se pudo eliminar");
    }
  } catch (error) {
    console.error("Error eliminando deseo:", error);
    alert("Error de conexión");
  }
}

async function actualizarContadorDeseos() {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  if (!usuarioId) return;

  try {
    const res = await fetch(`${API_BASE_URL}/listadeseos/${usuarioId}`);
    if (!res.ok) return;
    
    const lista = await res.json();
    const count = Array.isArray(lista) ? lista.length : 0;
    const badge = document.getElementById("wishlist-count");

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    }
  } catch (error) {
    console.error("Error contador deseos:", error);
  }
}

function abrirListaDeseos() {
  document.getElementById("modalListaDeseos").style.display = "flex";
  cargarListaDeseos();
}

function cerrarListaDeseos() {
  document.getElementById("modalListaDeseos").style.display = "none";
}

// ============ INICIALIZACIÓN ============
document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = localStorage.getItem("ID_USUARIO");
  
  // Configurar filtros
  ["filtro-categoria", "precio-min", "precio-max", "filtro-ofertas"].forEach(id => {
    document.getElementById(id).addEventListener("input", aplicarFiltros);
  });
  
  // Cargar productos
  cargarProductos();
  
  // Inicializar contadores si hay usuario
  if (usuarioId) {
    actualizarContadorCarrito();
    actualizarContadorDeseos();
  }
});