async function includeHTML() {
    const components = [
        { id: 'navbar-placeholder', file: 'components/navbar.html' },
        { id: 'footer-placeholder', file: 'components/footer.html' }
    ];

    // Map of loaded status for each component
    const loadPromises = components.map(async (comp) => {
        const placeholder = document.getElementById(comp.id);
        if (placeholder) {
            try {
                const response = await fetch(comp.file);
                if (response.ok) {
                    const content = await response.text();
                    placeholder.innerHTML = content;
                    // Trigger reflow for transition
                    void placeholder.offsetWidth;
                    placeholder.classList.add('loaded');
                    return true;
                }
            } catch (err) {
                console.error(`Error loading ${comp.file}:`, err);
            }
        }
        return false;
    });

    await Promise.all(loadPromises);

    // Re-initialize active states and observers
    updateActiveNavLink();
    initRevealObserver();
    // Force activate elements already in viewport on load
document.querySelectorAll('.reveal-up').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
        el.classList.add('active');
    }
});
}

// Global Event Delegation for Dynamic Elements (Like Navbar)
function initGlobalEvents() {
    // Handle Album Modal Opening
    document.addEventListener('click', (e) => {
        const albumLink = e.target.closest('#album-nav-link');
        const closeModalBtn = e.target.closest('#close-modal');
        const albumModal = document.getElementById('album-modal');
        const albumContent = document.getElementById('album-modal-content');

        if (albumLink) {
            e.preventDefault();
            if (albumModal) {
                albumModal.classList.remove('hidden');
                setTimeout(() => {
                    albumModal.classList.add('opacity-100');
                    if (albumContent) albumContent.classList.add('scale-100');
                }, 10);
                document.body.style.overflow = 'hidden';
            }
        }

        if (closeModalBtn || (albumModal && e.target === albumModal)) {
            if (albumModal) {
                albumModal.classList.remove('opacity-100');
                if (albumContent) albumContent.classList.remove('scale-100');
                setTimeout(() => {
                    albumModal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        }
    });

    // Handle ESC key for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const albumModal = document.getElementById('album-modal');
            if (albumModal && !albumModal.classList.contains('hidden')) {
                albumModal.classList.remove('opacity-100');
                setTimeout(() => {
                    albumModal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        }
    });
}

function updateActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('text-brand-red');
            link.classList.remove('hover:text-brand-red');
        }
    });
}

function initRevealObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up:not(.active)').forEach((el) => {
        observer.observe(el);
    });
}

// Initialize delegation immediately
initGlobalEvents();

// Start loading HTML
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includeHTML);
} else {
    includeHTML();
}
