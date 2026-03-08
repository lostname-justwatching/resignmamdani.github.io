// ============================================
// RESIGN MAMDANI - Campaign Website JavaScript
// ============================================

(function () {
  'use strict';

  // ---- Configuration ----
  const CONFIG = {
    campaignMessage: `Public officials must clearly condemn violence and terrorism.
Accountability matters. When leaders fail to take a clear moral stand,
citizens must demand better. Share this message, raise your voice,
and stand for transparency in public office.

#ResignMamdani`,
    hashtag: '#ResignMamdani',
    tweetText: 'Public officials must clearly condemn violence and terrorism. Accountability matters. #ResignMamdani',
    siteUrl: '',
    animationDuration: 2000,
    counterFrameRate: 60,
    scrollThreshold: 100,
    navHeight: 72,
    toastDuration: 3000,
    shareWindowWidth: 600,
    shareWindowHeight: 400,
    particleCount: 50,
  };

  // ---- Utility Functions ----

  /**
   * Safely query a DOM element
   */
  function $(selector) {
    return document.querySelector(selector);
  }

  /**
   * Safely query all DOM elements
   */
  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Safely add event listener with element existence check
   */
  function addEvent(element, event, handler, options) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options || false);
      return true;
    }
    return false;
  }

  /**
   * Safely add event listener by selector
   */
  function addEventBySelector(selector, event, handler, options) {
    const element = $(selector);
    return addEvent(element, event, handler, options);
  }

  /**
   * Open centered popup window
   */
  function openPopup(url, title, width, height) {
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
    window.open(url, title, features);
  }

  /**
   * Copy text to clipboard with fallback
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }

  /**
   * Format number with commas
   */
  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Easing function (ease out cubic)
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Easing function (ease out expo)
   */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // ============================================
  // 1. SOCIAL SHARE BUTTONS
  // ============================================

  function initSocialSharing() {
    const shareData = {
      x: {
        selectors: ['#hero-share-x', '#share-x'],
        getUrl: () => {
          const text = encodeURIComponent(CONFIG.tweetText);
          const url = encodeURIComponent(CONFIG.siteUrl || window.location.href);
          return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        },
      },
      facebook: {
        selectors: ['#hero-share-fb', '#share-facebook'],
        getUrl: () => {
          const url = encodeURIComponent(CONFIG.siteUrl || window.location.href);
          const quote = encodeURIComponent(CONFIG.tweetText);
          return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
        },
      },
      telegram: {
        selectors: ['#share-telegram'],
        getUrl: () => {
          const text = encodeURIComponent(CONFIG.tweetText);
          const url = encodeURIComponent(CONFIG.siteUrl || window.location.href);
          return `https://t.me/share/url?url=${url}&text=${text}`;
        },
      },
    };

    Object.entries(shareData).forEach(([platform, data]) => {
      data.selectors.forEach((selector) => {
        const element = $(selector);
        if (element) {
          addEvent(element, 'click', (e) => {
            e.preventDefault();
            const shareUrl = data.getUrl();
            openPopup(
              shareUrl,
              `Share on ${platform}`,
              CONFIG.shareWindowWidth,
              CONFIG.shareWindowHeight
            );
            trackAction('share', platform);
          });
        }
      });
    });

    // Instagram - just opens Instagram (can't prefill)
    const instagramBtn = $('#share-instagram');
    if (instagramBtn) {
      addEvent(instagramBtn, 'click', (e) => {
        // Let the default link behavior work
        trackAction('share', 'instagram');
      });
    }
  }

  // ============================================
  // 2. COPY MESSAGE FUNCTIONALITY
  // ============================================

  function initCopyMessage() {
    // Main copy message button
    const copyBtn = $('#copy-message-btn');
    const toast = $('#copy-toast');
    const messageText = $('#campaign-message-text');

    if (copyBtn) {
      addEvent(copyBtn, 'click', async () => {
        const text = messageText ? messageText.textContent.trim() : CONFIG.campaignMessage;
        const success = await copyToClipboard(text);

        if (success) {
          showCopySuccess(copyBtn, toast);
          trackAction('copy', 'campaign-message');
        }
      });
    }

    // Hero copy button
    const heroCopyBtn = $('#hero-copy-btn');
    if (heroCopyBtn) {
      addEvent(heroCopyBtn, 'click', async () => {
        const success = await copyToClipboard(CONFIG.campaignMessage);
        if (success) {
          const btnText = heroCopyBtn.querySelector('.copy-btn-text');
          if (btnText) {
            const originalText = btnText.textContent;
            btnText.textContent = 'Copied!';
            heroCopyBtn.classList.add('copied');
            setTimeout(() => {
              btnText.textContent = originalText;
              heroCopyBtn.classList.remove('copied');
            }, CONFIG.toastDuration);
          }
          trackAction('copy', 'hero-message');
        }
      });
    }

    // CTA copy button
    const ctaCopyBtn = $('#cta-copy-btn');
    if (ctaCopyBtn) {
      addEvent(ctaCopyBtn, 'click', async () => {
        const success = await copyToClipboard(CONFIG.hashtag);
        if (success) {
          const originalText = ctaCopyBtn.textContent;
          ctaCopyBtn.textContent = 'Copied!';
          ctaCopyBtn.classList.add('copied');
          setTimeout(() => {
            ctaCopyBtn.textContent = originalText;
            ctaCopyBtn.classList.remove('copied');
          }, CONFIG.toastDuration);
          trackAction('copy', 'cta-hashtag');
        }
      });
    }

    // Crypto address copy buttons
    initCryptoAddressCopy();
  }

  /**
   * Show copy success state
   */
  function showCopySuccess(button, toast) {
    // Update button state
    const label = button.querySelector('.copy-btn-label');
    const iconCopy = button.querySelector('.icon-copy');
    const iconCheck = button.querySelector('.icon-check');

    if (label) {
      const originalLabel = label.textContent;
      label.textContent = 'Copied!';

      if (iconCopy) iconCopy.style.display = 'none';
      if (iconCheck) iconCheck.style.display = 'inline-block';

      button.classList.add('copied');

      setTimeout(() => {
        label.textContent = originalLabel;
        if (iconCopy) iconCopy.style.display = '';
        if (iconCheck) iconCheck.style.display = 'none';
        button.classList.remove('copied');
      }, CONFIG.toastDuration);
    }

    // Show toast notification
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, CONFIG.toastDuration);
    }
  }

  /**
   * Initialize crypto address copy buttons
   */
  function initCryptoAddressCopy() {
    const cryptoButtons = [
      { btnId: '#copy-btc', addressId: '#btc-address' },
      { btnId: '#copy-eth', addressId: '#eth-address' },
      { btnId: '#copy-sol', addressId: '#sol-address' },
    ];

    cryptoButtons.forEach(({ btnId, addressId }) => {
      const btn = $(btnId);
      const addressEl = $(addressId);

      if (btn && addressEl) {
        addEvent(btn, 'click', async () => {
          const address = addressEl.textContent.trim();
          const success = await copyToClipboard(address);

          if (success) {
            const span = btn.querySelector('span');
            if (span) {
              const originalText = span.textContent;
              span.textContent = 'Copied!';
              btn.classList.add('copied');

              setTimeout(() => {
                span.textContent = originalText;
                btn.classList.remove('copied');
              }, CONFIG.toastDuration);
            }
            trackAction('copy', `crypto-${btnId.replace('#copy-', '')}`);
          }
        });
      }
    });
  }

  // ============================================
  // 3. NUMBER ANIMATION (Counter)
  // ============================================

  function initCounterAnimation() {
    const counters = $$('.counter');
    if (!counters.length) return;

    const animatedCounters = new Set();

    function animateCounter(element) {
      const id = element.getAttribute('data-target') || element.id;
      if (animatedCounters.has(element)) return;
      animatedCounters.add(element);

      const target = parseInt(element.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const duration = CONFIG.animationDuration;
      const startTime = performance.now();
      const startValue = 0;

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

        element.textContent = formatNumber(currentValue);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = formatNumber(target);
        }
      }

      requestAnimationFrame(updateCounter);
    }

    // Also animate stat bars
    function animateStatBars(container) {
      const bars = container.querySelectorAll('.stat-bar-fill');
      bars.forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width');
        if (targetWidth) {
          setTimeout(() => {
            bar.style.width = targetWidth + '%';
            bar.classList.add('animated');
          }, 200);
        }
      });
    }

    // Use IntersectionObserver to trigger animation
    if ('IntersectionObserver' in window) {
      const statsSection = $('#stats');
      if (statsSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                counters.forEach((counter) => animateCounter(counter));
                animateStatBars(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px',
          }
        );
        observer.observe(statsSection);
      }
    } else {
      // Fallback: animate immediately
      counters.forEach((counter) => animateCounter(counter));
    }
  }

  // ============================================
  // 4. SCROLL ANIMATIONS (Intersection Observer)
  // ============================================

  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      $$('.section').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Elements to animate
    const animatableSelectors = [
      '.about-card',
      '.help-card',
      '.share-btn',
      '.donate-card',
      '.stat-card',
      '.gallery-item',
      '.copy-message-container',
      '.cta-content',
      '.section-header',
    ];

    const elements = [];
    animatableSelectors.forEach((selector) => {
      $$(selector).forEach((el) => elements.push(el));
    });

    if (!elements.length) return;

    // Set initial state
    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Staggered delay based on sibling index
            const parent = el.parentElement;
            const siblings = parent ? Array.from(parent.children).filter(
              (child) => elements.includes(child)
            ) : [];
            const index = siblings.indexOf(el);
            const delay = index >= 0 ? index * 100 : 0;

            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ============================================
  // 5. IMAGE GALLERY
  // ============================================

  function initGallery() {
    const galleryItems = $$('.gallery-item');
    const lightboxOverlay = $('#lightbox-overlay');
    const lightboxImg = $('#lightbox-img');
    const lightboxCaption = $('#lightbox-caption');
    const lightboxClose = $('#lightbox-close');
    const lightboxPrev = $('#lightbox-prev');
    const lightboxNext = $('#lightbox-next');

    if (!galleryItems.length) return;

    let currentIndex = 0;
    const galleryData = [];

    // Collect gallery data
    galleryItems.forEach((item, index) => {
      const img = item.querySelector('.gallery-img');
      const caption = item.querySelector('figcaption');
      galleryData.push({
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        caption: caption ? caption.textContent : '',
      });

      // Click to open lightbox
      addEvent(item, 'click', () => {
        openLightbox(index);
      });

      // Keyboard accessibility
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `View image: ${galleryData[index].caption}`);

      addEvent(item, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    // Lazy load images
    initLazyLoading();

    function openLightbox(index) {
      if (!lightboxOverlay || !lightboxImg) return;

      currentIndex = index;
      updateLightboxContent();

      lightboxOverlay.hidden = false;
      // Force reflow before adding class
      lightboxOverlay.offsetHeight;
      lightboxOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Trap focus
      lightboxClose && lightboxClose.focus();
    }

    function closeLightbox() {
      if (!lightboxOverlay) return;

      lightboxOverlay.classList.remove('active');
      setTimeout(() => {
        lightboxOverlay.hidden = true;
        document.body.style.overflow = '';
      }, 300);
    }

    function updateLightboxContent() {
      if (!galleryData[currentIndex]) return;

      const data = galleryData[currentIndex];
      if (lightboxImg) {
        lightboxImg.src = data.src;
        lightboxImg.alt = data.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = data.caption;
      }
    }

    function navigateLightbox(direction) {
      currentIndex = (currentIndex + direction + galleryData.length) % galleryData.length;
      updateLightboxContent();
    }

    // Lightbox controls
    if (lightboxClose) {
      addEvent(lightboxClose, 'click', closeLightbox);
    }

    if (lightboxPrev) {
      addEvent(lightboxPrev, 'click', () => navigateLightbox(-1));
    }

    if (lightboxNext) {
      addEvent(lightboxNext, 'click', () => navigateLightbox(1));
    }

    // Close on overlay click
    if (lightboxOverlay) {
      addEvent(lightboxOverlay, 'click', (e) => {
        if (e.target === lightboxOverlay) {
          closeLightbox();
        }
      });
    }

    // Keyboard navigation
    addEvent(document, 'keydown', (e) => {
      if (!lightboxOverlay || lightboxOverlay.hidden) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox(-1);
          break;
        case 'ArrowRight':
          navigateLightbox(1);
          break;
      }
    });

    // Touch/swipe support for lightbox
    initLightboxSwipe(lightboxOverlay, navigateLightbox, closeLightbox);
  }

  /**
   * Initialize lazy loading for gallery images
   */
  function initLazyLoading() {
    const images = $$('.gallery-img[loading="lazy"]');
    if (!images.length) return;

    images.forEach((img) => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        addEvent(img, 'load', () => {
          img.classList.add('loaded');
        });
      }
    });
  }

  /**
   * Touch swipe support for lightbox
   */
  function initLightboxSwipe(overlay, navigate, close) {
    if (!overlay) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    addEvent(overlay, 'touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    addEvent(overlay, 'touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          navigate(1); // Swipe left → next
        } else {
          navigate(-1); // Swipe right → prev
        }
      }

      // Vertical swipe down to close
      if (Math.abs(diffY) > 100 && diffY < 0) {
        close();
      }
    }, { passive: true });
  }

  // ============================================
  // 6. MOBILE MENU
  // ============================================

  function initMobileMenu() {
    const toggle = $('#nav-toggle');
    const navLinks = $('#nav-links');
    const nav = $('#main-nav');

    if (!toggle || !navLinks) return;

    // Toggle menu
    addEvent(toggle, 'click', () => {
      const isActive = toggle.classList.contains('active');

      toggle.classList.toggle('active');
      navLinks.classList.toggle('active');

      // Update ARIA attributes
      toggle.setAttribute('aria-expanded', !isActive);

      // Toggle body scroll
      if (!isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu on link click
    const links = navLinks.querySelectorAll('a');
    links.forEach((link) => {
      addEvent(link, 'click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on outside click
    addEvent(document, 'click', (e) => {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close menu on Escape key
    addEvent(document, 'keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  // ============================================
  // 7. NAVIGATION SCROLL EFFECTS
  // ============================================

  function initNavScrollEffects() {
    const nav = $('#main-nav');
    if (!nav) return;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY > CONFIG.scrollThreshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, 100);

    addEvent(window, 'scroll', handleScroll, { passive: true });

    // Active nav link highlighting
    initActiveNavHighlighting();
  }

  /**
   * Highlight active nav link based on scroll position
   */
  function initActiveNavHighlighting() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY + CONFIG.navHeight + 100;

      let currentSection = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }, 150);

    addEvent(window, 'scroll', handleScroll, { passive: true });
  }

  // ============================================
  // 8. BACK TO TOP BUTTON
  // ============================================

  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 100);

    addEvent(window, 'scroll', handleScroll, { passive: true });

    addEvent(btn, 'click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  // ============================================
  // 9. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================

  function initSmoothScroll() {
    const anchorLinks = $$('a[href^="#"]');

    anchorLinks.forEach((link) => {
      addEvent(link, 'click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = $(href);
        if (!target) return;

        e.preventDefault();

        const targetPosition = target.offsetTop - CONFIG.navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ============================================
  // 10. HERO PARTICLES EFFECT
  // ============================================

  function initHeroParticles() {
    const container = $('#hero-particles');
    if (!container) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const particles = [];

    class Particle {
      constructor() {
        this.element = document.createElement('div');
        this.reset();
        this.element.style.cssText = `
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform, opacity;
        `;
        container.appendChild(this.element);
      }

      reset() {
        this.x = Math.random() * 100;
        this.y = Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.hue = Math.random() > 0.7 ? 0 : 220; // Red or blue tint
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.x < -5) this.x = 105;
        if (this.x > 105) this.x = -5;
        if (this.y < -5) this.y = 105;
        if (this.y > 105) this.y = -5;

        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.opacity = this.opacity;
        this.element.style.background =
          this.hue === 0
            ? `rgba(230, 57, 70, ${this.opacity})`
            : `rgba(67, 97, 238, ${this.opacity})`;
      }
    }

    // Create particles
    const particleCount = Math.min(CONFIG.particleCount, window.innerWidth < 768 ? 20 : 50);
    for (let i = 0; i < particleCount; i++) {
      const particle = new Particle();
      particles.push(particle);
    }

    // Animation loop
    let animationId;
    let isVisible = true;

    function animate() {
      if (!isVisible) return;
      particles.forEach((p) => p.update());
      animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    if ('IntersectionObserver' in window) {
      const heroSection = $('#hero');
      if (heroSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                isVisible = true;
                animate();
              } else {
                isVisible = false;
                if (animationId) {
                  cancelAnimationFrame(animationId);
                }
              }
            });
          },
          { threshold: 0 }
        );
        observer.observe(heroSection);
      }
    }

    animate();
  }

  // ============================================
  // 11. FOOTER YEAR
  // ============================================

  function initFooterYear() {
    const yearEl = $('#current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // 12. TRACKING (Simple analytics placeholder)
  // ============================================

  function trackAction(category, action) {
    // Placeholder for analytics tracking
    // Can be integrated with Google Analytics, Plausible, etc.
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`[Campaign Track] ${category}: ${action}`);
    }
  }

  // ============================================
  // 13. KEYBOARD ACCESSIBILITY ENHANCEMENTS
  // ============================================

  function initAccessibility() {
    // Skip to main content (if link exists)
    // Add visible focus styles
    addEvent(document, 'keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    addEvent(document, 'mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Ensure all interactive elements are focusable
    $$('.share-btn, .donate-card, .help-card').forEach((el) => {
      if (!el.getAttribute('tabindex') && el.tagName !== 'A' && el.tagName !== 'BUTTON') {
        el.setAttribute('tabindex', '0');
      }
    });
  }

  // ============================================
  // 14. PERFORMANCE OPTIMIZATIONS
  // ============================================

  function initPerformanceOptimizations() {
    // Defer non-critical animations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initHeroParticles();
      });
    } else {
      setTimeout(initHeroParticles, 200);
    }

    // Handle visibility change - pause animations when tab is hidden
    addEvent(document, 'visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - animations will naturally pause via IntersectionObserver
      }
    });
  }

  // ============================================
  // 15. SHARE URL HANDLING
  // ============================================

  function initShareUrls() {
    // Update share URLs with current page URL
    const currentUrl = window.location.href;

    // Update all share links that have empty url parameters
    $$('a[href*="share"], a[href*="intent/tweet"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const updatedHref = href
          .replace('url=&', `url=${encodeURIComponent(currentUrl)}&`)
          .replace(/url=$/, `url=${encodeURIComponent(currentUrl)}`);
        link.setAttribute('href', updatedHref);
      }
    });
  }

  // ============================================
  // 16. IMAGE PLACEHOLDER HANDLING
  // ============================================

  function initImagePlaceholders() {
    const images = $$('.gallery-img');

    images.forEach((img) => {
      addEvent(img, 'error', () => {
        const wrapper = img.parentElement;
        if (wrapper) {
          wrapper.classList.add('img-placeholder');
          img.style.display = 'none';
        }
      });

      // Check if already errored
      if (img.complete && img.naturalWidth === 0) {
        const wrapper = img.parentElement;
        if (wrapper) {
          wrapper.classList.add('img-placeholder');
          img.style.display = 'none';
        }
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    try {
      // Core functionality
      initMobileMenu();
      initSocialSharing();
      initCopyMessage();
      initSmoothScroll();
      initNavScrollEffects();
      initBackToTop();
      initCounterAnimation();
      initScrollAnimations();
      initGallery();
      initFooterYear();
      initAccessibility();
      initShareUrls();
      initImagePlaceholders();

      // Performance-sensitive features
      initPerformanceOptimizations();

    } catch (error) {
      console.error('[ResignMamdani] Initialization error:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    addEvent(document, 'DOMContentLoaded', init);
  } else {
    init();
  }
})();
