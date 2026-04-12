/**
 * include.js
 * Handles loading of shared HTML components and global script logic.
 */

async function includeHTML() {
    const components = [
        { id: 'navbar-placeholder', file: 'components/navbar.html' },
        { id: 'footer-placeholder', file: 'components/footer.html' },
        { id: 'modal-placeholder', file: 'components/album-modal.html' }
    ];

    // Show the body gracefully
    document.body.classList.add('page-loaded');

    await Promise.all(components.map(async (comp) => {
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
                }
            } catch (err) {
                console.error(`Error loading ${comp.file}:`, err);
            }
        }
    }));

    // After loading components, initialize global functionalities
    initNavbar();
    initAlbumModal();
    initRevealObserver();
}

function initNavbar() {
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

function initAlbumModal() {
    const albumNavLink = document.getElementById('album-nav-link');
    const albumModal = document.getElementById('album-modal');
    const albumContent = document.getElementById('album-modal-content');
    const closeModal = document.getElementById('close-modal');

    if (albumNavLink && albumModal) {
        const openAction = (e) => {
            e.preventDefault();
            albumModal.classList.remove('hidden');
            setTimeout(() => {
                albumModal.classList.add('flex', 'opacity-100');
                albumContent?.classList.add('scale-100');
            }, 10);
            document.body.style.overflow = 'hidden';
        };

        const closeAction = () => {
            albumModal.classList.remove('opacity-100');
            albumContent?.classList.remove('scale-100');
            setTimeout(() => {
                albumModal.classList.add('hidden');
                albumModal.classList.remove('flex');
            }, 400);
            document.body.style.overflow = 'auto';
        };

        albumNavLink.addEventListener('click', openAction);
        if (closeModal) closeModal.addEventListener('click', closeAction);

        albumModal.addEventListener('click', (e) => {
            if (e.target === albumModal) closeAction();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !albumModal.classList.contains('hidden')) closeAction();
        });
    }
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

// Start the inclusion process when DOM is ready
document.addEventListener('DOMContentLoaded', includeHTML);
