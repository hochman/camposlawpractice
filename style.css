:root {
  --primary-color: #0c1b33;
  --accent-color: #c9a44c;
  --bg-color: #ffffff;
  --text-color: #333333;
  --font-heading: 'Merriweather', serif;
  --font-body: 'Lato', sans-serif;
}

/* ===== GLOBAL ===== */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--text-color);
  background-color: var(--bg-color);
  scroll-behavior: smooth;
  line-height: 1.6;
}

/* ===== TOPBAR ===== */
.topbar {
  background-color: var(--primary-color);
  color: #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.contact-top {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.contact-item a {
  color: #ddd;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: var(--accent-color);
}

.icon {
  font-size: 1rem;
  line-height: 1;
}

.lang-switch {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

/* SELETOR DE IDIOMAS SUPER MINIMALISTA */
.lang-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.5;
}

.lang-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.lang-btn.active {
  opacity: 1;
  box-shadow: 0 0 0 2px var(--accent-color);
}

.flag-mini {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  object-fit: cover;
  display: block;
}

/* ===== TOPBAR - RESPONSIVE ===== */
@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    padding: 0.8rem 1rem;
    gap: 0.8rem;
    position: relative;
  }

  /* Posiciona seletor de idiomas no topo direito */
  .lang-switch {
    position: absolute;
    top: 0.8rem;
    right: 1rem;
    z-index: 10;
  }

  .contact-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    padding-top: 0.5rem;
  }

  .contact-item span,
  .contact-item a {
    font-size: 0.9rem;
  }
}

/* ===== NAVBAR ===== */
.navbar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 100%;
}

/* Linha dourada abaixo do menu */
.navbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--accent-color);
}

/* Logo e nome */
.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.logo-large {
  height: 70px;
  width: auto;
}

.brand-text h1 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  color: var(--primary-color);
  margin: 0;
}

.brand-text p {
  color: var(--accent-color);
  font-weight: 600;
  margin: 0;
}

/* 🔹 Centralização precisa dos links */
.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  translate: 0 -50%;
  margin: 0;
  padding: 0;
  z-index: 10;
}

.nav-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background-color: var(--accent-color);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-links a:hover {
  color: var(--accent-color);
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(rgba(12,27,51,0.7), rgba(12,27,51,0.7)),
              url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=60') center/cover no-repeat;
  color: white;
  text-align: center;
  padding: 8rem 2rem;
  background-attachment: fixed;
}

.hero-content h1 {
  font-family: var(--font-heading);
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.3rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.btn {
  background-color: var(--accent-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn:hover {
  background-color: #b08f3b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* ===== SECTIONS ===== */
.content-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: auto;
}

/* Backgrounds alternados para melhor divisão visual */
.section-white {
  background-color: #ffffff;
}

.section-gray {
  background-color: #f9f9f9;
}

/* Seções de largura completa para backgrounds */
.section-white,
.section-gray {
  max-width: 100%;
  padding-left: 0;
  padding-right: 0;
}

.section-white > *,
.section-gray > * {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}

.two-column {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.two-column.reverse {
  flex-direction: row-reverse;
}

/* CONTAINER DE IMAGEM PARA MELHOR RESPONSIVIDADE */
.image-container {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-container img {
  width: 100%;
  height: 400px;
  object-fit: cover; /* IMPORTANTE: Mantém proporção e corta adequadamente */
  display: block;
}

/* OCULTAR IMAGENS NO MOBILE */
@media (max-width: 768px) {
  .image-container {
    display: none;
  }
  
  .two-column .text {
    min-width: 100%;
  }
}

.two-column .text {
  flex: 1;
  min-width: 300px;
}

.two-column .text h2 {
  font-family: var(--font-heading);
  color: var(--primary-color);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.two-column .text ul {
  list-style: none;
  padding: 0;
}

.two-column .text ul li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.two-column .text ul li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--accent-color);
  font-weight: bold;
}

.highlight {
  background-color: #f9f9f9;
  border-top: 3px solid var(--accent-color);
  border-bottom: 3px solid var(--accent-color);
  text-align: center;
}

.highlight h2 {
  font-family: var(--font-heading);
  color: var(--primary-color);
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* ===== REVIEWS SECTION ===== */
.reviews-section {
  background-color: #f9f9f9;
  text-align: center;
}

.reviews-section h2 {
  font-family: var(--font-heading);
  color: var(--primary-color);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.reviews-subtitle {
  color: var(--accent-color);
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
}

.reviews-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.review-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.review-card.featured-review {
  border: 2px solid var(--accent-color);
  box-shadow: 0 6px 20px rgba(201, 164, 76, 0.15);
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.google-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  width: fit-content;
  margin: 0 auto 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #5f6368;
}

.google-badge svg {
  flex-shrink: 0;
}

.stars {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffc107;
}

.review-text {
  font-style: italic;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-author {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.google-reviews-link {
  margin-top: 2rem;
}

.btn-review {
  background-color: #4285f4;
  color: white;
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-review:hover {
  background-color: #3367d6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

/* ===== CONTACT ===== */
.contact-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 3rem;
  background-color: #ffffff;
  border-top: 3px solid var(--accent-color);
  border-bottom: 3px solid var(--accent-color);
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-info {
  flex: 1;
  min-width: 280px;
  line-height: 1.8;
}

.contact-info h2 {
  font-family: var(--font-heading);
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 2rem;
}

.contact-info p {
  margin: 0.5rem 0;
  color: var(--text-color);
}

.contact-info a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-info a:hover {
  text-decoration: underline;
  color: var(--primary-color);
}

form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 280px;
}

#contact-form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

#contact-form input,
#contact-form textarea,
#contact-form button {
  width: 100%;
  box-sizing: border-box;
}

#contact-form button {
  padding: 0.8rem;
  background-color: var(--accent-color);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#contact-form button:hover {
  background-color: #b08f3b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

input, textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  font-family: var(--font-body);
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

/* ===== FOOTER ===== */
footer {
  text-align: center;
  padding: 2rem;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.95rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .navbar {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }

  .nav-links {
    position: static;
    transform: none;
    translate: none;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
    gap: 1.5rem;
  }

  .two-column {
    flex-direction: column;
  }

  .two-column.reverse {
    flex-direction: column;
  }

  .image-container {
    max-width: 100%;
  }

  .contact-section {
    flex-direction: column;
  }

  .brand-text h1 {
    font-size: 1.4rem;
  }

  .logo-large {
    height: 55px;
  }

  .hero-content h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 5rem 1.5rem;
    background-attachment: scroll;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .content-section {
    padding: 3rem 1.5rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-links a {
    font-size: 0.9rem;
  }
  
  .review-card {
    padding: 1.8rem;
  }
}

@media (max-width: 400px) {
  .topbar {
    padding: 0.6rem 0.8rem;
  }

  .navbar {
    padding: 0.8rem;
  }

  .brand {
    gap: 0.6rem;
  }

  .logo-large {
    height: 45px;
  }

  .brand-text h1 {
    font-size: 1.2rem;
  }
}
