// front_LACOLMENA/js/checkout.js
const API_URL = 'http://localhost:3000/api';

// Variables globales
let currentStep = 1;
let selectedPaymentMethod = '';
let checkoutData = null;
let cuponInfo = null;

// Datos del formulario de envío
const shippingData = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    estado: '',
    ciudad: '',
    codigoPostal: '',
    colonia: '',
    referencias: ''
};

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosCheckout();
    setupValidations();
});

// Cargar datos del carrito desde localStorage
function cargarDatosCheckout() {
    const data = localStorage.getItem('checkout_data');
    
    if (!data) {
        alert('🚫 No hay información del carrito');
        window.location.href = 'carrito.html';
        return;
    }
    
    checkoutData = JSON.parse(data);

    // Verificar si hay cupón
    if (checkoutData.cupon) {
        cuponInfo = checkoutData.cupon;
        console.log('🎟️ Cupón detectado:', cuponInfo);
    }
    
    mostrarResumenPedido();
}

// Mostrar resumen del pedido
function mostrarResumenPedido() {
    const container = document.getElementById('resumen-items');
    container.innerHTML = '';
    
    checkoutData.items.forEach(item => {
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3e2c4;">
                <span style="color: #5a4a3f;">${item.nombre} <small style="color: #7a6a40;">(x${item.cantidad})</small></span>
                <span style="font-weight: 600; color: #5a4a3f;">$${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    // Calcular los totales con el cupón
    const subtotal = checkoutData.resumen.subtotal;
    const impuestos = checkoutData.resumen.impuestos;
    let envio = checkoutData.resumen.envio || 0;
    let descuento = 0;

    // Aplicar el descuento si hay cupón
    if (cuponInfo && cuponInfo.descuento) {
        // Si el descuento viene como porcentaje (ej: 10)
        if (cuponInfo.descuento <= 100) {
            descuento = subtotal * (cuponInfo.descuento / 100);
        } 
        // Si viene como monto (ej: 96.00) 
        else {
            descuento = cuponInfo.descuento;
            // Calcular porcentaje para mostrar
            const porcentaje = (descuento / subtotal) * 100;
            cuponInfo.descuento = porcentaje.toFixed(1); // Actualizar para mostrar
        }
    }

    const total = subtotal + impuestos + envio - descuento;

    // Actualiza los elementos del resumen
    document.getElementById('resumen-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('resumen-impuestos').textContent = impuestos.toFixed(2);

    // Aquí agrega línea de gastos de envío
    const totalsDiv = document.querySelector('.totals');
    
    // Crear o actualizar la fila de envío
    let envioRow = document.getElementById('envio-row');
    if (!envioRow) {
        envioRow = document.createElement('div');
        envioRow.id = 'envio-row';
        envioRow.className = 'total-row';
        
        // Insertar después de impuestos
        const impuestosRow = totalsDiv.children[1];
        impuestosRow.insertAdjacentElement('afterend', envioRow);
    }
    
    if (envio === 0) {
        envioRow.innerHTML = `
            <span>Gastos de envío:</span>
            <span style="color: #27ae60; font-weight: 600;">$0.00</span>
        `;
    } else {
        envioRow.innerHTML = `
            <span>Gastos de envío:</span>
            <span>$${envio.toFixed(2)}</span>
        `;
    }

    // Línea de descuento
    let descuentoRow = document.getElementById('descuento-row');
    if (descuento > 0) {
        if (!descuentoRow) {
            descuentoRow = document.createElement('div');
            descuentoRow.id = 'descuento-row';
            descuentoRow.className = 'total-row';
            descuentoRow.style.color = '#27ae60';
            descuentoRow.style.fontWeight = '600';
            
            // Insertar después de envío
            envioRow.insertAdjacentElement('afterend', descuentoRow);
        }
        
        // Mostrar el porcentaje correcto
        const porcentajeDescuento = cuponInfo.descuento;
        descuentoRow.innerHTML = `
            <span>Descuento (${porcentajeDescuento}%):</span>
            <span>-$${descuento.toFixed(2)}</span>
        `;
    } else if (descuentoRow) {
        // Remover línea de descuento si no hay cupón
        descuentoRow.remove();
    }

    // Actualizar total
    document.getElementById('resumen-total').textContent = total.toFixed(2);
    document.getElementById('total-oxxo').textContent = total.toFixed(2);

    mostrarBannerCupon(descuento);
}

// Mostrar banner de cupón aplicado
function mostrarBannerCupon(descuento) {
    // Buscar o crear el contenedor del banner
    let bannerCupon = document.getElementById('banner-cupon');
    
    if (cuponInfo && descuento > 0) {
        if (!bannerCupon) {
            // Crear banner
            bannerCupon = document.createElement('div');
            bannerCupon.id = 'banner-cupon';
            bannerCupon.style.cssText = `
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                padding: 15px 20px;
                border-radius: 8px;
                margin: 15px 0;
                border: 2px solid #28a745;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideIn 0.5s ease;
            `;
            
            // Insertar después del resumen de items
            const orderSummary = document.querySelector('.order-summary');
            const totalsDiv = document.querySelector('.totals');
            orderSummary.insertBefore(bannerCupon, totalsDiv);
        }
        
        bannerCupon.innerHTML = `
            <span style="font-size: 24px;">✅</span>
            <div style="flex: 1;">
                <div style="font-weight: 700; color: #155724; font-size: 16px;">
                    Cupón aplicado: ${cuponInfo.codigo}
                </div>
                <div style="color: #155724; font-size: 14px;">
                    Ahorraste $${descuento.toFixed(2)} en esta compra
                </div>
            </div>
        `;
    } else if (bannerCupon) {
        // Remover banner si no hay cupón
        bannerCupon.remove();
    }
}

// Configurar validaciones
function setupValidations() {
    // Validar solo letras en los campos correspondientes
    const camposLetras = ['nombre', 'apellidos', 'ciudad'];
    camposLetras.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input){
            input.addEventListener('input', function(e){
                // Solo letras, espacio, acentos y ñ
                this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
            });
        }
    });

    // Campo Colonia (letras y números)
    const coloniaInput = document.getElementById('colonia');
    if (coloniaInput) {
        coloniaInput.addEventListener('input', function(e){
            this.value = this.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
        });
    }

    // Campos numéricos
    const camposNumeros = ['telefono', 'numeroExterior', 'codigoPostal'];
    camposNumeros.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', function(e) {
                // Solo números
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    });

    // Teléfono (10 dígitos)
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
        });
    }

    // Código postal (5 dígitos)
    const cpInput = document.getElementById('codigoPostal');
    if (cpInput) {
        cpInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 5);
        });
    }

    // Número interior (letras y números)
    const noInteriorInput = document.getElementById('numeroInterior');
    if (noInteriorInput) {
        noInteriorInput.addEventListener('input', function(e) {
            // Letras, números y espacios
            this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '');
        });
    }

    // Campo calle (números y letras con puntos y comas)
    const calleInput = document.getElementById('calle');
    if (calleInput) {
        calleInput.addEventListener('input', function(e) {
            // Letras, números, espacios, puntos, comas y acentos
            this.value = this.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,]/g, '');
        });
    }

    // Campo referencias (números y letras amplio)
    const referenciasInput = document.getElementById('referencias');
    if (referenciasInput){
        referenciasInput.addEventListener('input', function(e){
            this.value = this.value.replace(/[<>{}[\]\\]/g, '');
        });
    }

    // Validar email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function(e){
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.setCustomValidity('Por favor ingresa un email válido');
                this.reportValidity();
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Número de tarjeta (grupos de 4)
    const numeroTarjetaInput = document.getElementById('numeroTarjeta');
    if (numeroTarjetaInput) {
        numeroTarjetaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            value = value.substring(0, 16); // Máximo 16 dígitos
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Nombre del titular (solo letras)
    const nombreTitularInput = document.getElementById('nombreTitular');
    if (nombreTitularInput) {
        nombreTitularInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
        });
    }

    // CVV (3-4 dígitos)
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 4);
        });
    }
}

