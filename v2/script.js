let currentLang = 'en';
let i18nData = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // ===== SMOOTH SCROLL =====
  function smoothScrollTo(targetY) {
    const startY = window.scrollY;
    const diff   = targetY - startY;
    const duration = Math.min(Math.max(Math.abs(diff) * 0.4, 400), 900);
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const elapsed  = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + diff * ease);
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function getHeaderHeight() {
    return document.getElementById('site-header').offsetHeight;
  }

  function updateScrollMargins() {
    const h = getHeaderHeight();
    document.querySelectorAll('section[id]').forEach(s => {
      s.style.scrollMarginTop = h + 'px';
    });
  }
  updateScrollMargins();
  window.addEventListener('resize', updateScrollMargins);

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target.getBoundingClientRect().top + window.scrollY - getHeaderHeight());
    });
  });

  // ===== HAMBURGER =====
  const hamburgerBtn  = document.getElementById('hamburger-btn');
  const navLinksList  = document.getElementById('nav-links');

  function closeMenu() {
    navLinksList.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = navLinksList.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => { if (!e.target.closest('.navbar')) closeMenu(); });

  // ===== ACTIVE NAV =====
  function updateActiveNav() {
    const offset   = getHeaderHeight() + 10;
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a[href^="#"]');
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
    let current    = '';
    if (atBottom) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(s => {
        if (s.getBoundingClientRect().top <= offset) current = s.id;
      });
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ===== SCROLL ANIMATIONS =====
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

  // ===== COUNTER ANIMATION =====
  function animateCounter(el) {
    const target   = parseInt(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const duration = 1400;
    const start    = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = '0';
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0' : answer.scrollHeight + 'px';
    });
  });

  // ===== I18N =====
  const enBtn = document.getElementById('en-btn');
  const ptBtn = document.getElementById('pt-btn');

  fetch('languages.json')
    .then(res => res.json())
    .then(data => {
      i18nData = data;
      const keyEls         = document.querySelectorAll('[data-key]');
      const placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
      const i18nEls        = document.querySelectorAll('[data-i18n]');

      const setLanguage = (lang) => {
        currentLang = lang;

        keyEls.forEach(el => {
          const key = el.getAttribute('data-key');
          if (data[lang][key] !== undefined) el.textContent = data[lang][key];
        });
        placeholderEls.forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          if (data[lang][key]) el.placeholder = data[lang][key];
        });
        i18nEls.forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (data[lang][key]) el.textContent = data[lang][key];
        });

        enBtn.classList.toggle('active', lang === 'en');
        ptBtn.classList.toggle('active', lang === 'pt');

        document.querySelectorAll('.review-date[data-date]').forEach(el => {
          el.textContent = getRelativeDate(el.dataset.date);
        });
        document.querySelectorAll('.see-more-btn').forEach(btn => {
          btn.textContent = data[lang]['see-more'];
        });

        // re-set FAQ open heights after text reflow
        document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(btn => {
          btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + 'px';
        });

        // swap news CTA summaries
        document.querySelectorAll('[data-commentary-en]').forEach(el => {
          el.textContent = lang === 'pt' ? (el.dataset.commentaryPt || el.dataset.commentaryEn) : el.dataset.commentaryEn;
        });
      };

      setLanguage('en');
      enBtn.addEventListener('click', () => setLanguage('en'));
      ptBtn.addEventListener('click', () => setLanguage('pt'));
    });
});

// ===== RELATIVE DATE =====
function getRelativeDate(dateStr) {
  const s = (i18nData && i18nData[currentLang]) || {};
  const t = (key, fallback) => s[key] || fallback;
  const diffDays = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diffDays < 1)   return t('date-today', 'Today');
  if (diffDays === 1) return t('date-yesterday', 'Yesterday');
  if (diffDays < 7)   return `${diffDays} ${t('date-days-ago', 'days ago')}`;
  const w = Math.floor(diffDays / 7);
  if (w < 5) return `${w} ${w === 1 ? t('date-week-ago', 'week ago') : t('date-weeks-ago', 'weeks ago')}`;
  const m = Math.round(diffDays / 30.44);
  if (m < 12) return `${m} ${m === 1 ? t('date-month-ago', 'month ago') : t('date-months-ago', 'months ago')}`;
  const y = Math.floor(m / 12);
  return `${y} ${y === 1 ? t('date-year-ago', 'year ago') : t('date-years-ago', 'years ago')}`;
}

