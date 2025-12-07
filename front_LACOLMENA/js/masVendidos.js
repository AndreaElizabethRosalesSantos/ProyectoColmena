// js/masVendidos.js
async function cargarProductosMasVendidos() {
    const contenedor = document.getElementById('productos-mas-vendidos');
    if (!contenedor) return;

    try {
        // Cambia esta URL según tu configuración
        const respuesta = await fetch('http://localhost:3000/api/productos/mas-vendidos?limit=4');
        
        if (!respuesta.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await respuesta.json();
        
        if (data.ok && data.productos && data.productos.length > 0) {
            mostrarProductosMasVendidos(data.productos);
        } else {
            // Si no hay productos vendidos, muestra productos destacados
            await cargarProductosDestacados();
        }
    } catch (error) {
        console.error('Error cargando productos más vendidos:', error);
        mostrarProductosPorDefecto();
    }
}

async function cargarProductosDestacados() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos/destacados');
        const data = await respuesta.json();
        
        if (data.ok && data.productos && data.productos.length > 0) {
            mostrarProductosMasVendidos(data.productos);
        } else {
            mostrarProductosPorDefecto();
        }
    } catch (error) {
        console.error('Error cargando productos destacados:', error);
        mostrarProductosPorDefecto();
    }
}

function mostrarProductosMasVendidos(productos) {
    const contenedor = document.getElementById('productos-mas-vendidos');
    
    contenedor.innerHTML = productos.map(producto => {
        const precio = parseFloat(producto.precio);
        const esOferta = parseInt(producto.ofertas) === 1;
        const precioAnterior = esOferta ? precio * 1.2 : precio; // Ejemplo: 20% más
        const vendidos = parseInt(producto.ventas) || 0;
        
        return `
            <div class="product-card" data-id="${producto.id}">
                ${vendidos > 10 ? `<div class="product-badge">Bestseller</div>` : ''}
                ${esOferta ? `<div class="product-badge sale">Oferta</div>` : ''}
                ${parseInt(producto.disponibilidad) > 0 ? '' : `<div class="product-badge out-of-stock">Agotado</div>`}
                
                <div class="product-image">
                    <img src="media/${producto.imagen}" alt="${producto.nombre}" 
                         onerror="this.src='media/default-product.jpg'; this.alt='Producto sin imagen'">
                </div>
                
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="product-category">${producto.categoria}</p>
                    
                    <div class="product-stats">
                        <span class="sold-count">${vendidos} vendidos</span>
                        ${parseInt(producto.disponibilidad) > 0 ? 
                            `<span class="stock-available">✓ En stock</span>` : 
                            `<span class="stock-unavailable">✗ Agotado</span>`
                        }
                    </div>
                    
                    <div class="product-price">
                        <span class="price-current">$${precio.toFixed(2)}</span>
                        ${esOferta ? `<span class="price-old">$${precioAnterior.toFixed(2)}</span>` : ''}
                    </div>
                    
                    <button class="add-to-cart" 
                            onclick="agregarAlCarritoDesdeInicio(${producto.id})"
                            ${parseInt(producto.disponibilidad) <= 0 ? 'disabled' : ''}>
                        ${parseInt(producto.disponibilidad) <= 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                    
                    <button class="btn-wishlist" onclick="agregarListaDeseos(${producto.id})" title="Añadir a lista de deseos">
                        ❤
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function mostrarProductosPorDefecto() {
    const contenedor = document.getElementById('productos-mas-vendidos');
    contenedor.innerHTML = `
        <div class="no-products">
            <p>Pronto tendremos nuestros productos más vendidos aquí.</p>
            <a href="tienda.html" class="btn-primary">Ver todos los productos</a>
        </div>
    `;
}

// Función para agregar al carrito desde la página de inicio
async function agregarAlCarritoDesdeInicio(productoId) {
    const usuarioId = localStorage.getItem('ID_USUARIO');
    
    if (!usuarioId) {
        // Muestra el modal de login
        document.getElementById('showLoginBtn').click();
        return;
    }
    
    const boton = event.target;
    const textoOriginal = boton.textContent;
    boton.textContent = "Agregando...";
    boton.disabled = true;
    
    try {
        const response = await fetch("http://localhost:3000/api/carrito/agregar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuarioId: parseInt(usuarioId),
                productoId: parseInt(productoId),
                cantidad: 1
            })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarNotificacionInicio("Producto agregado al carrito");
            // Actualiza el contador del carrito si existe la función
            if (typeof actualizarContadorCarrito === 'function') {
                await actualizarContadorCarrito(usuarioId);
            }
        } else {
            alert(`Error: ${resultado.mensaje || "No se pudo agregar al carrito"}`);
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        alert("Error de conexión");
    } finally {
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }, 1000);
    }
}

// Función para notificaciones en inicio
function mostrarNotificacionInicio(mensaje) {
    // Crea o usa tu sistema de notificaciones existente
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje);
        return;
    }
    
    // Fallback simple
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Cargar productos cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarProductosMasVendidos);
} else {
    cargarProductosMasVendidos();
}// js/masVendidos.js
async function cargarProductosMasVendidos() {
    const contenedor = document.getElementById('productos-mas-vendidos');
    if (!contenedor) return;

    try {
        // Cambia esta URL según tu configuración
        const respuesta = await fetch('http://localhost:3000/api/productos/mas-vendidos?limit=4');
        
        if (!respuesta.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await respuesta.json();
        
        if (data.ok && data.productos && data.productos.length > 0) {
            mostrarProductosMasVendidos(data.productos);
        } else {
            // Si no hay productos vendidos, muestra productos destacados
            await cargarProductosDestacados();
        }
    } catch (error) {
        console.error('Error cargando productos más vendidos:', error);
        mostrarProductosPorDefecto();
    }
}

async function cargarProductosDestacados() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos/destacados');
        const data = await respuesta.json();
        
        if (data.ok && data.productos && data.productos.length > 0) {
            mostrarProductosMasVendidos(data.productos);
        } else {
            mostrarProductosPorDefecto();
        }
    } catch (error) {
        console.error('Error cargando productos destacados:', error);
        mostrarProductosPorDefecto();
    }
}

function mostrarProductosMasVendidos(productos) {
    const contenedor = document.getElementById('productos-mas-vendidos');
    
    contenedor.innerHTML = productos.map(producto => {
        const precio = parseFloat(producto.precio);
        const esOferta = parseInt(producto.ofertas) === 1;
        const precioAnterior = esOferta ? precio * 1.2 : precio; // Ejemplo: 20% más
        const vendidos = parseInt(producto.ventas) || 0;
        
        return `
            <div class="product-card" data-id="${producto.id}">
                ${vendidos > 10 ? `<div class="product-badge">Bestseller</div>` : ''}
                ${esOferta ? `<div class="product-badge sale">Oferta</div>` : ''}
                ${parseInt(producto.disponibilidad) > 0 ? '' : `<div class="product-badge out-of-stock">Agotado</div>`}
                
                <div class="product-image">
                    <img src="media/${producto.imagen}" alt="${producto.nombre}" 
                         onerror="this.src='media/default-product.jpg'; this.alt='Producto sin imagen'">
                </div>
                
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="product-category">${producto.categoria}</p>
                    
                    <div class="product-stats">
                        <span class="sold-count">${vendidos} vendidos</span>
                        ${parseInt(producto.disponibilidad) > 0 ? 
                            `<span class="stock-available">✓ En stock</span>` : 
                            `<span class="stock-unavailable">✗ Agotado</span>`
                        }
                    </div>
                    
                    <div class="product-price">
                        <span class="price-current">$${precio.toFixed(2)}</span>
                        ${esOferta ? `<span class="price-old">$${precioAnterior.toFixed(2)}</span>` : ''}
                    </div>
                    
                    <button class="add-to-cart" 
                            onclick="agregarAlCarritoDesdeInicio(${producto.id})"
                            ${parseInt(producto.disponibilidad) <= 0 ? 'disabled' : ''}>
                        ${parseInt(producto.disponibilidad) <= 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                    
                    <button class="btn-wishlist" onclick="agregarListaDeseos(${producto.id})" title="Añadir a lista de deseos">
                        ❤
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function mostrarProductosPorDefecto() {
    const contenedor = document.getElementById('productos-mas-vendidos');
    contenedor.innerHTML = `
        <div class="no-products">
            <p>Pronto tendremos nuestros productos más vendidos aquí.</p>
            <a href="tienda.html" class="btn-primary">Ver todos los productos</a>
        </div>
    `;
}

// Función para agregar al carrito desde la página de inicio
async function agregarAlCarritoDesdeInicio(productoId) {
    const usuarioId = localStorage.getItem('ID_USUARIO');
    
    if (!usuarioId) {
        // Muestra el modal de login
        document.getElementById('showLoginBtn').click();
        return;
    }
    
    const boton = event.target;
    const textoOriginal = boton.textContent;
    boton.textContent = "Agregando...";
    boton.disabled = true;
    
    try {
        const response = await fetch("http://localhost:3000/api/carrito/agregar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuarioId: parseInt(usuarioId),
                productoId: parseInt(productoId),
                cantidad: 1
            })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarNotificacionInicio("Producto agregado al carrito");
            // Actualiza el contador del carrito si existe la función
            if (typeof actualizarContadorCarrito === 'function') {
                await actualizarContadorCarrito(usuarioId);
            }
        } else {
            alert(`Error: ${resultado.mensaje || "No se pudo agregar al carrito"}`);
        }
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        alert("Error de conexión");
    } finally {
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }, 1000);
    }
}


function mostrarNotificacionInicio(mensaje) {
    // Crea o usa tu sistema de notificaciones existente
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje);
        return;
    }
    
    // Fallback simple
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Cargar productos cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarProductosMasVendidos);
} else {
    cargarProductosMasVendidos();
}