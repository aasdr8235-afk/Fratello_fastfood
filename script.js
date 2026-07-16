/* ==========================================================================
   Fratello Fast Food - Master JavaScript Engine (100% Pure Vanilla JS)
   No frameworks | Performance & IntersectionObserver Optimized | Mobile Ready
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Video Playback & Viewport IntersectionObserver
     - Autoplay muted ONLY when in view
     - Pause automatically when out of view
     - Audio strictly muted by default
     -------------------------------------------------------------------------- */
  const videos = document.querySelectorAll('.observe-video, #heroVideo');

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          // Force muted by default to respect autoplay policies
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('Autoplay muted playback deferred:', error);
            });
          }
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.25 // Trigger when 25% of video is visible
    });

    videos.forEach(video => {
      videoObserver.observe(video);
    });
  }

  /* Video Interactive Controls (Mute/Unmute & Play/Pause) */
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
          if (window.lucide) window.lucide.createIcons();
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
        if (window.lucide) window.lucide.createIcons();
      });
    }
  });

  /* --------------------------------------------------------------------------
     2. Navbar Scroll Dynamics & Active Tracking
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active navbar item based on scroll position
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  /* --------------------------------------------------------------------------
     3. Mobile Navigation Drawer Controls
     -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileDrawer.classList.toggle('active');
      mobileDrawer.setAttribute('aria-hidden', !isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Tabbed Menu Category Filter System
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
     5. Express WhatsApp Order Modal Trigger
     -------------------------------------------------------------------------- */
  const orderModal = document.getElementById('orderModal');
  const closeModal = document.getElementById('closeModal');
  const orderBtns = document.querySelectorAll('.open-order-modal');
  const modalTitle = document.getElementById('modalDishTitle');
  const modalPrice = document.getElementById('modalDishPrice');
  const expressForm = document.getElementById('expressOrderForm');

  orderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title');
      const price = btn.getAttribute('data-price');

      if (modalTitle) modalTitle.textContent = title;
      if (modalPrice) modalPrice.textContent = price;

      if (orderModal) {
        orderModal.classList.add('active');
        orderModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (closeModal && orderModal) {
    closeModal.addEventListener('click', () => {
      orderModal.classList.remove('active');
      orderModal.setAttribute('aria-hidden', 'true');
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

      window.open(`https://wa.me/21623445536?text=${encodedMsg}`, '_blank');
      orderModal.classList.remove('active');
    });
  }

  /* --------------------------------------------------------------------------
     6. Lightbox Preview Modal for Photo Gallery
     -------------------------------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightbox = document.getElementById('closeLightbox');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      if (src && lightboxImg && lightboxModal) {
        lightboxImg.src = src;
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (closeLightbox && lightboxModal) {
    closeLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
    });
  }

  /* --------------------------------------------------------------------------
     7. Back To Top Floating Action Button
     -------------------------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});