// ===== REVIEWS CAROUSEL =====
function initReviewsCarousel(allReviews) {
  const reviews = allReviews
    .filter(r => r.stars === 5)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 15);

  const track        = document.getElementById('reviews-carousel');
  const counterEl    = document.getElementById('carousel-counter');
  const playPauseBtn = document.getElementById('carousel-play-pause');
  const progressBar  = document.getElementById('carousel-progress-bar');
  const iconPause    = playPauseBtn.querySelector('.icon-pause');
  const iconPlay     = playPauseBtn.querySelector('.icon-play');
  let current      = 0;
  let visibleCount = 1;
  let cardWidth    = 0;
  const GAP        = 16;
  let isPlaying    = true;
  let autoInterval;
  const cards      = [];

  const googleSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

  // ── Modal ─────────────────────────────────────────────────────────────────────
  let modal = null;

  function buildModal() {
    const el = document.createElement('div');
    el.className = 'review-modal-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="review-modal-card">
        <button class="review-modal-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="review-modal-header">
          <a class="google-badge review-modal-badge" href="#" target="_blank" rel="noopener noreferrer">${googleSVG}<span>Google Review</span></a>
          <div class="stars review-modal-stars"></div>
        </div>
        <div class="review-modal-body">
          <div class="review-modal-text"></div>
        </div>
        <div class="review-divider"></div>
        <div class="review-footer">
          <div class="review-author-info">
            <div class="review-modal-avatar"></div>
            <span class="review-modal-name review-name"></span>
          </div>
          <span class="review-modal-date review-date"></span>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('.review-modal-close').addEventListener('click', closeModal);
    el.addEventListener('click', e => { if (e.target === el) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    return el;
  }

  function openModal(i) {
    if (!modal) modal = buildModal();
    const r      = reviews[i];
    const imgSrc = r.image ? `img/${r.image}` : null;
    modal.querySelector('.review-modal-badge').href = r.link || '#';
    modal.querySelector('.review-modal-stars').textContent = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
    modal.querySelector('.review-modal-text').innerHTML = '"' + r.review.replace(/\n/g, '<br>') + '"';
    modal.querySelector('.review-modal-name').textContent = r.name;
    const dateEl = modal.querySelector('.review-modal-date');
    dateEl.textContent = getRelativeDate(r.date);
    dateEl.dataset.date = r.date;
    modal.querySelector('.review-modal-avatar').innerHTML = imgSrc
      ? `<img class="review-avatar" src="${imgSrc}" alt="${r.name}" onerror="this.onerror=null;this.style.display='none';">`
      : `<div class="review-avatar review-avatar-fallback">${r.name.charAt(0)}</div>`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    pause();
  }

  function closeModal() {
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Cards ─────────────────────────────────────────────────────────────────────
  reviews.forEach((review, i) => {
    const stars      = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
    const hasText    = review.review && review.review.trim().length > 0;
    const imgSrc     = review.image ? `img/${review.image}` : null;
    const avatarHTML = imgSrc
      ? `<img class="review-avatar" src="${imgSrc}" alt="${review.name}" onerror="this.onerror=null;this.style.display='none';">`
      : `<div class="review-avatar review-avatar-fallback">${review.name.charAt(0)}</div>`;
    const seeMoreLabel = (i18nData && i18nData[currentLang] && i18nData[currentLang]['see-more']) || 'See more';
    const textHTML = hasText ? `
      <div class="review-text-wrapper">
        <div class="review-text">"${review.review.replace(/\n/g, '<br>')}"</div>
        <button class="see-more-btn" style="display:none">${seeMoreLabel}</button>
      </div>` : '';

    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-top">
        <a class="google-badge" href="${review.link}" target="_blank" rel="noopener noreferrer">${googleSVG}<span>Google Review</span></a>
        <div class="stars">${stars}</div>
      </div>
      ${textHTML}
      <div class="review-divider"></div>
      <div class="review-footer">
        <div class="review-author-info">
          ${avatarHTML}
          <span class="review-name">${review.name}</span>
        </div>
        <span class="review-date" data-date="${review.date}">${getRelativeDate(review.date)}</span>
      </div>`;
    track.appendChild(card);
    cards.push(card);

    if (hasText) {
      card.querySelector('.see-more-btn').addEventListener('click', () => openModal(i));
    }
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function checkCardTruncation(card) {
    const textEl     = card.querySelector('.review-text');
    const seeMoreBtn = card.querySelector('.see-more-btn');
    if (!textEl || !seeMoreBtn) return;
    seeMoreBtn.style.display = textEl.scrollHeight > textEl.clientHeight + 4 ? 'block' : 'none';
  }

  function updateLayout(animate) {
    const overflow   = document.querySelector('.carousel-track-overflow');
    const containerW = overflow.offsetWidth;
    visibleCount = window.innerWidth >= 768 ? Math.min(3, reviews.length) : 1;
    cardWidth = (containerW - GAP * (visibleCount - 1)) / visibleCount;
    cards.forEach(c => { c.style.width = cardWidth + 'px'; });
    track.style.gap = GAP + 'px';
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(-${current * (cardWidth + GAP)}px)`;
    if (!animate) setTimeout(() => { track.style.transition = ''; }, 0);
    updateCounter();
    setTimeout(() => { cards.forEach(c => checkCardTruncation(c)); }, 0);
  }

  function updateCounter() {
    if (visibleCount > 1) {
      const last = Math.min(current + visibleCount, reviews.length);
      counterEl.textContent = `${current + 1}–${last} / ${reviews.length}`;
    } else {
      counterEl.textContent = `${current + 1} / ${reviews.length}`;
    }
  }

  function startProgress() {
    progressBar.classList.remove('animating');
    void progressBar.offsetWidth;
    progressBar.classList.add('animating');
  }

  function goTo(index) {
    closeModal();
    const maxIndex = Math.max(0, reviews.length - visibleCount);
    current = ((index % reviews.length) + reviews.length) % reviews.length;
    if (current > maxIndex) current = 0;
    track.style.transform = `translateX(-${current * (cardWidth + GAP)}px)`;
    updateCounter();
    if (isPlaying) startProgress();
  }

  function play() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => goTo(current + 1), 10000);
    isPlaying = true;
    iconPause.style.display = 'block';
    iconPlay.style.display  = 'none';
    playPauseBtn.setAttribute('aria-label', 'Pause carousel');
    startProgress();
  }

  function pause() {
    clearInterval(autoInterval);
    isPlaying = false;
    iconPause.style.display = 'none';
    iconPlay.style.display  = 'block';
    playPauseBtn.setAttribute('aria-label', 'Play carousel');
    progressBar.classList.remove('animating');
  }

  playPauseBtn.addEventListener('click', () => isPlaying ? pause() : play());
  document.querySelector('.carousel-prev').addEventListener('click', () => { goTo(current - 1); pause(); });
  document.querySelector('.carousel-next').addEventListener('click', () => { goTo(current + 1); pause(); });

  setTimeout(() => { updateLayout(false); play(); }, 0);
  window.addEventListener('resize', () => { updateLayout(false); });
}

fetch('reviews.json')
  .then(res => res.json())
  .then(reviews => initReviewsCarousel(reviews));

// ===== NEWS CTA (main page preview) =====
const NEWS_CAT_COLORS = {
  'Visas':               '#1a6cf5',
  'Law & Policy':        '#7c3aed',
  'Work Visas':          '#059669',
  'Student Visas':       '#d97706',
  'Permanent Residency': '#b45309',
  'General':             '#64748b',
};

(function loadNewsCta() {
  const grid  = document.getElementById('news-cta-grid');
  const empty = document.getElementById('news-cta-empty');
  if (!grid) return;

  fetch('news.json')
    .then(r => r.json())
    .then(data => {
      const items = (data.items || []).slice(0, 3);
      if (items.length === 0) { empty.style.display = 'block'; return; }
      items.forEach(item => {
        const color = NEWS_CAT_COLORS[item.category] || '#64748b';
        const card  = document.createElement('a');
        card.className = 'news-cta-card';
        card.href = item.link;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        const summaryEn = item.commentary || '';
        const summaryPt = item.commentary_pt || summaryEn;
        const summary = summaryEn ? `<span class="news-cta-card-summary" data-commentary-en="${summaryEn.replace(/"/g,'&quot;')}" data-commentary-pt="${summaryPt.replace(/"/g,'&quot;')}">${currentLang === 'pt' ? summaryPt : summaryEn}</span>` : '';
        card.innerHTML = `
          <span class="news-cat-badge" style="--cat-color:${color}">${item.category}</span>
          <span class="news-cta-card-title">${item.title}</span>
          <span class="news-cta-card-source">${item.source}</span>
          ${summary}
          <span class="news-card-link">
            Read original article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </span>`;
        grid.appendChild(card);
      });
    })
    .catch(() => { empty.style.display = 'block'; });
})();

// ===== CONTACT FORM =====
var form = document.getElementById('contact-form');

document.getElementById('form-referrer').value = document.referrer || 'direct';

(function collectVisitorMetadata() {
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/'))    return 'Edge';
    if (ua.includes('OPR/'))    return 'Opera';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/'))return 'Firefox';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Other';
  }
  function getDevice() {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua))                    return 'Tablet';
    if (/Mobi|Android|iPhone/.test(ua))     return 'Mobile';
    return 'Desktop';
  }

  document.getElementById('form-browser').value     = getBrowser();
  document.getElementById('form-device-type').value = getDevice() + ' — ' + window.screen.width + 'x' + window.screen.height;

  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => {
      document.getElementById('form-ip').value      = d.ip           || 'unavailable';
      document.getElementById('form-country').value = d.country_name || 'unavailable';
    })
    .catch(() => {
      document.getElementById('form-ip').value      = 'unavailable';
      document.getElementById('form-country').value = 'unavailable';
    });
})();

