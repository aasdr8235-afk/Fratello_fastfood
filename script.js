/* ==========================================================================
   Fratello Fast Food - Master JavaScript Engine (100% Pure Vanilla JS)
   Performance Architecture: 60 FPS Composite-Only Rendering & rAF Ticking
   IntersectionObserver Active Tracking | Zero Layout Thrashing | Passive Events
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Lightweight Toast Notification Engine
     -------------------------------------------------------------------------- */
  const toastContainer = document.getElementById('toast-container');

  window.showToast = function (message, type = 'success', duration = 3500) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close Toast"><i data-lucide="x"></i></button>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: {}, targets: [toast] });

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('visible');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      }, { once: true });
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  };

  /* --------------------------------------------------------------------------
     2. Video Playback & Viewport IntersectionObserver
     -------------------------------------------------------------------------- */
  const videos = document.querySelectorAll('.observe-video, #heroVideo');

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => { });
          }
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.2
    });

    videos.forEach(video => videoObserver.observe(video));
  }

  /* Video Interactive Controls */
  const videoCards = document.querySelectorAll('.featured-video-card, .side-video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const muteBtn = card.querySelector('.toggle-mute');
    const playPauseBtn = card.querySelector('.play-pause');

    if (muteBtn && video) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        const icon = muteBtn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', video.muted ? 'volume-x' : 'volume-2');
          if (window.lucide) window.lucide.createIcons({ targets: [muteBtn] });
        }
      });
    }

    if (playPauseBtn && video) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play();
          const icon = playPauseBtn.querySelector('i');
          if (icon) icon.setAttribute('data-lucide', 'pause');
        } else {
          video.pause();
          const icon = playPauseBtn.querySelector('i');
          if (icon) icon.setAttribute('data-lucide', 'play');
        }
        if (window.lucide) window.lucide.createIcons({ targets: [playPauseBtn] });
      });
    }
  });

  /* --------------------------------------------------------------------------
     3. 60 FPS Scroll Dynamics & IntersectionObserver Active Section Tracking
     - Eliminates layout thrashing (0 offsetTop reads in scroll handler)
     - GPU Compositor scaleX progress bar updates
     - rAF scroll throttling
     -------------------------------------------------------------------------- */
  const scrollProgress = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  let isTicking = false;
  let cachedDocHeight = 0;

  const recalculateDocHeight = () => {
    cachedDocHeight = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
  };

  recalculateDocHeight();
  window.addEventListener('resize', recalculateDocHeight, { passive: true });

  const updateScrollState = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrolledRatio = cachedDocHeight > 0 ? scrollTop / cachedDocHeight : 0;

    // GPU Compositor transform (scaleX) - 0 Reflows & 0 Layout Thrashing
    if (scrollProgress) {
      scrollProgress.style.transform = `scaleX(${scrolledRatio})`;
    }

    if (navbar) {
      navbar.classList.toggle('scrolled', scrollTop > 40);
    }

    if (backToTop) {
      backToTop.classList.toggle('visible', scrollTop > 400);
    }

    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      requestAnimationFrame(updateScrollState);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollState();

  // Zero-Reflow Active Section Highlight via IntersectionObserver
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentSection = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Mobile Navigation Drawer Controls
     -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const mobileDrawerClose = document.getElementById('mobile-drawer-close');

  const closeMobileMenu = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('active');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    }
    if (mobileToggle) {
      mobileToggle.classList.remove('active');
    }
    document.body.style.overflow = '';
  };

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileDrawer.classList.toggle('active');
      mobileToggle.classList.toggle('active', isActive);
      mobileDrawer.setAttribute('aria-hidden', !isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    if (mobileDrawerClose) {
      mobileDrawerClose.addEventListener('click', closeMobileMenu);
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* --------------------------------------------------------------------------
     5. Tabbed Menu Category Filter System
     -------------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const dishCards = document.querySelectorAll('.dish-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      dishCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     6. Express WhatsApp Order Modal & Contact Form Triggers
     -------------------------------------------------------------------------- */
  const orderModal = document.getElementById('orderModal');
  const closeModal = document.getElementById('closeModal');
  const orderBtns = document.querySelectorAll('.open-order-modal');
  const modalTitle = document.getElementById('modalDishTitle');
  const modalPrice = document.getElementById('modalDishPrice');
  const expressForm = document.getElementById('expressOrderForm');
  const contactForm = document.getElementById('contactForm');

  let lastActiveElement = null;

  orderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lastActiveElement = document.activeElement;
      const title = btn.getAttribute('data-title') || 'Custom Order';
      const price = btn.getAttribute('data-price') || '';

      if (modalTitle) modalTitle.textContent = title;
      if (modalPrice) modalPrice.textContent = price;

      if (orderModal) {
        orderModal.classList.add('active');
        orderModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeOrderModal = () => {
    if (orderModal) {
      orderModal.classList.remove('active');
      orderModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActiveElement) lastActiveElement.focus();
    }
  };

  if (closeModal) closeModal.addEventListener('click', closeOrderModal);

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  if (expressForm) {
    expressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modalTitle ? modalTitle.textContent : 'Item';
      const qty = document.getElementById('orderQty').value || 1;
      const sauce = document.getElementById('sauceChoice').value || 'Standard';

      const whatsappMsg = `Hello Fratello Fast Food! I would like to order:\n- Item: ${title}\n- Quantity: ${qty}\n- Sauce: ${sauce}\n\nLocation: Hammamet Sud`;
      const encodedMsg = encodeURIComponent(whatsappMsg);

      closeOrderModal();
      window.showToast('Redirecting to WhatsApp Order...', 'success');
      setTimeout(() => {
        window.open(`https://wa.me/21623445536?text=${encodedMsg}`, '_blank');
      }, 400);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.showToast('Thank you! Your order inquiry has been submitted.', 'success', 4000);
      contactForm.reset();
    });
  }

  /* --------------------------------------------------------------------------
     7. Enhanced Lightbox Carousel Modal with GPU Transitions & Touch Gestures
     -------------------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item[data-src]'));
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightbox = document.getElementById('closeLightbox');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;

  const updateLightbox = (index) => {
    if (!galleryItems.length || index < 0 || index >= galleryItems.length) return;
    currentGalleryIndex = index;
    const targetItem = galleryItems[currentGalleryIndex];
    const src = targetItem.getAttribute('data-src');
    const imgAlt = targetItem.querySelector('img')?.getAttribute('alt') || 'Fratello Food Photo';

    if (lightboxImg) {
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.alt = imgAlt;
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 120);
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = `${imgAlt} (${currentGalleryIndex + 1} / ${galleryItems.length})`;
    }
  };

  const openLightbox = (index) => {
    lastActiveElement = document.activeElement;
    updateLightbox(index);
    if (lightboxModal) {
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightboxModal = () => {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActiveElement) lastActiveElement.focus();
    }
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxModal);

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightbox(prevIndex);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIndex = (currentGalleryIndex + 1) % galleryItems.length;
      updateLightbox(nextIndex);
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightboxModal();
    });
  }

  // Keyboard navigation & Escape key support
  document.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightboxModal();
      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightbox(prevIndex);
      }
      if (e.key === 'ArrowRight') {
        const nextIndex = (currentGalleryIndex + 1) % galleryItems.length;
        updateLightbox(nextIndex);
      }
    } else if (orderModal && orderModal.classList.contains('active')) {
      if (e.key === 'Escape') closeOrderModal();
    }
  });

  // Passive Touch Swipe Gesture Support for Mobile Lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightboxModal) {
    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      const nextIndex = (currentGalleryIndex + 1) % galleryItems.length;
      updateLightbox(nextIndex);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      const prevIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightbox(prevIndex);
    }
  };



  /* ==========================================================================
     8 PREMIUM CONVERSION FEATURES JS ENGINE
     ========================================================================== */

  /* --------------------------------------------------------------------------
     FEATURE 1: LIVE OPEN/CLOSED STATUS INDICATOR
     -------------------------------------------------------------------------- */
  const liveStatusPill = document.getElementById('liveStatusPill');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  if (liveStatusPill && statusText) {
    const updateRestaurantStatus = () => {
      const now = new Date();
      const options = { timeZone: 'Africa/Tunis', hour12: false, hour: '2-digit', minute: '2-digit' };
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(now);

      let hour = 0;
      let minute = 0;
      parts.forEach(p => {
        if (p.type === 'hour') hour = parseInt(p.value, 10);
        if (p.type === 'minute') minute = parseInt(p.value, 10);
      });

      const totalMinutes = hour * 60 + minute;
      const isOpen = totalMinutes >= (10 * 60) || totalMinutes < (2 * 60);

      if (isOpen) {
        liveStatusPill.classList.remove('is-closed');
        liveStatusPill.classList.add('is-open');
        statusText.textContent = 'Open Now • Closes at 02:00 AM';
      } else {
        liveStatusPill.classList.remove('is-open');
        liveStatusPill.classList.add('is-closed');
        statusText.textContent = 'Closed • Opens at 10:00 AM';
      }
    };

    updateRestaurantStatus();
    setInterval(updateRestaurantStatus, 60000);
  }

  /* --------------------------------------------------------------------------
     FEATURE 2: STICKY MOBILE ORDER BAR
     -------------------------------------------------------------------------- */
  const stickyMobileBar = document.getElementById('stickyMobileBar');
  const heroSec = document.getElementById('hero');
  const siteFooter = document.querySelector('footer');

  if (stickyMobileBar && heroSec && 'IntersectionObserver' in window) {
    let heroPassed = false;
    let footerReached = false;

    const updateBarVisibility = () => {
      if (heroPassed && !footerReached) {
        stickyMobileBar.classList.add('visible');
        document.body.classList.add('mobile-order-active');
      } else {
        stickyMobileBar.classList.remove('visible');
        document.body.classList.remove('mobile-order-active');
      }
    };

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroPassed = !entry.isIntersecting;
        updateBarVisibility();
      });
    }, { threshold: 0.1 });

    heroObserver.observe(heroSec);

    if (siteFooter) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          footerReached = entry.isIntersecting;
          updateBarVisibility();
        });
      }, { threshold: 0.1 });

      footerObserver.observe(siteFooter);
    }
  }

  /* --------------------------------------------------------------------------
     FEATURE 3: INGREDIENT STORYTELLING HOVER CARDS
     -------------------------------------------------------------------------- */
  const dishCardsWithIngredients = document.querySelectorAll('#menu .dish-card[data-ingredients]');

  dishCardsWithIngredients.forEach(card => {
    try {
      const rawData = card.getAttribute('data-ingredients');
      const ingredients = JSON.parse(rawData);

      if (Array.isArray(ingredients) && ingredients.length) {
        const overlay = document.createElement('div');
        overlay.className = 'ingredient-overlay';

        ingredients.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'ingredient-item';
          itemEl.innerHTML = `<i data-lucide="${item.icon}"></i> <span>${item.text}</span>`;
          overlay.appendChild(itemEl);
        });

        card.appendChild(overlay);
        if (window.lucide) {
          window.lucide.createIcons({ targets: [overlay] });
        }
      }
    } catch (e) {
      console.warn('Failed to parse dish ingredients JSON', e);
    }
  });

  /* --------------------------------------------------------------------------
     FEATURE 4: SCROLL-DRIVEN CINEMATIC VIDEO TIMELINE
     -------------------------------------------------------------------------- */
  const sideVideoCards = document.querySelectorAll('.side-video-card');

  if ('IntersectionObserver' in window && sideVideoCards.length) {
    const videoTimelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          entry.target.classList.add('video-active');
        } else if (entry.intersectionRatio < 0.25) {
          entry.target.classList.remove('video-active');
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: "-20% 0px -20% 0px"
    });

    sideVideoCards.forEach(card => videoTimelineObserver.observe(card));
  }

  /* --------------------------------------------------------------------------
     FEATURE 5: INSTAGRAM MASONRY LAYOUT WITH BLUR-UP LOADING
     -------------------------------------------------------------------------- */
  const instaGridImgs = document.querySelectorAll('.insta-grid-item img');

  instaGridImgs.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      }, { once: true });
    }
  });

  /* --------------------------------------------------------------------------
     FEATURE 6: FLOATING EMBER PARTICLE SYSTEM (HERO OVERLAY)
     -------------------------------------------------------------------------- */
  const heroForEmbers = document.getElementById('hero');
  const emberCanvas = document.getElementById('emberCanvas');

  if (heroForEmbers && emberCanvas) {
    const ctx = emberCanvas.getContext('2d');
    let animationFrameId = null;
    let particles = [];
    let isHeroVisible = true;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 15 : 40;
    const emberColors = ['#F6C12D', '#E53935', '#FF8C00'];

    const resizeCanvas = () => {
      emberCanvas.width = heroForEmbers.clientWidth;
      emberCanvas.height = heroForEmbers.clientHeight;
    };

    const createParticle = () => {
      return {
        x: Math.random() * emberCanvas.width,
        y: emberCanvas.height + Math.random() * 20,
        radius: Math.random() * 2.5 + 1.5,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 1.5 + 0.5),
        opacity: Math.random() * 0.4 + 0.4,
        lifespan: Math.floor(Math.random() * 150 + 150),
        currentLife: 0
      };
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const p = createParticle();
        p.y = Math.random() * emberCanvas.height;
        p.currentLife = Math.floor(Math.random() * p.lifespan);
        particles.push(p);
      }
    };

    const renderEmbers = () => {
      if (!isHeroVisible) return;
      ctx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.currentLife++;

        const lifeRatio = p.currentLife / p.lifespan;
        const currentOpacity = Math.max(0, p.opacity * (1 - lifeRatio));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();

        if (p.currentLife >= p.lifespan || p.y < -10) {
          particles[i] = createParticle();
        }
      }

      animationFrameId = requestAnimationFrame(renderEmbers);
    };

    resizeCanvas();
    initParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      const emberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible) {
            if (!animationFrameId) renderEmbers();
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      }, { threshold: 0.1 });

      emberObserver.observe(heroForEmbers);
    } else {
      renderEmbers();
    }
  }

  /* --------------------------------------------------------------------------
     FEATURE 8: CHEESE PULL BUTTON MICRO-INTERACTION
     -------------------------------------------------------------------------- */
  const yellowButtons = document.querySelectorAll('.btn-brand-yellow');

  yellowButtons.forEach(btn => {
    const text = btn.textContent || '';
    if (text.includes('Order') || text.includes('Pizza')) {
      btn.classList.add('has-cheese-pull');
    }
  });

});
