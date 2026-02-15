// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Change icon
            if (navMenu.classList.contains('active')) {
                mobileMenuToggle.textContent = '✕';
            } else {
                mobileMenuToggle.textContent = '☰';
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
            }
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for links that are just "#"
        if (href === '#') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation and handling
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        const emailInput = this.querySelector('input[type="email"]');
        
        if (emailInput && !emailInput.value) {
            e.preventDefault();
            alert('Please enter your email address.');
            return false;
        }
        
        // If using a simple mailto action, customize the message
        if (this.action.includes('mailto:')) {
            e.preventDefault();
            const email = emailInput.value;
            window.location.href = this.action + '&body=I would like to subscribe to your mailing list. My email is: ' + email;
        }
        
        // For Mailchimp or other services, the form will submit normally
    });
});

// Add fade-in animation for elements as they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections that should fade in
document.querySelectorAll('.feature-card, .blog-post, .contact-card, .info-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add active state to current page in navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    
    // Remove any existing active classes first
    link.classList.remove('active');
    
    // Add active class to current page
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === '/' && linkPage === 'index.html')) {
        link.classList.add('active');
    }
});