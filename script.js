/* ==========================================================================
   Fratello Fast Food - Master Interactive & Bilingual Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ------------------------------------------------------------------------
     Language Switching Engine (French Default | English Toggle)
     ------------------------------------------------------------------------ */
  let currentLang = localStorage.getItem('fratello_lang') || 'fr';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fratello_lang', lang);
    document.documentElement.lang = lang;

    // Update active class on language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update title tag
    const titleEl = document.querySelector('title[data-fr]');
    if (titleEl) {
      const newTitle = titleEl.getAttribute(`data-${lang}`);
      if (newTitle) document.title = newTitle;
    }

    // Update all elements with data-fr and data-en attributes
    const translatableElements = document.querySelectorAll('[data-fr][data-en]');
    translatableElements.forEach(el => {
      const isHtml = el.getAttribute('data-is-html') === 'true';
      const text = el.getAttribute(`data-${lang}`);
      if (text !== null) {
        if (isHtml) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update aria-labels with data-fr-label / data-en-label
    const labelElements = document.querySelectorAll('[data-fr-label][data-en-label]');
    labelElements.forEach(el => {
      const labelText = el.getAttribute(`data-${lang}-label`);
      if (labelText) {
        el.setAttribute('aria-label', labelText);
      }
    });

    // Re-initialize Lucide Icons for dynamically replaced content
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Refresh status pill in active language
    updateLiveStatus();
  }

  // Language button click handlers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== currentLang) {
        setLanguage(targetLang);
        showToast(targetLang === 'fr' ? 'Langue modifiée en Français' : 'Language switched to English', 'info');
      }
    });
  });

  /* ------------------------------------------------------------------------
     0. Preloader (Loading Screen)
     ------------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  const minDisplayTime = 1200; // 1.2s minimum
  const startTime = Date.now();
  let preloaderDismissed = false;

  const dismissPreloader = () => {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('fade-out');
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 600);
      }
    }, remainingTime);
  };

  if (document.readyState === 'complete') {
    dismissPreloader();
  } else {
    window.addEventListener('load', dismissPreloader);
    // Safety fallback timeout to prevent preloader lockup
    setTimeout(dismissPreloader, 3000);
  }

  /* ------------------------------------------------------------------------
     1. Scroll Progress Bar & Navbar Scroll State
     ------------------------------------------------------------------------ */
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.getElementById('main-navbar');
  const stickyMobileBar = document.getElementById('mobile-order-bar');
  const siteFooter = document.querySelector('.site-footer');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // Navbar background blur on scroll
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Hide sticky mobile order bar near footer
    if (stickyMobileBar && siteFooter) {
      const footerTop = siteFooter.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (footerTop <= windowHeight) {
        stickyMobileBar.classList.add('hidden');
      } else {
        stickyMobileBar.classList.remove('hidden');
      }
    }

    // Active Section Link Highlighting
    updateActiveNavLinks();
  });

  /* ------------------------------------------------------------------------
     Active Section Link Tracking
     ------------------------------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav-links .nav-link, .drawer-links .drawer-link');

  function updateActiveNavLinks() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Toast Notification System
     ------------------------------------------------------------------------ */
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle-2'}" style="color: var(--brand-yellow);"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (stickyMobileBar) stickyMobileBar.classList.add('hidden');
    }
  }

  function closeDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (stickyMobileBar) stickyMobileBar.classList.remove('hidden');
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ------------------------------------------------------------------------
     5. Live Status Pill Logic (Tunisia Time: UTC+1, 10:00 AM - 02:00 AM)
     ------------------------------------------------------------------------ */
  function updateLiveStatus() {
    const statusPill = document.getElementById('live-status-pill');
    const statusText = document.getElementById('status-text');

    if (!statusPill || !statusText) return;

    try {
      const options = { timeZone: 'Africa/Tunis', hour: 'numeric', hour12: false };
      const tunisiaHourStr = new Intl.DateTimeFormat([], options).format(new Date());
      const hour = intParse(tunisiaHourStr);

      const isOpen = (hour >= 10 || hour < 2);

      if (isOpen) {
        statusPill.classList.remove('closed');
        statusText.textContent = currentLang === 'fr' 
          ? 'Ouvert — Commandez maintenant' 
          : 'Open Now — Order for Delivery or Pickup';
      } else {
        statusPill.classList.add('closed');
        statusText.textContent = currentLang === 'fr' 
          ? 'Fermé — Ouvre à 10h00' 
          : 'Closed Now — Opens at 10:00 AM';
      }
    } catch (e) {
      statusText.textContent = currentLang === 'fr' 
        ? 'Ouvert 10h00 – 02h00' 
        : 'Open Daily 10:00 AM – 02:00 AM';
    }
  }

  function intParse(val) {
    const num = parseInt(val, 10);
    return isNaN(num) ? 12 : num;
  }

  updateLiveStatus();
  setInterval(updateLiveStatus, 60000);

  /* ------------------------------------------------------------------------
     5B. Hero Floating Embers Canvas Effect
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('emberCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Ember {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas.width || 800);
        this.y = (canvas.height || 600) + Math.random() * 20;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.color = Math.random() > 0.3 ? '#F6C12D' : '#ff4d4d';
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity -= 0.003;

        if (this.y < -10 || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 40; i++) {
      particles.push(new Ember());
    }

    function animateEmbers() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateEmbers);
    }

    animateEmbers();
  }

  /* ------------------------------------------------------------------------
     5C. Hero Background Video Readiness & Fallback Engine
     ------------------------------------------------------------------------ */
  const heroVideoBg = document.querySelector('.hero-video-bg');
  const heroVideo = document.querySelector('.hero-video');

  if (heroVideoBg && heroVideo) {
    let videoLoaded = false;
    const posterPath = heroVideo.getAttribute('poster') || 'assets/images/tacos_double.png';

    const triggerFallback = () => {
      if (videoLoaded) return;
      heroVideo.style.display = 'none';
      heroVideoBg.style.backgroundImage = `url('${posterPath}')`;
    };

    const markVideoReady = () => {
      videoLoaded = true;
      heroVideo.classList.add('video-ready');
      heroVideo.style.opacity = '1';
    };

    heroVideo.addEventListener('loadeddata', markVideoReady);
    heroVideo.addEventListener('canplay', markVideoReady);
    heroVideo.addEventListener('playing', markVideoReady);

    heroVideo.addEventListener('error', triggerFallback);

    // 3000ms mobile fallback check
    setTimeout(() => {
      if (!videoLoaded || heroVideo.readyState < 2) {
        triggerFallback();
      }
    }, 3000);
  }

  /* ------------------------------------------------------------------------
     10. VIDEO SHOWCASE ENGINE (BULLETPROOF & PLAYBACK READY)
     ------------------------------------------------------------------------ */
  function initVideoCard(wrapper) {
    const video = wrapper.querySelector('.video-element');
    const playOverlay = wrapper.querySelector('.video-play-overlay');
    const playBtn = wrapper.querySelector('.video-play-btn');
    const muteBtn = wrapper.querySelector('.video-mute-btn');
    const poster = wrapper.querySelector('.video-poster');

    if (!video) return;

    // Hide poster and play overlay when video actually starts playing
    const onPlaying = () => {
      if (poster) {
        poster.style.opacity = '0';
        poster.style.transition = 'opacity 0.4s ease';
      }
      if (playOverlay) {
        playOverlay.classList.add('is-playing');
      }
    };

    const onPaused = () => {
      if (playOverlay) {
        playOverlay.classList.remove('is-playing');
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', () => {
      if (!video.paused) onPlaying();
    });
    video.addEventListener('pause', onPaused);
    video.addEventListener('ended', onPaused);

    // If video fails to load, keep poster visible
    video.addEventListener('error', () => {
      if (poster) poster.style.opacity = '1';
      if (playOverlay) playOverlay.style.display = 'none';
      console.warn('Video failed to load:', video.currentSrc);
    });

    // Toggle play/pause on button click OR video click
    const togglePlay = (e) => {
      if (e) e.stopPropagation();
      if (video.paused) {
        video.play().then(() => {
          onPlaying();
        }).catch(() => {});
      } else {
        video.pause();
        onPaused();
      }
    };

    if (playBtn) {
      playBtn.addEventListener('click', togglePlay);
    }
    
    // Clicking the video element or wrapper toggles playback
    video.addEventListener('click', togglePlay);

    // Mute toggle
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        const icon = muteBtn.querySelector('i, svg');
        if (icon) {
          icon.setAttribute('data-lucide', video.muted ? 'volume-x' : 'volume-2');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }
  }

  // Intersection Observer: autoplay in viewport, pause out of viewport
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('.video-element');
      const overlay = entry.target.querySelector('.video-play-overlay');
      if (!video) return;

      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        video.play().then(() => {
          if (overlay) overlay.classList.add('is-playing');
        }).catch(() => {});
      } else {
        video.pause();
        if (overlay) overlay.classList.remove('is-playing');
      }
    });
  }, { threshold: [0, 0.25, 0.5, 1] });

  document.querySelectorAll('.video-wrapper').forEach(wrapper => {
    initVideoCard(wrapper);
    videoObserver.observe(wrapper);
  });

  /* ------------------------------------------------------------------------
     11. Populate Instagram 45 Photo Grid
     ------------------------------------------------------------------------ */
  const instaGridContainer = document.querySelector('.insta-grid-container');
  if (instaGridContainer) {
    let gridHTML = '';
    for (let i = 1; i <= 45; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const imgPath = `assets/images/instagram_feed/insta_${numStr}.jpg`;
      const likesCount = Math.floor(Math.random() * 300) + 120;

      gridHTML += `
        <div class="insta-grid-item gallery-item" data-src="${imgPath}" data-caption="Fratello Instagram Post #${i}">
          <img src="${imgPath}" alt="Instagram feed photo ${i}" loading="lazy">
          <div class="insta-hover-overlay">
            <i data-lucide="heart" style="width: 18px; height: 18px; fill: #fff;"></i>
            <span>${likesCount}</span>
          </div>
        </div>
      `;
    }
    instaGridContainer.innerHTML = gridHTML;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ------------------------------------------------------------------------
     Modals: Express Order Modal (NO PRICES)
     ------------------------------------------------------------------------ */
  const orderModal = document.getElementById('order-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalDishTitle = document.getElementById('modal-dish-title');
  const expressForm = document.getElementById('express-order-form');

  let currentSelectedDish = 'Commande Express';

  document.querySelectorAll('.open-order-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title') || 'Plat Spécial';
      currentSelectedDish = title;

      if (modalDishTitle) {
        modalDishTitle.textContent = currentLang === 'fr' ? `Commande: ${title}` : `Order: ${title}`;
      }

      if (orderModal) {
        orderModal.classList.add('open');
        orderModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeOrderModal() {
    if (orderModal) {
      orderModal.classList.remove('open');
      orderModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeOrderModal);

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  if (expressForm) {
    expressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sauceSelect = document.getElementById('order-sauce');
      const sauceOption = sauceSelect.options[sauceSelect.selectedIndex];
      const sauce = sauceOption.getAttribute(`data-${currentLang}`) || sauceSelect.value;

      const qty = document.getElementById('order-qty').value;
      const address = document.getElementById('order-address').value;

      // Order submission with NO prices, formatted in active language
      let messageText = currentLang === 'fr' 
        ? `Commande: ${currentSelectedDish}\nSauce: ${sauce}\nQté: ${qty}`
        : `Order: ${currentSelectedDish}\nSauce: ${sauce}\nQty: ${qty}`;

      if (address) {
        messageText += currentLang === 'fr' ? `\nAdresse/Notes: ${address}` : `\nAddress/Notes: ${address}`;
      }

      const whatsappURL = `https://wa.me/21623445536?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappURL, '_blank');

      closeOrderModal();
      showToast(currentLang === 'fr' ? 'Redirection vers WhatsApp pour envoyer votre commande !' : 'Redirecting to WhatsApp to send your order!', 'info');
    });
  }

  /* ------------------------------------------------------------------------
     Modals: Lightbox Gallery Modal
     ------------------------------------------------------------------------ */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let galleryItems = [];
  let currentGalleryIndex = 0;

  function refreshGalleryItems() {
    galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  }

  refreshGalleryItems();

  document.body.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) {
      refreshGalleryItems();
      currentGalleryIndex = galleryItems.indexOf(item);
      if (currentGalleryIndex !== -1) {
        openLightbox(currentGalleryIndex);
      }
    }
  });

  function openLightbox(index) {
    if (!lightboxModal || !galleryItems[index]) return;

    const item = galleryItems[index];
    const src = item.getAttribute('data-src') || item.querySelector('img')?.src;
    const caption = item.getAttribute('data-caption') || item.querySelector('img')?.alt || 'Fratello Food Photography';

    if (lightboxImg) lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption;

    lightboxModal.classList.add('open');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightboxModal() {
    if (lightboxModal) {
      lightboxModal.classList.remove('open');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  }

  function showPrevImage() {
    if (galleryItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  function showNextImage() {
    if (galleryItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxModal);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightboxModal();
    });
  }

  // Keyboard navigation for Lightbox & Escape for Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOrderModal();
      closeLightboxModal();
      closeDrawer();
    } else if (lightboxModal && lightboxModal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    }
  });

  /* ------------------------------------------------------------------------
     15. Contact Form Handler
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const phone = document.getElementById('contact-phone').value;
      const message = document.getElementById('contact-message').value;

      const text = currentLang === 'fr'
        ? `Bonjour Fratello Fast Food !\n\nNom: ${name}\nTéléphone: ${phone}\nDemande: ${message}`
        : `Hello Fratello Fast Food!\n\nName: ${name}\nPhone: ${phone}\nInquiry: ${message}`;
      
      const url = `https://wa.me/21623445536?text=${encodeURIComponent(text)}`;

      window.open(url, '_blank');
      showToast(currentLang === 'fr' ? 'Demande envoyée via WhatsApp !' : 'Inquiry sent via WhatsApp!', 'info');
      contactForm.reset();
    });
  }

  // Initialize initial language (French default or saved language preference)
  setLanguage(currentLang);
});
