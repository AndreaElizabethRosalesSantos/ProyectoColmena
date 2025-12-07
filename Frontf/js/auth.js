const API_URL = 'http://localhost:3000/api';

// Variables globales para CAPTCHA
let captchaToken = '';
let captchaId = '';

const ADMIN_USER_ID = 20; // ID que corresponda aL admin

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    // Generar CAPTCHA automáticamente al cargar la página
    generarCaptcha();
});

// ================================
// FUNCIONES CAPTCHA
// ================================

// Generar nuevo CAPTCHA
// Generar nuevo CAPTCHA
async function generarCaptcha() {
    try {
        console.log('🔵 Generando nuevo CAPTCHA...');
        
        const response = await fetch(`${API_URL}/users/captcha`);
        const data = await response.json();
        
        console.log('Respuesta CAPTCHA:', data);
        
        if (data.success) {
            captchaToken = data.token;
            captchaId = data.captchaId;
            
            // Mostrar CAPTCHA según tu estructura HTML
            const captchaImage = document.getElementById('captchaImage');
            const captchaContainer = document.getElementById('captchaContainer');
            
            if (data.svg) {
                // Si el backend devuelve SVG
                if (captchaContainer) {
                    captchaContainer.innerHTML = data.svg;
                    console.log('✅ CAPTCHA SVG generado');
                }
            } else if (data.image) {
                // Si el backend devuelve base64 image
                if (captchaImage) {
                    captchaImage.src = `data:image/png;base64,${data.image}`;
                    captchaImage.style.display = 'block';
                    console.log('✅ CAPTCHA imagen generada');
                }
            } else if (data.captchaUrl) {
                // Si el backend devuelve URL
                if (captchaImage) {
                    captchaImage.src = `${API_URL}${data.captchaUrl}`;
                    captchaImage.style.display = 'block';
                    console.log('✅ CAPTCHA URL cargada');
                }
            }
            
            // Limpiar el campo de entrada
            const captchaInput = document.getElementById('captchaInput');
            if (captchaInput) {
                captchaInput.value = '';
                captchaInput.focus();
            }
            
            // Limpiar errores previos
            const captchaError = document.getElementById('captchaError');
            if (captchaError) captchaError.textContent = '';
            
            console.log('✅ CAPTCHA generado. ID:', captchaId, 'Token:', captchaToken);
            return true;
        } else {
            console.error('❌ Error generando CAPTCHA:', data.message);
            Swal.fire('Error', 'No se pudo generar el CAPTCHA. Intenta de nuevo.', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Error generando CAPTCHA:', error);
        Swal.fire('Error', 'No se pudo conectar al servidor. Verifica tu conexión.', 'error');
        return false;
    }
}

// Función específica para cargar CAPTCHA (puedes usarla si prefieres)
async function loadCaptcha() {
    return await generarCaptcha();
}
// ================================
// LOGIN CON CAPTCHA MEJORADO
// ================================
async function handleLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('loginEmail').value;
    const contrasena = document.getElementById('loginPassword').value;
    const captchaText = document.getElementById('captchaInput') ? document.getElementById('captchaInput').value : '';
    const submitBtn = document.querySelector('#loginForm .auth-button');

    // Validaciones básicas
    if (!usuario || !contrasena) {
        Swal.fire('Campos requeridos', 'Ingresa usuario y contraseña', 'warning');
        return;
    }

    // Validar que el CAPTCHA esté completo
    if (!captchaText) {
        Swal.fire('CAPTCHA requerido', 'Por favor completa el CAPTCHA para continuar', 'warning');
        document.getElementById('captchaInput').focus();
        return;
    }

    if (!captchaToken) {
        Swal.fire('Error', 'El CAPTCHA no está disponible. Intenta recargar la página.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando...";

    try {
        // Usar login con CAPTCHA
        const bodyData = { 
            usuario, 
            contrasena,
            captchaToken,
            captchaText 
        };

        const response = await fetch(`${API_URL}/users/login-secure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (!data.success) {
            Swal.fire('Error', data.message || 'Credenciales incorrectas', 'error');
            
            // Regenerar CAPTCHA después de error
            await generarCaptcha();
            document.getElementById('captchaInput').value = '';
            document.getElementById('captchaInput').focus();
            
            submitBtn.disabled = false;
            submitBtn.textContent = "Iniciar Sesión";
            return;
        }

        // Éxito
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.usuario.usuario);
        localStorage.setItem('ID_USUARIO', data.usuario.id);

        // Cerrar modal y mostrar sección de usuario
        closeAuthModal();
        showUserSection(data.usuario.usuario);

        // Limpiar formularios
        e.target.reset();
        captchaToken = '';
        captchaId = '';

        // Regenerar CAPTCHA para próxima vez
        setTimeout(generarCaptcha, 500);

        // Mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido ${data.usuario.usuario}!`,
            text: 'Has iniciado sesión correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        //ADMIN
        const userId = data.usuario.id;
        if (userId === ADMIN_USER_ID) {
            // Esperar que termine el mensaje de bienvenida
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1600); // Un poco más del tiempo del Swal
        }
    } catch (error) {
        console.error('Error en login:', error);
        Swal.fire('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Iniciar Sesión";
    }
}
// ================================
// FUNCIONES PARA MOSTRAR/OCULTAR CAPTCHA
// ================================
function mostrarCaptchaSection() {
    const captchaSection = document.getElementById('captchaSection');
    if (captchaSection) {
        captchaSection.classList.remove('hidden');
    }
}

function ocultarCaptchaSection() {
    const captchaSection = document.getElementById('captchaSection');
    if (captchaSection) {
        captchaSection.classList.add('hidden');
    }
}

// ================================
// REGISTRO (igual que antes)
// ================================
async function handleRegister(e) {
    e.preventDefault();

    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const submitBtn = document.querySelector('#registerForm .auth-button');

    if (password !== passwordConfirm) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";

    const formData = {
        nomCompleto: document.getElementById('regName').value,
        usuario: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        contrasena1: password,
        contrasena2: passwordConfirm,
        telefono: document.getElementById('regPhone').value,
        direccion: document.getElementById('regDirection').value
    };

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire('Error', data.mensaje || `Error ${response.status}`, 'error');
            return;
        }

        Swal.fire({
            title: '¡Cuenta creada!',
            html: `${data.mensaje || 'Ya puedes iniciar sesión'}<br><br>
           <strong>ID de usuario:</strong> ${data.id_insertado}`,
            icon: 'success'
        });
        closeAuthModal();
        document.getElementById('registerForm').reset();
        closeAuthModal();

    } catch (error) {
        Swal.fire('Error de conexión', error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrarse";
    }
}

// ================================
// MANEJO DE MODALES (ACTUALIZADO)
// ================================
function showLogin() {
    closeAuthModal();
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        loginModal.removeAttribute('aria-hidden'); // AÑADIR ESTO
        
        // Generar nuevo CAPTCHA si no hay uno
        if (!captchaToken) {
            generarCaptcha();
        } else {
            mostrarCaptchaSection();
        }
        
        // Enfocar el primer campo después de un pequeño delay
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) emailInput.focus();
        }, 50);
    }
}

