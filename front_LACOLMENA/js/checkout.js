// js/checkout.js
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
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
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
        alert('No hay información del carrito');
        window.location.href = 'carrito.html';
        return;
    }
    
    checkoutData = JSON.parse(data);

    if(checkoutData.cupon){
        cuponInfo = checkoutData.cupon;
        console.log('Cupon detectado:', cuponInfo);
    }
    
    mostrarResumenPedido();
}

// Mostrar resumen del pedido
function mostrarResumenPedido() {
    const container = document.getElementById('resumen-items');
    container.innerHTML = '';
    
    checkoutData.items.forEach(item => {
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span>${item.nombre} (x${item.cantidad})</span>
                <span>$${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    // Calcular los totales con el cupon
    const subtotal = checkoutData.resumen.subtotal;
    const impuestos = checkoutData.resumen.impuestos;
    let descuento = 0;

    //Aplicar el descuento si hay cupon (a ver si funciona :"( )
    if(cuponInfo && cuponInfo.descuento){
        descuento = subtotal * (cuponInfo.descuento / 100);
    }

    const total = subtotal + impuestos - descuento;

    //Actualiza los elementos del resumen
    document.getElementById('resumen-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('resumen-impuestos').textContent = impuestos.toFixed(2);

    //Aqui agrega linea de descuento si hay
    const totalsDiv = document.querySelector('.totals');

    //Buscar si ya existe la linea del descuento
    let descuentoRow = document.getElementById('descuento-row');

    if(descuento > 0){
        if(!descuentoRow){
            // Crear línea de descuento
            descuentoRow = document.createElement('div');
            descuentoRow.id = 'descuento-row';
            descuentoRow.className = 'total-row';
            descuentoRow.style.color = '#27ae60';
            descuentoRow.style.fontWeight = '600';
            
            // Insertar antes del total final
            const finalRow = totalsDiv.querySelector('.final');
            totalsDiv.insertBefore(descuentoRow, finalRow);
        }
        descuentoRow.innerHTML = `
            <span>🎟️ Descuento (${cuponInfo.descuento}%):</span>
            <span>-$${descuento.toFixed(2)}</span>
        `;
    } else if (descuentoRow) {
        // Remover línea de descuento si no hay cupón
        descuentoRow.remove();
    }

    //Actualizar total
    document.getElementById('resumen-total'). textContent = total.toFixed(2);
    document.getElementById('total-oxxo').textContent = total.toFixed(2);

    mostrarBannerCupon(descuento);

    /*document.getElementById('resumen-subtotal').textContent = checkoutData.resumen.subtotal.toFixed(2);
    document.getElementById('resumen-impuestos').textContent = checkoutData.resumen.impuestos.toFixed(2);
    document.getElementById('resumen-total').textContent = checkoutData.resumen.total.toFixed(2);
    document.getElementById('total-oxxo').textContent = checkoutData.resumen.total.toFixed(2);*/
}

// NUEVA FUNCIÓN: Mostrar banner de cupón aplicado
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
    // Aqui se valida que solo sean letras en los que corresponden, putos los campos si no
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

    // Campo Colonia (letras y numeros)
    const coloniaInput = document.getElementById('colonia');
    if (coloniaInput) {
        coloniaInput.addEventListener('input', function(e){
            this.value = this.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
        });
    }

    //Aqui se valida para los campos de numeros

    const camposNumeros = ['telefono', 'numeroExterior', 'codigoPostal'];
    camposNumeros.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', function(e) {
                //Solo numeros
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    });

    //Aqui es del telefono, es para que solo sean 10 digitos
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
        });
    }

    //Campo para el codigo postal, solo 5 digitos
    const cpInput = document.getElementById('codigoPostal');
    if (cpInput) {
        cpInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 5);
        });
    }

    //Campo para numero interior (aqui para campos con letras y numeros)
    const noInteriorInput = document.getElementById('numeroInterior');
    if (noInteriorInput) {
        noInteriorInput.addEventListener('input', function(e) {
            //letras, numeros y espacios
            this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '');
        });
    }

    //Campo calle (numeros y letras con puntos y comas)
    const calleInput = document.getElementById('calle');
    if (calleInput) {
        calleInput.addEventListener('input', function(e) {
            //Letras, numeros, espacios, puntos, comas y acentos
            this.value = this.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,]/g, '');
        });
    }

    //Campo referencias (numeros y letras amplio)
    const referenciasInput = document.getElementById('referencias');
    if (referenciasInput){
        referenciasInput.addEventListener('input', function(e){
            this.value = this.value.replace(/[<>{}[\]\\]/g, '');
        });
    }

    //Aqui para el email
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

    //Aqui es todo lo de la tarjeta :v
    
    //Fomentar que sean grupos de 4 en los numeros de la tarjeta
    const numeroTarjetaInput = document.getElementById('numeroTarjeta');
    if (numeroTarjetaInput) {
        numeroTarjetaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            value = value.substring(0, 16); // Máximo 16 dígitos
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    //Campo para el nombre del titular (osea solo letras)
    const nombreTitularInput = document.getElementById('nombreTitular');
    if (nombreTitularInput) {
        nombreTitularInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
        });
    }

    //Cmapo  Validar solo números en CVV (3-4 dígitos)
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
        'calle',
        'numeroExterior',
        'colonia',
        'ciudad',
        'estado',
        'codigoPostal'
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
        alert('Por favor ingresa un correo electrónico válido');
        document.getElementById('email').focus();
        return false;
    }

    // Validar código postal (5 dígitos)
    const cp = document.getElementById('codigoPostal').value;
    if (!/^\d{5}$/.test(cp)) {
        alert('El código postal debe tener 5 dígitos');
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
    shippingData.calle = document.getElementById('calle').value;
    shippingData.numeroExterior = document.getElementById('numeroExterior').value;
    shippingData.numeroInterior = document.getElementById('numeroInterior').value;
    shippingData.colonia = document.getElementById('colonia').value;
    shippingData.ciudad = document.getElementById('ciudad').value;
    shippingData.estado = document.getElementById('estado').value;
    shippingData.codigoPostal = document.getElementById('codigoPostal').value;
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
        alert('Por favor selecciona un método de pago');
        return false;
    }

    if (selectedPaymentMethod === 'tarjeta') {
        const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
        const nombreTitular = document.getElementById('nombreTitular').value;
        const mes = document.getElementById('mesExpiracion').value;
        const anio = document.getElementById('anioExpiracion').value;
        const cvv = document.getElementById('cvv').value;

        if (!numeroTarjeta || numeroTarjeta.length < 13) {
            alert('Por favor ingresa un número de tarjeta válido');
            return false;
        }

        if (!nombreTitular.trim()) {
            alert('Por favor ingresa el nombre del titular');
            return false;
        }

        if (!mes || !anio) {
            alert('Por favor selecciona la fecha de expiración');
            return false;
        }

        if (!cvv || cvv.length < 3) {
            alert('Por favor ingresa un CVV válido');
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
    btnConfirmar.textContent = 'Procesando...';

    try {
        //Preparar datos para enviar
        const datosOrden = {};

        //Agregar el cupon si existe
        if(cuponInfo && cuponInfo.codigo){
            datosOrden.codigoCupon = cuponInfo.codigo;
            console.log('Enviando cupon:', cuponInfo.codigo);
        }

        // Llamar a la API para crear la orden
        const response = await fetch(`${API_URL}/carrito/crear-orden/${checkoutData.usuarioId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosOrden) //Para enviar los datos con el cupon
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al crear la orden');
        }

        const data = await response.json();
        
        // Determinar mensaje según método de pago
        let successMessage = '';
        if (selectedPaymentMethod === 'tarjeta') {
            successMessage = 'Tu pago ha sido procesado exitosamente.';
        } else if (selectedPaymentMethod === 'transferencia') {
            successMessage = `Recibirás las instrucciones de transferencia en ${shippingData.email}`;
        } else if (selectedPaymentMethod === 'oxxo') {
            successMessage = `Recibirás tu ficha de pago OXXO en ${shippingData.email}`;
        }

        if(data.orden.cupon){
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
        console.log('Orden creada:', data);
        console.log('Datos de envío:', shippingData);
        console.log('Método de pago:', selectedPaymentMethod);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra: ' + error.message);
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = textoOriginal;
    }
}