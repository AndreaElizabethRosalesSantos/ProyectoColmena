// js/carrito.js
const API_URL = 'http://localhost:3000/api';

// Obtener ID del usuario (deberías obtenerlo del login real)
// Por ahora usamos un ID fijo para pruebas
const USUARIO_ID = 1; // Cambiar según tu sistema de login

console.log('Intentando conectar con:', API_URL);

let cuponAplicado = null;
let descuentoActual = 0;

// Cargar el carrito al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});

// Función para cargar el carrito desde la API
async function cargarCarrito() {
    try {
        const response = await fetch(`${API_URL}/carrito/${USUARIO_ID}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar el carrito');
        }

        const data = await response.json();
        
        if (data.items.length === 0) {
            mostrarCarritoVacio();
        } else {
            mostrarCarritoConProductos(data);
        }
        
    } catch (error) {
        console.error('Error:', error);
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
    
    // Renderizar items
    const itemsContainer = document.getElementById('items-carrito');
    itemsContainer.innerHTML = '';
    
    data.items.forEach(item => {
        const itemHTML = crearItemHTML(item);
        itemsContainer.innerHTML += itemHTML;
    });
    
    // Actualizar resumen
    actualizarResumen(data.resumen);
}

// Crear HTML para un item del carrito
function crearItemHTML(item) {
    return `
        <div class="carrito-item" data-item-id="${item.id}">
            <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                <img src="${item.imagen}" alt="${item.nombre}" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
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
    document.getElementById('subtotal').textContent = resumen.subtotal.toFixed(2);
    document.getElementById('impuestos').textContent = resumen.impuestos.toFixed(2);
    document.getElementById('envio').textContent = '0.00'; // Sin envío por ahora

    const descuentoElement = document.getElementById('descuento');
    if(resumen.descuento && resumen.descuento > 0){
        if(descuentoElement){
            descuentoElement.textContent = resumen.descuento.toFixed(2);
        }
    } else if(descuentoElement){
        descuentoElement.textContent = '0.00';
    }

    document.getElementById('total').textContent = resumen.total.toFixed(2);    
}

// Cambiar cantidad de un producto
async function cambiarCantidad(itemId, nuevaCantidad, disponibilidad) {
    // Validaciones
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
        
        //Se limpia el cupon
        cuponAplicado = null;
        descuentoActual = 0;
        limpiarCupon();

        cargarCarrito();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al vaciar el carrito');
    }
}

//Funciones cupon
// Validar input de cupón (solo letras y números)
function validarInputCupon(input) {
    // Convertir a mayúsculas y eliminar caracteres no válidos
    const valor = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    input.value = valor;
}

// Aplicar cupón
async function aplicarCupon() {
    const inputCupon = document.getElementById('input-cupon');
    const mensajeCupon = document.getElementById('mensaje-cupon');
    const codigo = inputCupon.value.trim().toUpperCase();
    
    // Validar que no esté vacío
    if (!codigo) {
        mensajeCupon.textContent = 'Por favor ingresa un código de cupón';
        mensajeCupon.style.color = '#e74c3c';
        return;
    }
    
    // Validar formato (solo letras y números)
    const regex = /^[A-Z0-9]+$/;
    if (!regex.test(codigo)) {
        mensajeCupon.textContent = 'El código solo debe contener letras y números';
        mensajeCupon.style.color = '#e74c3c';
        return;
    }
    
    try {
        // Validar cupón con la API
        const response = await fetch(`${API_URL}/cupones/validar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo })
        });
        
        const resultado = await response.json();
        
        if (resultado.valido) {
            // Cupón válido
            cuponAplicado = codigo;
            descuentoActual = resultado.descuento;
            
            mensajeCupon.textContent = resultado.mensaje;
            mensajeCupon.style.color = '#27ae60';
            
            // Deshabilitar input y botón de aplicar
            inputCupon.disabled = true;
            document.getElementById('btn-aplicar-cupon').disabled = true;
            document.getElementById('btn-aplicar-cupon').style.opacity = '0.5';
            
            // Mostrar botón de quitar
            document.getElementById('btn-quitar-cupon').style.display = 'inline-block';
            
            // Recargar carrito con cupón
            await aplicarCuponAlCarrito(codigo);
            
        } else {
            // Cupón inválido
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
    
    // Limpiar UI
    limpiarCupon();
    
    // Recargar carrito sin cupón
    cargarCarrito();
    
    // Mensaje temporal
    const mensajeCupon = document.getElementById('mensaje-cupon');
    mensajeCupon.textContent = 'Cupón removido';
    mensajeCupon.style.color = '#f39c12';
    
    setTimeout(() => {
        mensajeCupon.textContent = '';
    }, 2000);
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
        btnAplicar.disabled = false;
        btnAplicar.style.opacity = '1';
    }
    
    if (btnQuitar) {
        btnQuitar.style.display = 'none';
    }
}


// Crear orden - Redirigir al checkout
async function crearOrden() {
    try {
        // Primero obtener el carrito actual
        const response = await fetch(`${API_URL}/carrito/${USUARIO_ID}`);
        
        if (!response.ok) {
            throw new Error('Error al obtener el carrito');
        }
        
        const data = await response.json();
        
        if (data.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Guardar información del carrito en localStorage para el checkout
        localStorage.setItem('checkout_data', JSON.stringify({
            usuarioId: USUARIO_ID,
            items: data.items,
            resumen: data.resumen,
            cupon: cuponAplicado ? {
                codigo: cuponAplicado,
                descuento: descuentoActual
            } : null
        }));
        
        // Redirigir a la página de checkout
        window.location.href = 'checkout.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra. Intenta de nuevo.');
    }
}