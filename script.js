/* 
   =========================================
   EEE Department - script.js
   Premium Academic Interactivity System
   ========================================= 
*/

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Header Effect
    const headerWrapper = document.querySelector('.univ-header-wrapper');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            headerWrapper?.classList.add('scrolled');
        } else {
            headerWrapper?.classList.remove('scrolled');
        }
    });

    // 2. Statistics Counter Animation
    const statsElements = document.querySelectorAll('.stat-number, .count');

    const animateCounter = (el) => {
        const text = el.innerText;
        const target = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        let current = 0;
        const duration = 2000;
        const stepTime = 16;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.innerText = target + suffix;
                clearInterval(timer);
            } else {
                el.innerText = Math.floor(current) + suffix;
            }
        }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsElements.forEach(stat => statsObserver.observe(stat));

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll(
        '.program-flip-card, .lab-item-card, .alumni-card, .collab-card, .outreach-item, .section-title, .about-content'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.classList.add('reveal-init');
        revealObserver.observe(el);
    });

    // Inject Reveal CSS
    const revealStyle = document.createElement('style');
    revealStyle.innerHTML = `
        .reveal-init {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .reveal-active {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        .univ-header-wrapper.scrolled {
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            background: rgba(255, 255, 255, 0.98);
        }
    `;
    document.head.appendChild(revealStyle);

    // 4. Smooth Anchor Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Multi-Step Admission Form Logic
    const admissionForm = document.getElementById('admissionForm');
    if (admissionForm) {
        let currentStep = 1;
        const totalSteps = 3;
        const progressFill = document.getElementById('progressBar');
        const stepNodes = document.querySelectorAll('.step-node');
        const submitBtn = document.getElementById('submitBtn');

        const updateFormSteps = () => {
            document.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
                if (parseInt(step.dataset.step) === currentStep) {
                    step.classList.add('active');
                }
            });

            const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
            if (progressFill) progressFill.style.width = `${progress}%`;

            stepNodes.forEach((node, idx) => {
                const nodeStep = idx + 1;
                node.classList.remove('active', 'completed');
                if (nodeStep < currentStep) {
                    node.classList.add('completed');
                    node.innerHTML = '<i class="fa-solid fa-check"></i>';
                } else if (nodeStep === currentStep) {
                    node.classList.add('active');
                    node.innerHTML = nodeStep;
                } else {
                    node.innerHTML = nodeStep;
                }
            });

            if (submitBtn) {
                submitBtn.disabled = currentStep !== totalSteps;
            }
        };

        updateFormSteps();

        admissionForm.addEventListener('click', (e) => {
            const nextBtn = e.target.closest('.btn-next');
            const prevBtn = e.target.closest('.btn-prev');

            if (nextBtn) {
                e.preventDefault();
                const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                const inputs = currentStepEl.querySelectorAll('[required]');
                let isValid = true;
                let firstInvalidInput = null;

                inputs.forEach(input => {
                    input.setCustomValidity('');
                    if (!input.value.trim()) {
                        isValid = false;
                        if (!firstInvalidInput) firstInvalidInput = input;
                        input.setCustomValidity('This field is required');
                    } else if (input.type === 'email') {
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailPattern.test(input.value)) {
                            isValid = false;
                            if (!firstInvalidInput) firstInvalidInput = input;
                            input.setCustomValidity('Please enter a valid email address');
                        }
                    } else if (input.type === 'tel') {
                        const phonePattern = /^[0-9]{10}$/;
                        if (!phonePattern.test(input.value.replace(/\s/g, ''))) {
                            isValid = false;
                            if (!firstInvalidInput) firstInvalidInput = input;
                            input.setCustomValidity('Please enter a valid 10-digit phone number');
                        }
                    }
                });

                if (!isValid && firstInvalidInput) {
                    firstInvalidInput.reportValidity();
                    firstInvalidInput.focus();
                } else if (isValid && currentStep < totalSteps) {
                    currentStep++;
                    updateFormSteps();
                }
            } else if (prevBtn) {
                if (currentStep > 1) {
                    currentStep--;
                    updateFormSteps();
                }
            }
        });

        // Submission Logic (Uses centralized email.js)
        admissionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Create/find a status element for feedback
            let statusDiv = document.getElementById('formStatus');
            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'formStatus';
                admissionForm.appendChild(statusDiv);
            }

            // Call the global handler from email.js
            if (typeof window.handleAdmissionSubmission === 'function') {
                window.handleAdmissionSubmission(admissionForm, statusDiv, submitBtn);
            } else {
                console.error('Submission handler not found!');
                alert('An error occurred. Please try again or contact us via WhatsApp.');
            }
        });
    }

    // 6. Alumni Track Infinite Loop Setup
    const alumniTrack = document.querySelector('.alumni-track');
    if (alumniTrack) {
        const setupMarquee = () => {
            if (alumniTrack.querySelectorAll('.clone').length === 0) {
                const cards = Array.from(alumniTrack.children);
                cards.forEach(card => {
                    const clone = card.cloneNode(true);
                    clone.classList.add('clone');
                    alumniTrack.appendChild(clone);
                });
            }
        };
        setupMarquee();
    }

    // 7. Vision & Mission Flip Cards — Touch / Tap Support for Mobile
    const vmFlipCards = document.querySelectorAll('.vm-flip-card');
    vmFlipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
});

function resetForm() {
    window.location.reload();
}
