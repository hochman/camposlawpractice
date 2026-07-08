let currentLang = 'en';
let i18nData = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  function smoothScrollTo(targetY) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const duration = Math.min(Math.max(Math.abs(diff) * 0.4, 400), 900);
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + diff * ease);
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function getHeaderHeight() {
    return document.querySelector('.top-header').offsetHeight;
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
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target.getBoundingClientRect().top + window.scrollY - getHeaderHeight());
    });
  });

  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinksList = document.querySelector('.nav-links');

  function closeMenu() {
    navLinksList.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinksList.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) closeMenu();
  });

  function updateActiveNav() {
    const offset = getHeaderHeight() + 10;
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    let current = '';
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
    if (atBottom) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= offset) current = section.id;
      });
    }
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  const enBtn = document.getElementById("en-btn");
  const ptBtn = document.getElementById("pt-btn");

  fetch("languages.json")
    .then(res => res.json())
    .then(data => {
      i18nData = data;
      const elements = document.querySelectorAll("[data-key]");

      const setLanguage = (lang) => {
        currentLang = lang;

        elements.forEach(el => {
          const key = el.getAttribute("data-key");
          if (data[lang][key]) el.textContent = data[lang][key];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
          const key = el.getAttribute("data-i18n-placeholder");
          if (data[lang][key]) el.placeholder = data[lang][key];
        });
        document.querySelectorAll("[data-i18n]").forEach(el => {
          const key = el.getAttribute("data-i18n");
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
        document.querySelectorAll('.see-less-btn').forEach(btn => {
          btn.textContent = data[lang]['see-less'];
        });
      };

      setLanguage("en");
      enBtn.addEventListener("click", () => setLanguage("en"));
      ptBtn.addEventListener("click", () => setLanguage("pt"));
    });
});

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
  let expandedIndex = null;
  const cards = [];

  const googleSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

  reviews.forEach((review, i) => {
    const stars   = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
    const hasText = review.review && review.review.trim().length > 0;
    const imgSrc  = review.image ? `img/${review.image}` : null;

    const avatarHTML = imgSrc
      ? `<img class="review-avatar" src="${imgSrc}" alt="${review.name}" onerror="this.onerror=null;this.style.display='none';">`
      : `<div class="review-avatar review-avatar-fallback">${review.name.charAt(0)}</div>`;

    const seeMoreLabel = (i18nData && i18nData[currentLang] && i18nData[currentLang]['see-more']) || 'See more';
    const seeLessLabel = (i18nData && i18nData[currentLang] && i18nData[currentLang]['see-less']) || 'See less';

    const textHTML = hasText ? `
      <div class="review-text-wrapper">
        <div class="review-text">"${review.review.replace(/\n/g, '<br>')}"</div>
        <button class="see-more-btn" style="display:none">${seeMoreLabel}</button>
        <button class="see-less-btn" style="display:none">${seeLessLabel}</button>
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
      card.querySelector('.see-more-btn').addEventListener('click', () => expandCard(i));
      card.querySelector('.see-less-btn').addEventListener('click', collapseExpanded);
    }
  });

  function checkCardTruncation(card) {
    const textEl     = card.querySelector('.review-text');
    const seeMoreBtn = card.querySelector('.see-more-btn');
    if (!textEl || !seeMoreBtn) return;
    if (cards.indexOf(card) === expandedIndex) return;
    const truncated = textEl.scrollHeight > textEl.clientHeight + 4;
    card.dataset.needsTruncation = String(truncated);
    seeMoreBtn.style.display = truncated ? 'block' : 'none';
  }

  function expandCard(i) {
    if (expandedIndex !== null && expandedIndex !== i) collapseExpanded();
    if (expandedIndex === i) return;
    expandedIndex = i;
    pause();

    const card       = cards[i];
    const overflow   = document.querySelector('.carousel-track-overflow');
    const containerW = overflow.offsetWidth;
    const textEl     = card.querySelector('.review-text');
    const seeMoreBtn = card.querySelector('.see-more-btn');
    const seeLessBtn = card.querySelector('.see-less-btn');

    if (visibleCount > 1) card.style.width = containerW + 'px';
    if (textEl) textEl.classList.add('expanded');
    if (seeMoreBtn) seeMoreBtn.style.display = 'none';
    if (seeLessBtn) seeLessBtn.style.display = 'block';

    current = i;
    track.style.transform = `translateX(-${i * (cardWidth + GAP)}px)`;
    updateCounter();
  }

  function collapseExpanded() {
    if (expandedIndex === null) return;
    const i    = expandedIndex;
    const card = cards[i];
    expandedIndex = null;

    const textEl     = card.querySelector('.review-text');
    const seeMoreBtn = card.querySelector('.see-more-btn');
    const seeLessBtn = card.querySelector('.see-less-btn');

    card.style.width = cardWidth + 'px';
    if (textEl) textEl.classList.remove('expanded');
    if (seeLessBtn) seeLessBtn.style.display = 'none';
    if (seeMoreBtn && card.dataset.needsTruncation === 'true') seeMoreBtn.style.display = 'block';

    const maxIndex = Math.max(0, reviews.length - visibleCount);
    current = Math.min(i, maxIndex);
    track.style.transform = `translateX(-${current * (cardWidth + GAP)}px)`;
    updateCounter();
  }

  function updateLayout(animate) {
    if (expandedIndex !== null) {
      const card = cards[expandedIndex];
      const textEl  = card.querySelector('.review-text');
      const seeLess = card.querySelector('.see-less-btn');
      if (textEl) textEl.classList.remove('expanded');
      if (seeLess) seeLess.style.display = 'none';
      card.style.width = '';
      expandedIndex = null;
    }

    const overflow   = document.querySelector('.carousel-track-overflow');
    const containerW = overflow.offsetWidth;
    visibleCount = window.innerWidth >= 768 ? Math.min(3, reviews.length) : 1;
    cardWidth = (containerW - GAP * (visibleCount - 1)) / visibleCount;
    cards.forEach(c => { c.style.width = cardWidth + 'px'; });
    track.style.gap = GAP + 'px';
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(-${current * (cardWidth + GAP)}px)`;
    if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });
    updateCounter();
    requestAnimationFrame(() => { cards.forEach(c => checkCardTruncation(c)); });
  }

  function updateCounter() {
    counterEl.textContent = `${current + 1} / ${reviews.length}`;
  }

  function startProgress() {
    progressBar.classList.remove('animating');
    void progressBar.offsetWidth;
    progressBar.classList.add('animating');
  }

  function goTo(index) {
    collapseExpanded();
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

  requestAnimationFrame(() => requestAnimationFrame(() => {
    updateLayout(false);
    play();
  }));
  window.addEventListener('resize', () => { updateLayout(false); });
}