function showRegister() {
    closeAuthModal();
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.classList.add('active');
        registerModal.removeAttribute('aria-hidden'); // AÑADIR ESTO
    }
}

function showForgotPassword() {
    closeAuthModal();
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    if (forgotPasswordModal) {
        forgotPasswordModal.classList.add('active');
        forgotPasswordModal.removeAttribute('aria-hidden'); // AÑADIR ESTO
    }
}

function closeAuthModal() {
    document.querySelectorAll('.auth-container').forEach(modal => {
        modal.classList.remove('active');
        
        // REMOVER el foco de cualquier elemento dentro del modal
        const focusedElement = modal.querySelector(':focus');
        if (focusedElement) {
            focusedElement.blur();
        }
        
        // SOLO añadir aria-hidden cuando el modal esté realmente oculto
        modal.setAttribute('aria-hidden', 'true');
        
        // Asegurar que ningún elemento quede enfocado
        if (document.activeElement && modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    });
    
    // Enfocar un elemento seguro (como el body)
    document.body.focus();
}


// ================================
// RESTABLECER CONTRASEÑA (igual que antes)
// ================================
async function handleResetPassword(e) {
    e.preventDefault();

    const id = document.getElementById('regId').value;
    const contrasena = document.getElementById('forgotPass').value;
    const contrasena2 = document.getElementById('forgotPass2').value;
    const submitBtn = document.querySelector('#forgotPasswordForm .auth-button');
    console.log(contrasena);
    console.log(contrasena2);

    if (!id || !contrasena || !contrasena2) {
        Swal.fire('Campos requeridos', 'Todos los campos son obligatorios', 'warning');
        return;
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        Swal.fire('Error', 'El ID debe ser un número válido', 'error');
        return;
    }

    if (contrasena !== contrasena2) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Restableciendo...";

    try {
        const updateData = {
            contrasena: contrasena2
        };

        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            Swal.fire('Error', data.mensaje || `Error ${response.status}`, 'error');
            return;
        }

        Swal.fire({
            title: '¡Contraseña restablecida!',
            text: data.mensaje || 'Tu contraseña ha sido actualizada correctamente',
            icon: 'success'
        }).then(() => {
            closeAuthModal();
            document.getElementById('forgotPasswordForm').reset();
            showLogin();
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        Swal.fire('Error de conexión', 'No se pudo conectar con el servidor', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Restablecer Contraseña";
    }
}

// ================================
// EVENT LISTENERS (ACTUALIZADO)
// ================================
function setupEventListeners() {
    // Botón mostrar login
    const showLoginBtn = document.getElementById('showLoginBtn');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            showLogin();
            // Asegurar que CAPTCHA esté visible
            setTimeout(() => {
                mostrarCaptchaSection();
            }, 100);
        });
    }

    // Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Botón refresh CAPTCHA
    const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener('click', () => {
            generarCaptcha();
            document.getElementById('captchaInput').value = '';
            document.getElementById('captchaInput').focus();
        });
    }

    // Formularios
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleResetPassword);
    }
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-container')) {
            closeAuthModal();
        }
    });
}
// ================================
// FUNCIONES DE AUTENTICACIÓN (igual que antes)
// ================================
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('ID_USUARIO');

    if (token && username) {
        showUserSection(username);
        
        // Verificar si ya está en admin.html para no redirigir infinitamente
        const currentPage = window.location.pathname;
        const isAdminPage = currentPage.includes('admin.html');
        
        // Si es admin y NO está en admin.html, redirigir
        if (userId && parseInt(userId) === ADMIN_USER_ID && !isAdminPage) {
            // Pequeño delay para asegurar que la página cargue
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 100);
        }
        
        return true;
    } else {
        showLoginButton();
        return false;
    }
}

