document.addEventListener('DOMContentLoaded', () => {
    // --- Auto-Play Only Alumni Carousel ---
    const alumniTrack = document.querySelector('.alumni-track');
    const alumniWrapper = document.querySelector('.alumni-carousel-wrapper');

    if (alumniTrack && alumniWrapper) {
        let originalCards = Array.from(alumniTrack.children);
        const cardCount = originalCards.length;
        let currentIndex = 0;
        let isTransitioning = false;
        let autoPlayTimer;

        // Configuration based on screen size
        const getVisibleCardsCount = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1200) return 2;
            return 3;
        };

        // Initialize Carousel
        const initCarousel = () => {
            const visibleCount = getVisibleCardsCount();
            alumniTrack.innerHTML = '';

            // Clone sets for infinite scrolling
            const endClones = originalCards.slice(0, visibleCount).map(c => c.cloneNode(true));
            const startClones = originalCards.slice(-visibleCount).map(c => c.cloneNode(true));

            startClones.forEach(c => alumniTrack.appendChild(c));
            originalCards.forEach(c => alumniTrack.appendChild(c));
            endClones.forEach(c => alumniTrack.appendChild(c));

            currentIndex = visibleCount;
            updatePosition(false);
            startAutoPlay();
        };

        const updatePosition = (animate = true) => {
            const cardWidth = alumniTrack.children[0].offsetWidth;
            const gap = 32; // match CSS gap (2rem = 32px usually)
            const offset = currentIndex * (cardWidth + gap);

            alumniTrack.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
            alumniTrack.style.transform = `translateX(-${offset}px)`;
        };

        const moveSlide = (step) => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex += step;
            updatePosition();

            alumniTrack.addEventListener('transitionend', function handleEnd() {
                isTransitioning = false;
                const visibleCount = getVisibleCardsCount();

                // Infinite Loop Check
                if (currentIndex >= cardCount + visibleCount) {
                    currentIndex = visibleCount;
                    updatePosition(false);
                } else if (currentIndex < visibleCount) {
                    currentIndex = cardCount + visibleCount - 1;
                    updatePosition(false);
                }
                alumniTrack.removeEventListener('transitionend', handleEnd);
            });
        };

        const startAutoPlay = () => {
            stopAutoPlay();
            // Auto-play every 3.5 seconds
            autoPlayTimer = setInterval(() => moveSlide(1), 3500);
        };

        const stopAutoPlay = () => clearInterval(autoPlayTimer);

        // Responsive Resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initCarousel, 250);
        });

        // First Load
        initCarousel();
    }
});
