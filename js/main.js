// Initialize Lucide Icons
lucide.createIcons();
// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  const isOpen = mobileMenu.classList.contains('active');
  // Toggle icon between menu and x
  if (isOpen) {
    menuIcon.setAttribute('data-lucide', 'x');
  } else {
    menuIcon.setAttribute('data-lucide', 'menu');
  }
  lucide.createIcons();
});
// Smooth Scrolling with Offset
const navLinks = document.querySelectorAll('.nav-link-scroll');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Close mobile menu if open
    mobileMenu.classList.remove('active');
    menuIcon.setAttribute('data-lucide', 'menu');
    lucide.createIcons();
  });
});
// Simple Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate__animated', 'animate__fadeInUp');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});