fetch('reviews.json')
  .then(res => res.json())
  .then(reviews => initReviewsCarousel(reviews));

var form = document.getElementById("contact-form");

document.getElementById("form-referrer").value = document.referrer || "direct";

(function collectVisitorMetadata() {
  const ua = navigator.userAgent;

  function getBrowser() {
    if (/Edg\//.test(ua))     return "Edge "    + (ua.match(/Edg\/([\d.]+)/)     || ["","?"])[1];
    if (/OPR\//.test(ua))     return "Opera "   + (ua.match(/OPR\/([\d.]+)/)     || ["","?"])[1];
    if (/Chrome\//.test(ua))  return "Chrome "  + (ua.match(/Chrome\/([\d.]+)/)  || ["","?"])[1];
    if (/Firefox\//.test(ua)) return "Firefox " + (ua.match(/Firefox\/([\d.]+)/) || ["","?"])[1];
    if (/Safari\//.test(ua))  return "Safari "  + (ua.match(/Version\/([\d.]+)/) || ["","?"])[1];
    return "Unknown";
  }

  function getDevice() {
    if (/iPad/.test(ua))              return "Tablet";
    if (/Mobi|Android|iPhone/.test(ua)) return "Mobile";
    return "Desktop";
  }

  document.getElementById("form-browser").value     = getBrowser();
  document.getElementById("form-device-type").value = getDevice() + " — " + window.screen.width + "x" + window.screen.height;

  fetch("https://ipapi.co/json/")
    .then(r => r.json())
    .then(d => {
      document.getElementById("form-ip").value      = d.ip      || "unavailable";
      document.getElementById("form-country").value = d.country_name || "unavailable";
    })
    .catch(() => {
      document.getElementById("form-ip").value      = "unavailable";
      document.getElementById("form-country").value = "unavailable";
    });
})();

var statusTimer = null;

function showStatus(message, type) {
  var status = document.getElementById("my-form-status");
  clearTimeout(statusTimer);
  status.className = "";
  status.innerHTML = message;
  void status.offsetWidth;
  status.className = "visible status-" + type;
  statusTimer = setTimeout(() => {
    status.classList.remove("visible");
    setTimeout(() => { status.innerHTML = ""; status.className = ""; }, 500);
  }, 5000);
}

async function handleSubmit(event) {
  event.preventDefault();
  var data = new FormData(event.target);
  const s = (i18nData && i18nData[currentLang]) || {};
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: { 'Accept': 'application/json' }
  }).then(response => {
    if (response.ok) {
      showStatus(s['form-success'] || "Thanks for your submission!", "success");
      form.reset();
      referralOther.style.display = "none";
      referralOther.required = false;
      referralSelect.style.color = "#757575";
    } else {
      response.json().then(data => {
        const msg = Object.hasOwn(data, 'errors')
          ? data["errors"].map(e => e["message"]).join(", ")
          : (s['form-error'] || "Oops! There was a problem submitting your form");
        showStatus(msg, "error");
      });
    }
  }).catch(() => {
    showStatus(s['form-error'] || "Oops! There was a problem submitting your form", "error");
  });
}

function getValidationMessage(field) {
  const s = (i18nData && i18nData[currentLang]) || {};
  if (field.validity.typeMismatch) return s['form-invalid-email'] || 'Please enter a valid email address.';
  return s['form-required'] || 'Please fill in this field.';
}

form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('invalid', () => field.setCustomValidity(getValidationMessage(field)));
  field.addEventListener('input',   () => field.setCustomValidity(''));
});

const referralSelect = document.getElementById("how-did-you-hear");
const referralOther = document.getElementById("how-did-you-hear-other");

referralOther.addEventListener('invalid', () => referralOther.setCustomValidity(getValidationMessage(referralOther)));
referralOther.addEventListener('input',   () => referralOther.setCustomValidity(''));

referralSelect.style.color = "#757575";

referralSelect.addEventListener("change", () => {
  referralSelect.style.color = referralSelect.value ? "var(--text-color)" : "#757575";
  const isOther = referralSelect.value === "other";
  referralOther.style.display = isOther ? "block" : "none";
  referralOther.required = isOther;
});

form.addEventListener("submit", handleSubmit);
