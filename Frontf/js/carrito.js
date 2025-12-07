// js/carrito.js - VERSIÓN CON CORRECCIONES
const API_URL = 'http://localhost:3000/api';

const USUARIO_ID = localStorage.getItem('ID_USUARIO') || localStorage.getItem('usuarioId');

if (!USUARIO_ID) {
    console.error('⚠️ No hay usuario logueado');
}

console.log('👤 Usuario actual:', USUARIO_ID);
console.log('🔗 Intentando conectar con:', API_URL);

let cuponAplicado = null;
let descuentoActual = 0;
let costoEnvio = 150;

// ✅ SOLUCIÓN 1: Actualizar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (USUARIO_ID) {
        cargarCarrito();
        actualizarContadorCarrito(USUARIO_ID); // 👈 AGREGADO
    } else {
        mostrarCarritoVacio();
        alert('⚠️ Debes iniciar sesión para ver tu carrito');
    }
});

// Función para cargar el carrito desde la API
async function cargarCarrito() {
    try {
        console.log(`📥 Cargando carrito del usuario ${USUARIO_ID}...`);
        
        const response = await fetch(`${API_URL}/carrito/${USUARIO_ID}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error de respuesta:', errorText);
            throw new Error('Error al cargar el carrito');
        }

        const data = await response.json();
        console.log('✅ Datos del carrito recibidos:', data);
        
        if (data.items.length === 0) {
            mostrarCarritoVacio();
        } else {
            mostrarCarritoConProductos(data);
        }
        
    } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
        alert('Error al cargar el carrito. Por favor recarga la página.');
    }
}

// Mostrar mensaje de carrito vacío
function mostrarCarritoVacio() {
    document.getElementById('carrito-vacio').style.display = 'block';
    document.getElementById('carrito-contenido').style.display = 'none';
}

// Mostrar carrito con productos
function mostrarCarritoConProductos(data) {
    document.getElementById('carrito-vacio').style.display = 'none';
    document.getElementById('carrito-contenido').style.display = 'block';
    
    const itemsContainer = document.getElementById('items-carrito');
    itemsContainer.innerHTML = '';
    
    data.items.forEach(item => {
        const itemHTML = crearItemHTML(item);
        itemsContainer.innerHTML += itemHTML;
    });
    
    actualizarResumen(data.resumen);
}

// Crear HTML para un item del carrito
function crearItemHTML(item) {
    return `
        <div class="carrito-item" data-item-id="${item.id}">
            <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0;">${item.nombre}</h4>
                    <p style="margin: 0; color: #666;">Precio: $${item.precio.toFixed(2)}</p>
                    <p style="margin: 5px 0 0 0; color: #888; font-size: 0.9em;">
                        Disponibles: ${item.disponibilidad}
                    </p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="controles-cantidad">
                    <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1}, ${item.disponibilidad})">-</button>
                    <span style="padding: 0 10px; font-weight: bold;">${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1}, ${item.disponibilidad})">+</button>
                </div>
                
                <div style="min-width: 100px; text-align: right;">
                    <strong>$${item.subtotal.toFixed(2)}</strong>
                </div>
                
                <button class="btn-eliminar" onclick="eliminarItem(${item.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
}

// Actualizar resumen de totales
function actualizarResumen(resumen) {
    const subtotal = resumen.subtotal;
    const impuestos = resumen.impuestos;
    const descuento = resumen.descuento || 0;

    let envio = 0;
    if(subtotal < 500){
        envio = costoEnvio;
    }

    const total = subtotal + impuestos + envio - descuento;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('impuestos').textContent = impuestos.toFixed(2);
    
    const envioRow = document.getElementById('envio-row');
    
    if (envio === 0) {
        envioRow.innerHTML = 'Gastos de envío: <span style="color: #27ae60; font-weight: 600;">¡GRATIS!</span>';
    } else {
        envioRow.innerHTML = 'Gastos de envío: $<span id="envio">' + envio.toFixed(2) + '</span>';
    }

    const descuentoElement = document.getElementById('descuento');
    const descuentoRow = document.getElementById('descuento-row');
    
    if(descuento > 0){
        if(descuentoElement){
            descuentoElement.textContent = descuento.toFixed(2);
            descuentoRow.style.display = 'block';
        }
    } else {
        descuentoRow.style.display = 'none';
    }

    document.getElementById('total').textContent = total.toFixed(2);
}

// Actualizar costo de envío según el país
function actualizarCostoEnvio(){
    const selecPais = document.getElementById('select-pais');
    const pais = selecPais.value;

    if(pais === 'MX'){
        costoEnvio = 150;
    } else{
        costoEnvio = 350;
    }

    if(cuponAplicado){
        aplicarCuponAlCarrito(cuponAplicado);
    }else{
        cargarCarrito();
    }
}

// Cambiar cantidad de un producto
async function cambiarCantidad(itemId, nuevaCantidad, disponibilidad) {
    if (nuevaCantidad < 1) {
        if (confirm('¿Deseas eliminar este producto del carrito?')) {
            eliminarItem(itemId);
        }
        return;
    }
    
    if (nuevaCantidad > disponibilidad) {
        alert(`Solo hay ${disponibilidad} unidades disponibles`);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrito/actualizar/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al actualizar cantidad');
        }

        if(cuponAplicado){
            await aplicarCuponAlCarrito(cuponAplicado);
        } else{
            cargarCarrito();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// Eliminar un producto del carrito
async function eliminarItem(itemId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrito/eliminar/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }

        if(cuponAplicado){
            await aplicarCuponAlCarrito(cuponAplicado);
        } else{
            cargarCarrito();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}

// Vaciar todo el carrito
async function vaciarCarrito() {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrito/vaciar/${USUARIO_ID}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al vaciar carrito');
        }
        
        cuponAplicado = null;
        descuentoActual = 0;
        limpiarCupon();

        cargarCarrito();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al vaciar el carrito');
    }
}

