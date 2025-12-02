// ============================================
//            PREGUNTAS FRECUENTES 
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Seleccionar todos los botones de preguntas
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Obtener el item padre
            const faqItem = this.parentElement;
            
            // Toggle active class
            faqItem.classList.toggle('active');
            
            // Opcional: Cerrar otros items cuando se abre uno nuevo
            // Descomenta las siguientes líneas si quieres este comportamiento
            /*
            faqQuestions.forEach(otherQuestion => {
                const otherItem = otherQuestion.parentElement;
                if (otherItem !== faqItem && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            */
        });
    });
    
    // Animación de scroll suave para los botones de contacto
    const contactButtons = document.querySelectorAll('.contact-buttons a');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Si el enlace es a una sección de la misma página
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Agregar animación de entrada a las preguntas
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar todos los items FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        observer.observe(item);
    });
});