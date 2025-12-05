
// CONFIGURACIÓN DE LA API
const API_URL = 'http://localhost:3000/api'; // CAMBIAR POR TU URL DEL BACKEND
let captchaToken = null;

// INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    checkAccountStatus(); // Verificar si la cuenta está bloqueada
});


// VERIFICAR ESTADO DE AUTENTICACIÓN
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        showUserSection(username);
    } else {
        showLoginButton();
    }
}

function showUserSection(username) {
    document.getElementById('showLoginBtn').classList.add('hidden');
    document.getElementById('userSection').classList.add('active');
    document.getElementById('usernameDisplay').textContent = username;
}

function showLoginButton() {
    document.getElementById('showLoginBtn').classList.remove('hidden');
    document.getElementById('userSection').classList.remove('active');
}


// VERIFICAR ESTADO DEL BLOQUEO DE CUENTA
async function checkAccountStatus() {
    const email = localStorage.getItem('lastLoginAttempt');
    
    if (!email) return;
    
    try {
        const response = await fetch(`${API_URL}/auth/check-block-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.isBlocked) {
            // Mostrar mensaje de cuenta bloqueada
            Swal.fire({
                icon: 'warning',
                title: 'Cuenta Bloqueada',
                html: `Tu cuenta está bloqueada.<br>Tiempo restante: <strong>${data.remainingTime}</strong>`,
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error al verificar estado de bloqueo:', error);
    }
}

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    // Botones de mostrar modales
    document.getElementById('showLoginBtn').addEventListener('click', showLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);

    // Validación en tiempo real para registro
    document.getElementById('regPassword').addEventListener('input', checkPasswordStrength);
    document.getElementById('regPasswordConfirm').addEventListener('input', validatePasswordMatch);
    document.getElementById('regEmail').addEventListener('blur', validateEmail);
    document.getElementById('regUsername').addEventListener('blur', validateUsername);
    document.getElementById('regPhone').addEventListener('blur', validatePhone);
}


// MOSTRAR/OCULTAR MODALES
function showLogin() {
    closeAuthModal();
    document.getElementById('loginModal').classList.add('active');
    loadCaptcha();
}

function showRegister() {
    closeAuthModal();
    document.getElementById('registerModal').classList.add('active');
}

function showForgotPassword() {
    closeAuthModal();
    document.getElementById('forgotPasswordModal').classList.add('active');
}

function closeAuthModal() {
    document.querySelectorAll('.auth-container').forEach(modal => {
        modal.classList.remove('active');
    });
}

// CARGAR CAPTCHA
async function loadCaptcha() {
    try {
        const response = await fetch(`${API_URL}/auth/captcha`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('captchaImage').src = data.captchaImage;
            captchaToken = data.captchaToken;
        }
    } catch (error) {
        console.error('Error al cargar CAPTCHA:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el CAPTCHA. Intenta de nuevo.'
        });
    }
}

// MANEJO DE LOGIN
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.auth-button');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const captcha = document.getElementById('captchaInput').value;
    
    // Guardar el email para verificar bloqueos
    localStorage.setItem('lastLoginAttempt', email);
    
    // Verificar si la cuenta está bloqueada ANTES de intentar login
    try {
        const blockCheckResponse = await fetch(`${API_URL}/auth/check-block-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const blockData = await blockCheckResponse.json();
        
        if (blockData.isBlocked) {
            Swal.fire({
                icon: 'error',
                title: 'Cuenta Bloqueada',
                html: `Tu cuenta ha sido bloqueada por múltiples intentos fallidos.<br>Intenta nuevamente en <strong>${blockData.remainingTime}</strong>`,
            });
            loadCaptcha();
            document.getElementById('captchaInput').value = '';
            return;
        }
    } catch (error) {
        console.error('Error al verificar bloqueo:', error);
    }
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';
    
    const formData = {
        email: email,
        password: password,
        captcha: captcha,
        captchaToken: captchaToken
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Guardar token y usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', data.user.username);
            localStorage.removeItem('lastLoginAttempt'); // Limpiar intento fallido
            
            // Cerrar modal
            closeAuthModal();
            
            // Actualizar UI
            showUserSection(data.user.username);
            
            // Mostrar mensaje de bienvenida
            Swal.fire({
                icon: 'success',
                title: `¡Bienvenido ${data.user.username}!`,
                text: 'Has iniciado sesión correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Limpiar formulario
            form.reset();
        } else {
            // Manejar errores específicos
            if (data.blocked) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cuenta Bloqueada',
                    html: `Tu cuenta ha sido bloqueada por múltiples intentos fallidos.<br>Intenta nuevamente en <strong>${data.remainingTime}</strong>`,
                });
            } else if (data.attemptsLeft !== undefined) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Credenciales Incorrectas',
                    html: `${data.message}<br>Te quedan <strong>${data.attemptsLeft}</strong> intento(s)`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Error al iniciar sesión'
                });
            }
            
            // Recargar CAPTCHA
            loadCaptcha();
            document.getElementById('captchaInput').value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el servidor. Intenta de nuevo.'
        });
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
}