function showUserSection(username) {
    const showLoginBtn = document.getElementById('showLoginBtn');
    const userSection = document.getElementById('userSection');

    if (showLoginBtn) showLoginBtn.classList.add('hidden');
    if (userSection) {
        userSection.classList.add('active');
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) usernameDisplay.textContent = username;
    }
}

function showLoginButton() {
    const showLoginBtn = document.getElementById('showLoginBtn');
    const userSection = document.getElementById('userSection');

    if (showLoginBtn) showLoginBtn.classList.remove('hidden');
    if (userSection) userSection.classList.remove('active');
}

async function logout() {
    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que deseas salir?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        // Mostrar loading
        Swal.fire({
            title: 'Cerrando sesión...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 1. Llamar al endpoint de logout en el backend
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });

        const data = await response.json();

        // 2. Limpiar localStorage (frontend)
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('lastLoginAttempt');
        localStorage.clear();

        // 3. Cerrar cualquier modal abierto
        closeAuthModal();

        // 4. Actualizar UI
        showLoginButton();

        // 5. Mostrar confirmación
        Swal.fire({
            icon: 'success',
            title: '¡Sesión cerrada!',
            text: data.message || 'Has cerrado sesión correctamente',
            timer: 2000,
            showConfirmButton: false
        });

        // 6. Redirigir a inicio.html DESPUÉS del mensaje
        setTimeout(() => {
            window.location.href = 'inicio.html';
        }, 1500);

    } catch (error) {
        console.error('Error en logout:', error);

        // Si falla el logout en el backend, al menos limpiar frontend
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('ID_USUARIO');
        localStorage.clear();
        showLoginButton();

        Swal.fire({
            icon: 'warning',
            title: 'Sesión cerrada localmente',
            text: 'No se pudo contactar al servidor, pero la sesión se cerró en este dispositivo.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            // Redirigir incluso si hay error
            window.location.href = 'inicio.html';
        });
    }
}

// Exportar funciones si usas módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuthStatus,
        logout,
        protegerRuta,
        fetchAutenticado
    };
}