function getValidationMessage(field) {
  const s = (i18nData && i18nData[currentLang]) || {};
  if (field.validity.typeMismatch) return s['form-invalid-email'] || 'Please enter a valid email address.';
  return s['form-required'] || 'Please fill in this field.';
}

form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('invalid', () => field.setCustomValidity(getValidationMessage(field)));
  field.addEventListener('input',   () => field.setCustomValidity(''));
});

const referralSelect = document.getElementById('how-did-you-hear');
const referralOther  = document.getElementById('how-did-you-hear-other');

referralSelect.style.color = '#94a3b8';
referralSelect.addEventListener('change', () => {
  referralSelect.style.color = referralSelect.value ? 'var(--text)' : '#94a3b8';
  const isOther = referralSelect.value === 'other';
  referralOther.style.display = isOther ? 'block' : 'none';
  referralOther.required      = isOther;
});

var statusTimer = null;
function showStatus(message, type) {
  var status = document.getElementById('my-form-status');
  clearTimeout(statusTimer);
  status.className = '';
  status.innerHTML = message;
  void status.offsetWidth;
  status.className = 'visible status-' + type;
  statusTimer = setTimeout(() => {
    status.classList.remove('visible');
    setTimeout(() => { status.innerHTML = ''; status.className = ''; }, 500);
  }, 5000);
}

async function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: { 'Accept': 'application/json' }
  }).then(response => {
    const s = (i18nData && i18nData[currentLang]) || {};
    if (response.ok) {
      showStatus(s['form-success'] || 'Thank you! We will be in touch soon.', 'success');
      form.reset();
      referralSelect.style.color = '#94a3b8';
      referralOther.style.display = 'none';
      referralOther.required = false;
    } else {
      response.json().then(data => {
        const msg = Object.hasOwn(data, 'errors')
          ? data.errors.map(e => e.message).join(', ')
          : (s['form-error'] || 'Something went wrong. Please try again.');
        showStatus(msg, 'error');
      });
    }
  }).catch(() => {
    const s = (i18nData && i18nData[currentLang]) || {};
    showStatus(s['form-error'] || 'Something went wrong. Please try again.', 'error');
  });
}

form.addEventListener('submit', handleSubmit);