// Validar formulario de envío
function validateShippingForm() {
    const requiredFields = [
        'nombre',
        'apellidos',
        'email',
        'telefono',
        'estado',
        'ciudad',
        'codigoPostal',
        'calle',
        'numeroExterior',
        'colonia'
    ];

    for (const field of requiredFields) {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            alert(`Por favor completa el campo: ${input.previousElementSibling.textContent}`);
            input.focus();
            return false;
        }
    }

    // Validar email
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert(' Por favor ingresa un correo electrónico válido');
        document.getElementById('email').focus();
        return false;
    }

    // Validar código postal (5 dígitos)
    const cp = document.getElementById('codigoPostal').value;
    if (!/^\d{5}$/.test(cp)) {
        alert(' El código postal debe tener 5 dígitos');
        document.getElementById('codigoPostal').focus();
        return false;
    }

    return true;
}

// Guardar datos de envío
function saveShippingData() {
    shippingData.nombre = document.getElementById('nombre').value;
    shippingData.apellidos = document.getElementById('apellidos').value;
    shippingData.email = document.getElementById('email').value;
    shippingData.telefono = document.getElementById('telefono').value;
    shippingData.estado = document.getElementById('estado').value;
    shippingData.codigoPostal = document.getElementById('codigoPostal').value;
    shippingData.ciudad = document.getElementById('ciudad').value;
    shippingData.calle = document.getElementById('calle').value;
    shippingData.numeroExterior = document.getElementById('numeroExterior').value;
    shippingData.numeroInterior = document.getElementById('numeroInterior').value;
    shippingData.colonia = document.getElementById('colonia').value;
    shippingData.referencias = document.getElementById('referencias').value;
}

