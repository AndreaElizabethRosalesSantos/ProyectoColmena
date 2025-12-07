document.addEventListener('DOMContentLoaded', function() {
    const imageSlides = document.querySelectorAll('.slide');
    const textSlides = document.querySelectorAll('.text-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    let currentSlide = 0;
    let slideInterval;

    // Función para cambiar slide
    function changeSlide(index) {
        // Quitar clases activas
        imageSlides.forEach(slide => {
            slide.classList.remove('slide-active');
        });
        
        textSlides.forEach(slide => {
            slide.classList.remove('text-active');
        });
        
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Añadir clases activas
        imageSlides[index].classList.add('slide-active');
        textSlides[index].classList.add('text-active');
        indicators[index].classList.add('active');
        
        currentSlide = index;
    }

    // Función para siguiente slide
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % imageSlides.length;
        changeSlide(nextIndex);
    }

    // Función para slide anterior
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + imageSlides.length) % imageSlides.length;
        changeSlide(prevIndex);
    }

    // Event listeners para controles
    nextBtn.addEventListener('click', function() {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', function() {
        prevSlide();
        resetInterval();
    });

    // Event listeners para indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            changeSlide(index);
            resetInterval();
        });
    });

    // Auto deslizamiento
    function startInterval() {
        slideInterval = setInterval(nextSlide, 6000);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    // Inicializar
    changeSlide(0);
    startInterval();

    // Pausar al pasar el ratón
    const carousel = document.querySelector('.hero-carousel');
    carousel.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        startInterval();
    });
});