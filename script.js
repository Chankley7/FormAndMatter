const images = document.querySelectorAll('.grid-item img');
const overlay = document.getElementById('overlay');
let currentImageIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let isAnimating = false;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupIntersectionObserver();
    preloadNearbyImages();
});

function setupEventListeners() {
    // Updated JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const menuItems = document.querySelectorAll('.dropdown-menu a');

    // Toggle Menu
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
    });

    // Close Menu on Item Click
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            dropdownMenu.classList.remove('active');
        });
    });

    // Close Menu on Outside Click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav')) {
            hamburger.classList.remove('active');
            dropdownMenu.classList.remove('active');
        }
    });

    // Close Menu on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            dropdownMenu.classList.remove('active');
        }
    });
});

    // Existing gallery/lightbox code
    const images = document.querySelectorAll('.grid-item img');
    const overlay = document.getElementById('overlay');

    // Set up click events for all gallery images
    images.forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(img, index);
        });
    });

    // Close lightbox when clicking on the overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle resize events for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        if (document.querySelector('.lightbox.active')) {
            adjustLightboxSize();
        }
        
        // Refresh AOS on window resize
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }, 250));

    // Prevent CLS by ensuring all images are loaded properly
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
}

function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.hasAttribute('data-src')) {
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });
        
        // Apply to images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
}

function preloadNearbyImages() {
    // Preload the first few visible images for faster initial display
    const visibleImages = Array.from(images).slice(0, 6);
    visibleImages.forEach(img => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = img.src;
        document.head.appendChild(preloadLink);
    });
}

function closeLightbox() {
    if (isAnimating) return;
    
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        isAnimating = true;
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
        
        // Add a small delay to ensure smooth transitions
        setTimeout(() => {
            lightbox.remove();
            isAnimating = false;
        }, 500);
    }
    overlay.classList.remove('active');
}

function openLightbox(img, index) {
    if (isAnimating) return;
    
    isAnimating = true;
    currentImageIndex = index;
    const gridItem = img.closest('.grid-item');
    const src = img.src;
    const title = gridItem.querySelector('h3').textContent;
    const description = gridItem.querySelector('.description').textContent;
    
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    const content = document.createElement('div');
    content.className = 'lightbox-content';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'lightbox-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close lightbox');
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });
    content.appendChild(closeButton);
    
    // Image container with navigation arrows
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    
    // Left arrow
    const leftArrow = document.createElement('button');
    leftArrow.className = 'lightbox-arrow left-arrow';
    leftArrow.innerHTML = '&#10094;';
    leftArrow.setAttribute('aria-label', 'Previous image');
    leftArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImages(-1);
    });
    imageContainer.appendChild(leftArrow);
    
    // Create and add the image
    const enlargedImg = document.createElement('img');
    enlargedImg.src = src;
    enlargedImg.alt = title;
    enlargedImg.className = 'lightbox-image';
    
    // Add loading animation
    enlargedImg.style.opacity = '0';
    enlargedImg.onload = function() {
        setTimeout(() => {
            enlargedImg.style.opacity = '1';
            isAnimating = false;
        }, 100);
    };
    
    imageContainer.appendChild(enlargedImg);
    
    // Right arrow
    const rightArrow = document.createElement('button');
    rightArrow.className = 'lightbox-arrow right-arrow';
    rightArrow.innerHTML = '&#10095;';
    rightArrow.setAttribute('aria-label', 'Next image');
    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImages(1);
    });
    imageContainer.appendChild(rightArrow);
    
    content.appendChild(imageContainer);
    
    // Image counter
    const counter = document.createElement('div');
    counter.className = 'image-counter';
    counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    imageContainer.appendChild(counter);
    
    // Image details
    const details = document.createElement('div');
    details.className = 'lightbox-details';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    details.appendChild(h3);
    
    const p = document.createElement('p');
    p.className = 'description';
    p.textContent = description;
    details.appendChild(p);
    
    content.appendChild(details);
    lightbox.appendChild(content);
    
    // Add to DOM
    document.body.appendChild(lightbox);
    document.body.classList.add('no-scroll');
    
    // Setup touch events for mobile swiping
    content.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    content.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Animate the lightbox appearance
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
        overlay.classList.add('active');
    });
}

function handleSwipe() {
    if (isAnimating) return;
    
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped left - next image
        navigateImages(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped right - previous image
        navigateImages(-1);
    }
}

function navigateImages(direction) {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // Calculate the new index with wrapping
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) {
        newIndex = images.length - 1;
    } else if (newIndex >= images.length) {
        newIndex = 0;
    }
    
    // Get the lightbox and image
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const counter = document.querySelector('.image-counter');
    const details = document.querySelector('.lightbox-details');
    
    if (lightbox && lightboxImage) {
        // Get the next image info
        const nextGridItem = images[newIndex].closest('.grid-item');
        const nextSrc = images[newIndex].src;
        const nextTitle = nextGridItem.querySelector('h3').textContent;
        const nextDescription = nextGridItem.querySelector('.description').textContent;
        
        // Fade out current image
        lightboxImage.style.opacity = '0';
        details.style.opacity = '0';
        
        // Update counter immediately
        counter.textContent = `${newIndex + 1} / ${images.length}`;
        
        // After fade out, update image and fade in
        setTimeout(() => {
            lightboxImage.src = nextSrc;
            lightboxImage.alt = nextTitle;
            
            // Update details
            details.querySelector('h3').textContent = nextTitle;
            details.querySelector('.description').textContent = nextDescription;
            
            // Preload the next image in sequence for smoother navigation
            const nextNextIndex = (newIndex + direction + images.length) % images.length;
            preloadImage(images[nextNextIndex].src);
            
            // Fade in new content
            setTimeout(() => {
                lightboxImage.style.opacity = '1';
                details.style.opacity = '1';
                isAnimating = false;
            }, 50);
            
            // Update current index
            currentImageIndex = newIndex;
        }, 300);
    }
}

function adjustLightboxSize() {
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxImage = document.querySelector('.lightbox-image');
    
    if (lightboxContent && lightboxImage) {
        // Adjust based on viewport size
        if (window.innerWidth < 600) {
            lightboxContent.style.maxWidth = '95%';
            lightboxImage.style.maxHeight = '50vh';
        } else if (window.innerWidth < 900) {
            lightboxContent.style.maxWidth = '90%';
            lightboxImage.style.maxHeight = '60vh';
        } else {
            lightboxContent.style.maxWidth = '85%';
            lightboxImage.style.maxHeight = '70vh';
        }
    }
}

function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

// Utility function for debouncing resize events
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize AOS animations
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true, // Changed from false
            mirror: false, // Ensure this is false
            anchorPlacement: 'top-bottom',
            disableMutationObserver: true, // Add this
            disable: window.innerWidth < 768 ? 'phone' : false
        });
        
        // Fix for footer scrolling issue
        const footer = document.querySelector('footer');
        if (footer) {
            footer.setAttribute('data-aos-offset', '0');
            footer.setAttribute('data-aos-delay', '0');
        }
    }
    
    // Prevent scroll position adjustment from AOS
    // window.addEventListener('scroll', function() {
    //     clearTimeout(window.scrollEndTimer);
    //     window.scrollEndTimer = setTimeout(function() {
    //         // Make sure we don't jump back up when reaching the bottom
    //         if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 10) {
    //             window.scrollTo(0, document.body.scrollHeight);
    //         }
    //     }, 100);
    // }, { passive: true });
});