// Continuar al paso de pago
function continueToPayment() {
    if (!validateShippingForm()) {
        return;
    }

    saveShippingData();
    currentStep = 2;
    
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    
    // Actualizar indicadores de pasos
    document.getElementById('step1-indicator').classList.remove('active');
    document.getElementById('step1-indicator').classList.add('completed');
    document.getElementById('step2-indicator').classList.add('active');
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Regresar al paso de envío
function goBackToShipping() {
    currentStep = 1;
    
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    
    // Actualizar indicadores de pasos
    document.getElementById('step1-indicator').classList.add('active');
    document.getElementById('step1-indicator').classList.remove('completed');
    document.getElementById('step2-indicator').classList.remove('active');
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Seleccionar método de pago
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Ocultar todos los formularios
    document.getElementById('cardForm').style.display = 'none';
    document.getElementById('transferForm').style.display = 'none';
    document.getElementById('oxxoForm').style.display = 'none';
    
    // Mostrar el contenedor de formularios
    document.getElementById('paymentForms').style.display = 'block';
    
    // Mostrar el formulario correspondiente
    if (method === 'tarjeta') {
        document.getElementById('cardForm').style.display = 'block';
    } else if (method === 'transferencia') {
        document.getElementById('transferForm').style.display = 'block';
    } else if (method === 'oxxo') {
        document.getElementById('oxxoForm').style.display = 'block';
    }
    
    // Scroll suave al formulario
    setTimeout(() => {
        document.getElementById('paymentForms').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

// Validar pago según el método seleccionado
function validatePayment() {
    if (!selectedPaymentMethod) {
        alert('💳 Por favor selecciona un método de pago');
        return false;
    }

    if (selectedPaymentMethod === 'tarjeta') {
        const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
        const nombreTitular = document.getElementById('nombreTitular').value;
        const mes = document.getElementById('mesExpiracion').value;
        const anio = document.getElementById('anioExpiracion').value;
        const cvv = document.getElementById('cvv').value;

        if (!numeroTarjeta || numeroTarjeta.length < 13) {
            alert('💳 Por favor ingresa un número de tarjeta válido');
            return false;
        }

        if (!nombreTitular.trim()) {
            alert('👤 Por favor ingresa el nombre del titular');
            return false;
        }

        if (!mes || !anio) {
            alert('📅 Por favor selecciona la fecha de expiración');
            return false;
        }

        if (!cvv || cvv.length < 3) {
            alert('🔒 Por favor ingresa un CVV válido');
            return false;
        }
    }

    return true;
}

// Finalizar la compra - Crear orden en la base de datos
async function finalizePurchase() {
    if (!validatePayment()) {
        return;
    }

    // Mostrar loading
    const btnConfirmar = document.querySelector('.btn-success');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = '⏳ Procesando...';

    try {
        // Preparar datos para enviar
        const datosOrden = {};

        // Agregar el cupón si existe
        if (cuponInfo && cuponInfo.codigo) {
            datosOrden.codigoCupon = cuponInfo.codigo;
            console.log(' Enviando cupón:', cuponInfo.codigo);
        }

        // Llamar a la API para crear la orden
        const response = await fetch(`${API_URL}/carrito/crear-orden/${checkoutData.usuarioId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosOrden) // Para enviar los datos con el cupón
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al crear la orden');
        }

        const data = await response.json();
        
        // Determinar mensaje según método de pago
        let successMessage = '';
        if (selectedPaymentMethod === 'tarjeta') {
            successMessage = '✅ Tu pago ha sido procesado exitosamente.';
        } else if (selectedPaymentMethod === 'transferencia') {
            successMessage = `🏦 Recibirás las instrucciones de transferencia en ${shippingData.email}`;
        } else if (selectedPaymentMethod === 'oxxo') {
            successMessage = `🏪 Recibirás tu ficha de pago OXXO en ${shippingData.email}`;
        }

        // Agregar información del cupón si se aplicó
        if (data.orden.cupon) {
            successMessage += `\n\n Descuento aplicado: ${data.orden.cupon.porcentaje}% (Ahorraste $${data.orden.descuento.toFixed(2)})`;
        }

        // Mostrar mensaje de éxito 
        document.getElementById('step2').style.display = 'none';
        document.getElementById('successMessage').style.display = 'flex';
        document.getElementById('successText').textContent = successMessage;
        document.getElementById('orderNumber').textContent = '#' + data.orden.id;

        // Limpiar localStorage
        localStorage.removeItem('checkout_data');

        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Log para debug
        console.log('✅ Orden creada:', data);
        console.log('📦 Datos de envío:', shippingData);
        console.log('💳 Método de pago:', selectedPaymentMethod);

    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al procesar la compra: ' + error.message);
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = textoOriginal;
    }
}