/* =========================================================
   Future Link Technologies — Interactions
   ========================================================= */

/* =========================================================
   BACKEND API CONFIGURATION (Google Apps Script)
   ---------------------------------------------------------
   Paste your deployed Google Apps Script Web App URL below.
   Full deployment steps are in SETUP.md.
   Until this is set, the contact form runs in local-only
   "demo mode" (validates in the browser, shows a success
   message, but sends nothing anywhere).
   ========================================================= */
const API_URL = "https://script.google.com/macros/s/AKfycbxjV2qzHDOK2PiNgVTFvFgH1h6AspHvPmKWo0PS_XTvWg4ssn520hABubTG7LPLR0w/exec";

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navbar.classList.toggle('menu-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navbar.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Active navigation on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const setActiveLink = () => {
    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(link => {
      const targetId = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', targetId === currentId);
    });
  };

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Scroll to top ---------- */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const fields = {
      name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
      email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
      phone: { el: document.getElementById('phone'), error: document.getElementById('phoneError') },
      service: { el: document.getElementById('service'), error: document.getElementById('serviceError') },
      message: { el: document.getElementById('message'), error: document.getElementById('messageError') }
    };
    const successEl = document.getElementById('formSuccess');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\-\s()]{7,20}$/;

    const setError = (field, message) => {
      field.el.classList.toggle('invalid', Boolean(message));
      field.error.textContent = message || '';
    };

    const validateField = (key) => {
      const field = fields[key];
      const value = field.el.value.trim();

      switch (key) {
        case 'name':
          if (!value) return setError(field, 'Please enter your name.'), false;
          break;
        case 'email':
          if (!value) return setError(field, 'Please enter your email.'), false;
          if (!emailPattern.test(value)) return setError(field, 'Please enter a valid email address.'), false;
          break;
        case 'phone':
          if (value && !phonePattern.test(value)) return setError(field, 'Please enter a valid phone number.'), false;
          break;
        case 'service':
          if (!value) return setError(field, 'Please select a service.'), false;
          break;
        case 'message':
          if (!value) return setError(field, 'Please add a short message.'), false;
          if (value.length < 10) return setError(field, 'Message should be at least 10 characters.'), false;
          break;
      }
      setError(field, '');
      return true;
    };

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      field.el.addEventListener('blur', () => validateField(key));
      field.el.addEventListener('input', () => {
        if (field.el.classList.contains('invalid')) validateField(key);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const results = Object.keys(fields).map(validateField);
      const isValid = results.every(Boolean);

      if (isValid) {
        const payload = {
          name: fields.name.el.value.trim(),
          email: fields.email.el.value.trim(),
          phone: fields.phone.el.value.trim(),
          service: fields.service.el.value.trim(),
          message: fields.message.el.value.trim(),
          page: window.location.href
        };
        submitToBackend(payload, form, successEl);
      } else {
        successEl.textContent = '';
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  /* ---------- Send contact form data to the backend ---------- */
  async function submitToBackend(payload, formEl, successEl) {
    const isConfigured = API_URL && !API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL');
    const submitBtn = formEl.querySelector('.form-submit');

    // Demo mode: no backend connected yet — keep the original behaviour.
    if (!isConfigured) {
      successEl.textContent = "Thanks! Your message looks good — connect this form to a backend or email service to actually deliver it.";
      formEl.reset();
      return;
    }

    successEl.textContent = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
    }

    try {
      // text/plain avoids a CORS preflight, which Apps Script Web Apps don't handle.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data && data.status === 'success') {
        successEl.textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
        formEl.reset();
      } else {
        successEl.textContent = (data && data.message) || 'Something went wrong. Please try again or email us directly.';
      }
    } catch (err) {
      successEl.textContent = "We couldn't send your message right now. Please try again or email us directly.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText;
      }
    }
  }
});