// MANEJO DE REGISTRO
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.auth-button');
    
    // Validar contraseñas coincidan
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas no coinciden'
        });
        return;
    }

    // Validar fortaleza de contraseña
    if (!isPasswordStrong(password)) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña Débil',
            text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
        });
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    
    const formData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        username: document.getElementById('regUsername').value,
        phone: document.getElementById('regPhone').value,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            closeAuthModal();
            
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
                confirmButtonText: 'Iniciar Sesión'
            }).then((result) => {
                if (result.isConfirmed) {
                    showLogin();
                }
            });
            
            form.reset();
            document.getElementById('passwordStrength').className = 'password-strength';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Error al registrar usuario'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el servidor. Intenta de nuevo.'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrarse';
    }
}


// RECUPERAR CONTRASEÑA
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.auth-button');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    const email = document.getElementById('forgotEmail').value;

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            closeAuthModal();
            
            Swal.fire({
                icon: 'success',
                title: 'Email Enviado',
                text: 'Revisa tu correo para restablecer tu contraseña.',
            });
            
            form.reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Error al enviar el correo'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el servidor. Intenta de nuevo.'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Instrucciones';
    }
}

// CERRAR SESIÓN
function logout() {
    Swal.fire({
        title: '¿Cerrar Sesión?',
        text: '¿Estás seguro que deseas salir?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('lastLoginAttempt');
            
            showLoginButton();
            
            Swal.fire({
                icon: 'success',
                title: 'Sesión Cerrada',
                text: 'Has cerrado sesión correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// VALIDACIONES EN TIEMPO REAL
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthBar.className = 'password-strength';
        return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    
    if (strength === 1) {
        strengthBar.className = 'password-strength weak';
    } else if (strength === 2) {
        strengthBar.className = 'password-strength medium';
    } else if (strength === 3) {
        strengthBar.className = 'password-strength strong';
    }
}

function isPasswordStrong(password) {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /\d/.test(password);
}

function validatePasswordMatch() {
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const errorMsg = document.getElementById('regPasswordConfirmError');
    const input = document.getElementById('regPasswordConfirm');
    
    if (passwordConfirm && password !== passwordConfirm) {
        errorMsg.textContent = 'Las contraseñas no coinciden';
        errorMsg.classList.add('active');
        input.classList.add('error');
        input.classList.remove('success');
    } else if (passwordConfirm && password === passwordConfirm) {
        errorMsg.classList.remove('active');
        input.classList.remove('error');
        input.classList.add('success');
    } else {
        errorMsg.classList.remove('active');
        input.classList.remove('error', 'success');
    }
}

function validateEmail() {
    const email = document.getElementById('regEmail').value;
    const errorMsg = document.getElementById('regEmailError');
    const input = document.getElementById('regEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        errorMsg.textContent = 'Email inválido';
        errorMsg.classList.add('active');
        input.classList.add('error');
        input.classList.remove('success');
    } else if (email) {
        errorMsg.classList.remove('active');
        input.classList.remove('error');
        input.classList.add('success');
    } else {
        errorMsg.classList.remove('active');
        input.classList.remove('error', 'success');
    }
}

function validateUsername() {
    const username = document.getElementById('regUsername').value;
    const errorMsg = document.getElementById('regUsernameError');
    const input = document.getElementById('regUsername');
    
    if (username && username.length < 3) {
        errorMsg.textContent = 'El usuario debe tener al menos 3 caracteres';
        errorMsg.classList.add('active');
        input.classList.add('error');
        input.classList.remove('success');
    } else if (username) {
        errorMsg.classList.remove('active');
        input.classList.remove('error');
        input.classList.add('success');
    } else {
        errorMsg.classList.remove('active');
        input.classList.remove('error', 'success');
    }
}

function validatePhone() {
    const phone = document.getElementById('regPhone').value;
    const errorMsg = document.getElementById('regPhoneError');
    const input = document.getElementById('regPhone');
    const phoneRegex = /^\d{10}$/;
    
    if (phone && !phoneRegex.test(phone)) {
        errorMsg.textContent = 'El teléfono debe tener 10 dígitos';
        errorMsg.classList.add('active');
        input.classList.add('error');
        input.classList.remove('success');
    } else if (phone) {
        errorMsg.classList.remove('active');
        input.classList.remove('error');
        input.classList.add('success');
    } else {
        errorMsg.classList.remove('active');
        input.classList.remove('error', 'success');
    }
}

// PROTECCIÓN DE RUTAS - Agregar a carrito
/*function agregarAlCarrito(producto) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Inicia Sesión',
            text: 'Debes iniciar sesión para agregar productos al carrito',
            confirmButtonText: 'Iniciar Sesión',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                showLogin();
            }
        });
        return false;
    }
    
    // Aquí va tu lógica para agregar al carrito
    return true;
}

// FUNCIÓN PARA VERIFICAR SI ESTÁ AUTENTICADO
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// FUNCIÓN PARA OBTENER EL TOKEN
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// FUNCIÓN PARA HACER PETICIONES AUTENTICADAS
async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión Expirada',
            text: 'Por favor inicia sesión nuevamente',
        }).then(() => {
            showLogin();
        });
        return null;
    }
    
    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const response = await fetch(url, authOptions);
        
        if (response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            showLoginButton();
            
            Swal.fire({
                icon: 'warning',
                title: 'Sesión Expirada',
                text: 'Por favor inicia sesión nuevamente',
            }).then(() => {
                showLogin();
            });
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Error en petición autenticada:', error);
        throw error;
    }
}*/