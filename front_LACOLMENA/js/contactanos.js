// ============================================
// FORMULARIO DE CONTACTO - LA COLMENA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                asunto: document.getElementById('asunto').value,
                mensaje: document.getElementById('mensaje').value
            };
            
            // Validar campos
            if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
                mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
                return;
            }
            
            // Validar email
            if (!validarEmail(formData.email)) {
                mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
                return;
            }
            
            // Deshabilitar botón mientras se envía
            const submitBtn = contactForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('span:first-child');
            const originalText = btnText.textContent;
            
            submitBtn.disabled = true;
            btnText.textContent = 'Enviando...';
            
            // Simular envío (aquí conectarías con tu backend)
            setTimeout(() => {
                console.log('Datos del formulario:', formData);
                
                mostrarMensaje('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                
                // Limpiar formulario
                contactForm.reset();
                
                // Restaurar botón
                submitBtn.disabled = false;
                btnText.textContent = originalText;
            }, 1500);
        });
    }
    
    // Función para validar email
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        // Eliminar mensaje anterior si existe
        const mensajeExistente = document.querySelector('.mensaje-alerta');
        if (mensajeExistente) {
            mensajeExistente.remove();
        }
        
        // Crear nuevo mensaje
        const mensaje = document.createElement('div');
        mensaje.className = `mensaje-alerta ${tipo}`;
        mensaje.textContent = texto;
        
        // Estilos del mensaje
        mensaje.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.4s ease;
        `;
        
        if (tipo === 'success') {
            mensaje.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            mensaje.style.color = 'white';
        } else {
            mensaje.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
            mensaje.style.color = 'white';
        }
        
        document.body.appendChild(mensaje);
        
        // Eliminar después de 4 segundos
        setTimeout(() => {
            mensaje.style.animation = 'slideOut 0.4s ease';
            setTimeout(() => mensaje.remove(), 400);
        }, 4000);
    }
    
    // Animación de entrada para los elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos
    document.querySelectorAll('.form-card, .info-card, .social-card, .map-section').forEach(element => {
        observer.observe(element);
    });
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});