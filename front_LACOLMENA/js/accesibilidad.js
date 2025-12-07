// ========================
// ELEMENTOS
// ========================
const panel = document.getElementById("accessibilityPanel");
const openBtn = document.getElementById("openPanel");
const closeBtn = document.getElementById("closePanel");

const btnLight = document.getElementById("lightMode");
const btnDark = document.getElementById("darkMode");

const slider = document.getElementById("textSlider");
const textPercent = document.getElementById("textPercent");

const btnNormal = document.getElementById("sizeNormal");
const btnMedio = document.getElementById("sizeSmall");
const btnGrande = document.getElementById("sizeGrande");

const pixelSize = document.getElementById("pixelSize");

const resetBtn = document.getElementById("resetAll");

// ========================
// PANEL LATERAL
// ========================
openBtn.onclick = () => {
    panel.classList.add("open");
};

closeBtn.onclick = () => {
    panel.classList.remove("open");
};

// Cerrar al hacer clic fuera del panel
document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && 
        !panel.contains(e.target) && 
        e.target !== openBtn) {
        panel.classList.remove("open");
    }
});

// ========================
// MODO CLARO / OSCURO
// ========================
function applyTheme(theme) {
    document.body.classList.remove("dark-mode");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }

    localStorage.setItem("theme", theme);
    
    // Actualizar botones activos
    btnLight.classList.remove("active");
    btnDark.classList.remove("active");
    
    if (theme === "dark") {
        btnDark.classList.add("active");
    } else {
        btnLight.classList.add("active");
    }
}

btnLight.onclick = () => {
    applyTheme("light");
};

btnDark.onclick = () => {
    applyTheme("dark");
};

// ========================
// TAMAÑO DE TEXTO CON SLIDER
// ========================
function applyFontSize(value) {
    // Cambiar el tamaño base del HTML
    const baseSize = (value / 100) * 16; // 16px es el tamaño base
    document.documentElement.style.fontSize = baseSize + "px";
    
    textPercent.textContent = value + "%";
    pixelSize.textContent = baseSize.toFixed(1) + "px";
    slider.value = value;
    
    localStorage.setItem("fontSizeValue", value);
    
    // Actualizar botones activos según el valor
    btnMedio.classList.remove("active");
    btnNormal.classList.remove("active");
    btnGrande.classList.remove("active");
    
    if (value == 80) btnMedio.classList.add("active");
    else if (value == 100) btnNormal.classList.add("active");
    else if (value == 140) btnGrande.classList.add("active");
}

// Slider en tiempo real
slider.oninput = () => {
    applyFontSize(slider.value);
};

// Botones de acceso rápido
btnMedio.onclick = () => {
    applyFontSize(80);
};

btnNormal.onclick = () => {
    applyFontSize(100);
};

btnGrande.onclick = () => {
    applyFontSize(140);
};

// ========================
// RESTAURAR TODO
// ========================
resetBtn.onclick = () => {
    applyTheme("light");
    applyFontSize(100);
    panel.classList.remove("open");
};

// ========================
// CARGAR PREFERENCIAS
// ========================
window.onload = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedSize = localStorage.getItem("fontSizeValue") || 100;

    applyTheme(savedTheme);
    applyFontSize(savedSize);
};