// Validar input de cupón
function validarInputCupon(input) {
    const valor = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    input.value = valor;
}

// Aplicar cupón
async function aplicarCupon() {
    const inputCupon = document.getElementById('input-cupon');
    const mensajeCupon = document.getElementById('mensaje-cupon');
    const codigo = inputCupon.value.trim().toUpperCase();
    
    if (!codigo) {
        mensajeCupon.textContent = 'Por favor ingresa un código de cupón';
        mensajeCupon.style.color = '#e74c3c';
        return;
    }
    
    const regex = /^[A-Z0-9]+$/;
    if (!regex.test(codigo)) {
        mensajeCupon.textContent = 'El código solo debe contener letras y números';
        mensajeCupon.style.color = '#e74c3c';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cupones/validar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo })
        });
        
        const resultado = await response.json();
        
        if (resultado.valido) {
            cuponAplicado = codigo;
            descuentoActual = resultado.descuento;
            
            mensajeCupon.textContent = resultado.mensaje;
            mensajeCupon.style.color = '#27ae60';
            
            document.getElementById('btn-aplicar-cupon').style.display = 'none';
            document.getElementById('btn-quitar-cupon').style.display = 'inline-block';
            
            inputCupon.disabled = true;
            
            await aplicarCuponAlCarrito(codigo);
            
        } else {
            mensajeCupon.textContent = resultado.mensaje;
            mensajeCupon.style.color = '#e74c3c';
        }
        
    } catch (error) {
        console.error('Error al validar cupón:', error);
        mensajeCupon.textContent = 'Error al validar el cupón. Intenta de nuevo.';
        mensajeCupon.style.color = '#e74c3c';
    }
}

// Aplicar cupón al carrito
async function aplicarCuponAlCarrito(codigo) {
    try {
        const response = await fetch(`${API_URL}/carrito/${USUARIO_ID}?codigoCupon=${codigo}`);
        
        if (!response.ok) {
            throw new Error('Error al aplicar cupón al carrito');
        }
        
        const data = await response.json();
        
        if (data.items.length === 0) {
            mostrarCarritoVacio();
        } else {
            mostrarCarritoConProductos(data);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Quitar cupón
function quitarCupon() {
    cuponAplicado = null;
    descuentoActual = 0;
    
    document.getElementById('btn-aplicar-cupon').style.display = 'inline-block';
    document.getElementById('btn-quitar-cupon').style.display = 'none';
    
    const inputCupon = document.getElementById('input-cupon');
    const mensajeCupon = document.getElementById('mensaje-cupon');
    
    inputCupon.disabled = false;
    inputCupon.value = '';
    
    mensajeCupon.textContent = '';
    
    cargarCarrito();
}

// Limpiar UI del cupón
function limpiarCupon() {
    const inputCupon = document.getElementById('input-cupon');
    const btnAplicar = document.getElementById('btn-aplicar-cupon');
    const btnQuitar = document.getElementById('btn-quitar-cupon');
    
    if (inputCupon) {
        inputCupon.value = '';
        inputCupon.disabled = false;
    }
    
    if (btnAplicar) {
        btnAplicar.style.display = 'inline-block';
        btnAplicar.disabled = false;
    }
    
    if (btnQuitar) {
        btnQuitar.style.display = 'none';
    }
}

// ✅ SOLUCIÓN 2: Validar país antes de crear orden
async function crearOrden() {
    // Validar que se haya seleccionado un país
    const selecPais = document.getElementById('select-pais');
    
    if (!selecPais.value) {
        alert('⚠️ Por favor selecciona el país de envío');
        selecPais.focus();
        selecPais.style.border = '2px solid #e74c3c';
        setTimeout(() => {
            selecPais.style.border = '';
        }, 2000);
        return;
    }
    
    try {
        let url = `${API_URL}/carrito/${USUARIO_ID}`;
        if(cuponAplicado){
            url += `?codigoCupon=${cuponAplicado}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al obtener el carrito');
        }
        
        const data = await response.json();
        
        if (data.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        const pais = selecPais.value;
        
        const subtotal = data.resumen.subtotal;
        let envio = 0;
        if(subtotal < 500){
            if(pais === 'MX'){
                envio = 150;
            } else {
                envio = 350;
            }
        }
        
        localStorage.setItem('checkout_data', JSON.stringify({
            usuarioId: USUARIO_ID,
            items: data.items,
            resumen: {
                ...data.resumen,
                envio: envio
            },
            cupon: cuponAplicado ? {
                codigo: cuponAplicado,
                descuento: data.resumen.descuento || 0
            } : null
        }));
        
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra. Intenta de nuevo.');
    }
}

// ✅ SOLUCIÓN 1: Función para actualizar contador del carrito
async function actualizarContadorCarrito(usuarioId) {
    try {
        const response = await fetch(`${API_URL}/carrito/${usuarioId}`);
        
        if (response.ok) {
            const carrito = await response.json();
            const cantidadItems = carrito.items ? carrito.items.length : 0;
            
            // Actualizar contador en todas las páginas
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