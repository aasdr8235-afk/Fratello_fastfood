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
            playPromise.catch(() => {});
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

});
