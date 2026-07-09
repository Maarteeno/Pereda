(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v33';
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var IDLE_RESET_MS = 60000;
  var REVIEW_INTERVAL_MS = 5000;
  var SECTION_AUTO_MS = 5000;
  var FAQ_INTERVAL_MS = 5000;
  var VEHICLE_ROTATE_MS = 8000;
  var TOTAL_SECTIONS = 5;

  var activeLang = 'es';
  var currentSection = 0;
  var idleTimer = null;
  var sectionAutoTimer = null;
  var vehicleRotateTimer = null;
  var reviewTimer = null;
  var faqTimer = null;
  var temporaryAutoplayTimer = null;
  var autoplayPaused = false;
  var shuffledReviews = [];
  var shuffleIndex = 0;
  var lastReviewText = '';
  var faqIndex = 0;
  var currentVehicleView = 0;
  var swRegistration = null;
  var sectionObserver = null;
  var isProgrammaticScroll = false;
  var lastScrollTop = 0;
  var touchAutoplayHold = 0;
  var touchResumeTimer = null;

  var translations = {
    es: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Traslados',
      vehicleBadge: '100% Eléctrico',
      comfortSubtitle: 'Por qué viajar en Bestune',
      driverName: 'Adrián',
      driverRole: 'Conductor Profesional. Montevideo y La Costa',
      uberLabel: 'Valoración Uber',
      uberRating: '4.99',
      tripsLabel: 'Viajes realizados',
      tripsCount: '+40.000',
      yearsLabel: 'Años de servicio',
      yearsValue: '9,5',
      comfortItems: [
        { icon: '🧳', title: 'Espacio amplio', desc: 'Maletero generoso para valijas y equipaje' },
        { icon: '🚪', title: 'Puerta corrediza', desc: 'Acceso cómodo y rápido al vehículo' },
        { icon: '🔇', title: 'Viaje silencioso', desc: 'Sin motor ni vibraciones a bordo' },
        { icon: '❄️', title: 'Climatización', desc: 'Confort térmico durante todo el año' },
        { icon: '💺', title: 'Asientos amplios', desc: 'Viaje relajado en trayectos largos' },
        { icon: '🌿', title: '100% eléctrico', desc: 'Aire limpio y conducción suave' }
      ],
      qrLabel: 'Escribile por WhatsApp',
      qrAction: 'Abrir WhatsApp',
      fabLabel: 'WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Traslados privados y seguros',
      introSubtitle: 'Reservá directo con Adrián',
      spotSectionTitle: 'Traslados turísticos',
      touristIntro: 'Próximamente fotos de destinos',
      touristCities: [
        { name: 'Montevideo', spots: ['Estadio Centenario', 'Rambla de Montevideo', 'Parque Rodó'] },
        { name: 'Punta del Este', spots: ['La Mano', 'Playa Brava', 'Puerto de Punta'] },
        { name: 'Colonia', spots: ['Barrio Histórico', 'Faro de Colonia', 'Calle de los Suspiros'] }
      ],
      finalCtaLabel: '¿Listo para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nueva versión disponible',
      updateGateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateGateAction: 'Actualizar ahora',
      reviewLabel: 'Lo dicen los pasajeros',
      faqTitle: 'Preguntas frecuentes',
      faqItems: [
        { q: '¿Cómo reservo un traslado?', a: 'Escribile por WhatsApp o escaneá el código QR en la primera pantalla.' },
        { q: '¿Aceptan equipaje grande?', a: 'Sí, el Bestune NAT tiene maletero amplio para valijas y equipaje.' },
        { q: '¿Viajan con mascotas?', a: 'Consultá por WhatsApp según el tamaño y tipo de mascota.' },
        { q: '¿Formas de pago?', a: 'Efectivo, transferencia bancaria y tarjeta.' },
        { q: '¿Seguimiento de vuelo?', a: 'Sí, incluido en traslados al aeropuerto de Carrasco.' },
        { q: '¿Cancelaciones?', a: 'Avisá con anticipación para reprogramar sin inconvenientes.' }
      ]
    },
    en: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Transport',
      vehicleBadge: '100% Electric',
      comfortSubtitle: 'Why ride in a Bestune',
      driverName: 'Adrián',
      driverRole: 'Professional Driver. Montevideo and the Coast',
      uberLabel: 'Uber rating',
      uberRating: '4.99',
      tripsLabel: 'Trips completed',
      tripsCount: '40,000+',
      yearsLabel: 'Years of service',
      yearsValue: '9.5',
      comfortItems: [
        { icon: '🧳', title: 'Room for luggage', desc: 'Generous trunk space for suitcases and bags' },
        { icon: '🚪', title: 'Sliding door', desc: 'Easy and quick access to the vehicle' },
        { icon: '🔇', title: 'Quiet ride', desc: 'No engine noise or vibrations onboard' },
        { icon: '❄️', title: 'Climate control', desc: 'Comfortable temperature all year round' },
        { icon: '💺', title: 'Spacious seats', desc: 'Relaxed travel on long journeys' },
        { icon: '🌿', title: '100% electric', desc: 'Clean air and smooth driving' }
      ],
      qrLabel: 'Message on WhatsApp',
      qrAction: 'Open WhatsApp',
      fabLabel: 'WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Private and reliable transfers',
      introSubtitle: 'Book directly with Adrián',
      spotSectionTitle: 'Tourist transfers',
      touristIntro: 'Destination photos coming soon',
      touristCities: [
        { name: 'Montevideo', spots: ['Estadio Centenario', 'Montevideo Waterfront', 'Parque Rodó'] },
        { name: 'Punta del Este', spots: ['La Mano', 'Brava Beach', 'Punta del Este Port'] },
        { name: 'Colonia', spots: ['Historic Quarter', 'Colonia Lighthouse', 'Street of Sighs'] }
      ],
      finalCtaLabel: 'Ready to book?',
      finalCtaAction: 'Open WhatsApp',
      updateGateTitle: 'New version available',
      updateGateText: 'An app update is ready. Refresh to see the latest layout.',
      updateGateAction: 'Update now',
      reviewLabel: 'What passengers say',
      faqTitle: 'Frequently asked questions',
      faqItems: [
        { q: 'How do I book a transfer?', a: 'Message on WhatsApp or scan the QR code on the first screen.' },
        { q: 'Do you accept large luggage?', a: 'Yes, the Bestune NAT has ample trunk space for suitcases.' },
        { q: 'Do you travel with pets?', a: 'Ask via WhatsApp depending on size and type of pet.' },
        { q: 'Payment methods?', a: 'Cash, bank transfer and card.' },
        { q: 'Flight tracking?', a: 'Yes, included for Carrasco airport transfers.' },
        { q: 'Cancellations?', a: 'Let us know in advance to reschedule without issues.' }
      ]
    },
    pt: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Transporte',
      vehicleBadge: '100% Elétrico',
      comfortSubtitle: 'Por que viajar na Bestune',
      driverName: 'Adrián',
      driverRole: 'Motorista Profissional. Montevidéu e o Litoral',
      uberLabel: 'Avaliação Uber',
      uberRating: '4.99',
      tripsLabel: 'Viagens realizadas',
      tripsCount: '+40.000',
      yearsLabel: 'Anos de serviço',
      yearsValue: '9,5',
      comfortItems: [
        { icon: '🧳', title: 'Espaço amplo', desc: 'Porta-malas generoso para malas e bagagens' },
        { icon: '🚪', title: 'Porta corrediça', desc: 'Acesso confortável e rápido ao veículo' },
        { icon: '🔇', title: 'Viagem silenciosa', desc: 'Sem motor nem vibrações a bordo' },
        { icon: '❄️', title: 'Climatização', desc: 'Conforto térmico durante todo o ano' },
        { icon: '💺', title: 'Assentos amplos', desc: 'Viagem relaxada em trajetos longos' },
        { icon: '🌿', title: '100% elétrico', desc: 'Ar limpo e condução suave' }
      ],
      qrLabel: 'Escreva no WhatsApp',
      qrAction: 'Abrir WhatsApp',
      fabLabel: 'WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Transfers privados e seguros',
      introSubtitle: 'Reserve direto com Adrián',
      spotSectionTitle: 'Traslados turísticos',
      touristIntro: 'Em breve fotos dos destinos',
      touristCities: [
        { name: 'Montevidéu', spots: ['Estádio Centenário', 'Rambla de Montevidéu', 'Parque Rodó'] },
        { name: 'Punta del Este', spots: ['La Mano', 'Playa Brava', 'Porto de Punta del Este'] },
        { name: 'Colonia', spots: ['Bairro Histórico', 'Farol de Colonia', 'Calle de los Suspiros'] }
      ],
      finalCtaLabel: 'Pronto para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nova versão disponível',
      updateGateText: 'Há uma atualização do app. Atualize para ver o layout mais recente.',
      updateGateAction: 'Atualizar agora',
      reviewLabel: 'O que dizem os passageiros',
      faqTitle: 'Perguntas frequentes',
      faqItems: [
        { q: 'Como reservo um transfer?', a: 'Escreva no WhatsApp ou escaneie o código QR na primeira tela.' },
        { q: 'Aceitam bagagem grande?', a: 'Sim, o Bestune NAT tem porta-malas amplo para malas.' },
        { q: 'Viajam com animais de estimação?', a: 'Consulte pelo WhatsApp conforme tamanho e tipo.' },
        { q: 'Formas de pagamento?', a: 'Dinheiro, transferência bancária e cartão.' },
        { q: 'Acompanhamento de voo?', a: 'Sim, incluído em transfers para o aeroporto de Carrasco.' },
        { q: 'Cancelamentos?', a: 'Avise com antecedência para reagendar sem problemas.' }
      ]
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  function detectLanguage() {
    var saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && translations[saved]) return saved;
    var browserLang = (navigator.language || 'es').toLowerCase();
    if (browserLang.indexOf('pt') === 0) return 'pt';
    if (browserLang.indexOf('en') === 0) return 'en';
    return 'es';
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    activeLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    reshuffleReviews();
    renderTranslations(lang);
    resetIdleTimer();
  }

  function renderTranslations(lang) {
    var t = translations[lang];
    var i;

    setText('brand-name', t.brandName);
    setText('header-subtitle', t.headerSubtitle);
    setText('vehicle-badge', t.vehicleBadge);
    setText('intro-title', t.introTitle);
    setText('intro-subtitle', t.introSubtitle);
    setText('comfort-subtitle', t.comfortSubtitle);
    setText('driver-name', t.driverName);
    setText('driver-role', t.driverRole);
    setText('uber-label', t.uberLabel);
    setText('uber-rating', t.uberRating);
    setText('trips-label', t.tripsLabel);
    setText('trips-count', t.tripsCount);
    setText('years-label', t.yearsLabel);
    setText('years-value', t.yearsValue);

    for (i = 0; i < t.comfortItems.length; i++) {
      setText('benefit-icon-' + (i + 1), t.comfortItems[i].icon);
      setText('benefit-title-' + (i + 1), t.comfortItems[i].title);
      setText('benefit-desc-' + (i + 1), t.comfortItems[i].desc);
    }

    setText('qr-label', t.qrLabel);
    setText('qr-action-btn', t.qrAction);
    setText('vehicle-qr-phone', t.phoneNumber);
    setText('final-cta-label', t.finalCtaLabel);
    setText('final-cta-action', t.finalCtaAction);
    setText('whatsapp-fab', t.fabLabel);
    setText('update-gate-title', t.updateGateTitle);
    setText('update-gate-text', t.updateGateText);
    setText('update-gate-btn', t.updateGateAction);
    setText('spot-section-title', t.spotSectionTitle);
    setText('tourist-intro', t.touristIntro);
    setText('review-gallery-title', t.reviewLabel);
    setText('faq-title', t.faqTitle);

    renderTouristCities();
    renderFaqDots();
    showFaq(faqIndex, false);
    showReview(shuffleIndex, false);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
  }

  function updateScrollProgress() {
    var scrollEl = $('page-scroll');
    if (!scrollEl) return;
    var max = scrollEl.scrollHeight - scrollEl.clientHeight;
    var pct = max > 0 ? (scrollEl.scrollTop / max) * 100 : 0;
    var fill = $('section-progress-fill');
    if (fill) fill.style.width = pct + '%';
  }

  function updateHeroParallax() {
    var scrollEl = $('page-scroll');
    var heroScene = $('vehicle-hero-scene');
    if (!scrollEl || !heroScene) return;
    var offset = Math.min(scrollEl.scrollTop * 0.15, 60);
    heroScene.style.setProperty('--hero-parallax', offset + 'px');
  }

  function pauseAutoplayForTouch() {
    touchAutoplayHold += 1;
    clearTimeout(touchResumeTimer);
    pauseAutoplay();
  }

  function resumeAutoplayAfterTouch() {
    touchAutoplayHold = Math.max(0, touchAutoplayHold - 1);
    if (touchAutoplayHold > 0) return;
    clearTimeout(touchResumeTimer);
    touchResumeTimer = setTimeout(function () {
      if (touchAutoplayHold === 0) resumeAutoplay();
    }, 300);
  }

  function getSectionEl(index) {
    return document.querySelector('.page-section[data-section="' + index + '"]');
  }

  function scrollToSection(index, behavior) {
    if (index < 0) index = TOTAL_SECTIONS - 1;
    else if (index >= TOTAL_SECTIONS) index = 0;

    var section = getSectionEl(index);
    if (!section) return;

    isProgrammaticScroll = true;
    section.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
    setActiveSection(index);
    resetIdleTimer();
    setTimeout(function () {
      isProgrammaticScroll = false;
      lastScrollTop = ($('page-scroll') || {}).scrollTop || 0;
    }, 600);
  }

  function setActiveSection(index) {
    currentSection = index;

    document.querySelectorAll('.section-dot').forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    var fab = $('whatsapp-fab');
    if (fab) fab.hidden = index < 1;

    if (index === 2) startReviewRotation();
    else stopReviewRotation();

    if (index === 4) startFaqRotation();
    else stopFaqRotation();
  }

  function setupSectionObserver() {
    var scrollEl = $('page-scroll');
    if (!scrollEl || !('IntersectionObserver' in window)) return;

    if (sectionObserver) sectionObserver.disconnect();

    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;
        var index = parseInt(entry.target.getAttribute('data-section'), 10);
        if (!isNaN(index) && index !== currentSection) {
          setActiveSection(index);
        }
      });
    }, { root: scrollEl, threshold: [0.6, 0.75, 0.9] });

    document.querySelectorAll('.page-section').forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function pauseAutoplay() {
    clearTimeout(temporaryAutoplayTimer);
    autoplayPaused = true;
    stopSectionAutoAdvance();
  }

  function resumeAutoplay() {
    clearTimeout(temporaryAutoplayTimer);
    autoplayPaused = false;
    startSectionAutoAdvance();
  }

  function pauseAutoplayTemporarily(delay) {
    clearTimeout(temporaryAutoplayTimer);
    autoplayPaused = true;
    stopSectionAutoAdvance();
    temporaryAutoplayTimer = setTimeout(function () {
      resumeAutoplay();
    }, delay || 5000);
  }

  function startSectionAutoAdvance() {
    stopSectionAutoAdvance();
    if (autoplayPaused) return;
    sectionAutoTimer = setInterval(function () {
      if (autoplayPaused) return;
      scrollToSection(currentSection + 1);
    }, SECTION_AUTO_MS);
  }

  function stopSectionAutoAdvance() {
    clearInterval(sectionAutoTimer);
    sectionAutoTimer = null;
  }

  function startVehicleRotation() {
    stopVehicleRotation();
    vehicleRotateTimer = setInterval(function () {
      currentVehicleView = (currentVehicleView + 1) % 3;
      document.querySelectorAll('.vehicle-view').forEach(function (view, i) {
        view.classList.toggle('active', i === currentVehicleView);
      });
    }, VEHICLE_ROTATE_MS);
  }

  function stopVehicleRotation() {
    clearInterval(vehicleRotateTimer);
    vehicleRotateTimer = null;
  }

  function getReviews() {
    var data = window.PASSENGER_REVIEWS || {};
    return data[activeLang] || data.es || [];
  }

  function shuffleArray(items) {
    var deck = items.slice();
    var i = deck.length;
    var j;
    var temp;
    while (i > 0) {
      j = Math.floor(Math.random() * i);
      i -= 1;
      temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  }

  function reshuffleReviews() {
    var source = getReviews();
    if (!source.length) {
      shuffledReviews = [];
      shuffleIndex = 0;
      return;
    }
    shuffledReviews = shuffleArray(source);
    if (shuffledReviews.length > 1 && shuffledReviews[0].text === lastReviewText) {
      var swap = shuffledReviews[0];
      shuffledReviews[0] = shuffledReviews[1];
      shuffledReviews[1] = swap;
    }
    shuffleIndex = 0;
  }

  function authorInitials(author) {
    if (!author) return '?';
    var parts = author.replace(/[.—\-]/g, '').trim().split(/\s+/);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function isDualCardLayout() {
    var scrollEl = $('page-scroll');
    var slideHeight = scrollEl ? scrollEl.clientHeight : window.innerHeight;
    return slideHeight >= 560;
  }

  function isDualReviewLayout() {
    return isDualCardLayout();
  }

  function fillReviewCard(slot, review, animate) {
    if (!review) return;

    var textEl = $('gallery-review-text-' + slot);
    var authorEl = $('gallery-review-author-' + slot);
    var avatarEl = $('review-author-avatar-' + slot);
    var card = $('review-kiosk-card-' + slot);

    function applyReview() {
      if (textEl) {
        textEl.textContent = review.text;
        textEl.classList.remove('is-fading');
      }
      if (authorEl) {
        authorEl.textContent = '— ' + review.author;
        authorEl.classList.remove('is-fading');
      }
      if (avatarEl) avatarEl.textContent = authorInitials(review.author);
      if (card) card.classList.remove('is-fading');
    }

    if (animate === false) {
      applyReview();
      return;
    }

    if (textEl) textEl.classList.add('is-fading');
    if (authorEl) authorEl.classList.add('is-fading');
    if (card) card.classList.add('is-fading');
    setTimeout(applyReview, 320);
  }

  function updateReviewSecondaryVisibility() {
    var secondary = $('review-kiosk-card-1');
    if (!secondary) return;
    var showDual = isDualReviewLayout();
    secondary.hidden = !showDual;
  }

  function showReview(index, animate) {
    if (!shuffledReviews.length) reshuffleReviews();
    if (!shuffledReviews.length) return;

    var len = shuffledReviews.length;
    if (index >= len || index < 0) {
      reshuffleReviews();
      index = 0;
      len = shuffledReviews.length;
    }

    shuffleIndex = index;
    lastReviewText = shuffledReviews[index].text;

    updateReviewSecondaryVisibility();
    fillReviewCard(0, shuffledReviews[index], animate);

    if (isDualReviewLayout()) {
      var nextIndex = index + 1;
      if (nextIndex >= len) nextIndex = 0;
      fillReviewCard(1, shuffledReviews[nextIndex], animate);
    }
  }

  function nextReview() {
    var len = shuffledReviews.length;
    if (!len) return;
    var next = shuffleIndex + 1;
    if (next >= len) {
      reshuffleReviews();
      next = 0;
    }
    showReview(next, true);
  }

  function prevReview() {
    var len = shuffledReviews.length;
    if (!len) return;
    var prev = shuffleIndex - 1;
    if (prev < 0) prev = len - 1;
    showReview(prev, true);
  }

  function startReviewRotation() {
    stopReviewRotation();
    reviewTimer = setInterval(nextReview, REVIEW_INTERVAL_MS);
  }

  function stopReviewRotation() {
    clearInterval(reviewTimer);
    reviewTimer = null;
  }

  function renderTouristCities() {
    var t = translations[activeLang];
    var container = $('tourist-cities');
    if (!container || !t.touristCities) return;

    container.innerHTML = t.touristCities.map(function (city) {
      var spotsHtml = city.spots.map(function (spot) {
        return '<li class="tourist-spot">' + spot + '</li>';
      }).join('');
      return (
        '<div class="tourist-city">' +
          '<h3 class="tourist-city-name">' + city.name + '</h3>' +
          '<ul class="tourist-spots">' + spotsHtml + '</ul>' +
        '</div>'
      );
    }).join('');
  }

  function renderFaqDots() {
    var t = translations[activeLang];
    var dotsEl = $('faq-dots');
    if (!dotsEl || !t.faqItems) return;

    dotsEl.innerHTML = t.faqItems.map(function (_, i) {
      return (
        '<button type="button" class="gallery-dot' + (i === faqIndex ? ' active' : '') + '" data-faq="' + i + '" aria-label="Pregunta ' + (i + 1) + '"></button>'
      );
    }).join('');
  }

  function fillFaqCard(slot, item, animate) {
    if (!item) return;

    var questionEl = $('faq-card-question-' + slot);
    var answerEl = $('faq-card-answer-' + slot);
    var card = $('faq-kiosk-card-' + slot);

    function applyFaq() {
      if (questionEl) {
        questionEl.textContent = item.q;
        questionEl.classList.remove('is-fading');
      }
      if (answerEl) {
        answerEl.textContent = item.a;
        answerEl.classList.remove('is-fading');
      }
      if (card) card.classList.remove('is-fading');
    }

    if (animate === false) {
      applyFaq();
      return;
    }

    if (questionEl) questionEl.classList.add('is-fading');
    if (answerEl) answerEl.classList.add('is-fading');
    if (card) card.classList.add('is-fading');
    setTimeout(applyFaq, 320);
  }

  function updateFaqSecondaryVisibility() {
    var secondary = $('faq-kiosk-card-1');
    if (!secondary) return;
    secondary.hidden = !isDualCardLayout();
  }

  function showFaq(index, animate) {
    var t = translations[activeLang];
    if (!t.faqItems || !t.faqItems.length) return;

    if (index >= t.faqItems.length) index = 0;
    if (index < 0) index = t.faqItems.length - 1;
    faqIndex = index;

    var len = t.faqItems.length;
    updateFaqSecondaryVisibility();
    fillFaqCard(0, t.faqItems[index], animate);

    if (isDualCardLayout()) {
      var nextIndex = index + 1;
      if (nextIndex >= len) nextIndex = 0;
      fillFaqCard(1, t.faqItems[nextIndex], animate);
    }

    renderFaqDots();
  }

  function nextFaq() {
    var t = translations[activeLang];
    if (!t.faqItems || !t.faqItems.length) return;
    showFaq((faqIndex + 1) % t.faqItems.length, true);
  }

  function prevFaq() {
    var t = translations[activeLang];
    if (!t.faqItems || !t.faqItems.length) return;
    var prev = faqIndex - 1;
    if (prev < 0) prev = t.faqItems.length - 1;
    showFaq(prev, true);
  }

  function startFaqRotation() {
    stopFaqRotation();
    faqTimer = setInterval(nextFaq, FAQ_INTERVAL_MS);
  }

  function stopFaqRotation() {
    clearInterval(faqTimer);
    faqTimer = null;
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      scrollToSection(0);
      resumeAutoplay();
    }, IDLE_RESET_MS);
  }

  function clearCachesAndReload() {
    if ('caches' in window) {
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) { return caches.delete(key); }));
      }).then(function () {
        localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
        window.location.reload();
      });
      return;
    }
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    window.location.reload();
  }

  function checkAppVersion() {
    var stored = localStorage.getItem(VERSION_STORAGE_KEY);
    if (stored && stored !== APP_VERSION) {
      clearCachesAndReload();
      return false;
    }
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    return true;
  }

  function showUpdateGate(registration) {
    var gate = $('update-gate');
    var btn = $('update-gate-btn');
    if (!gate || gate.hidden === false) return;
    swRegistration = registration;
    gate.hidden = false;
    document.body.classList.add('update-blocked');
    pauseAutoplay();
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        if (swRegistration && swRegistration.waiting) {
          swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
          return;
        }
        clearCachesAndReload();
      });
    }
  }

  function handleWaitingWorker(registration) {
    if (registration.waiting && navigator.serviceWorker.controller) {
      showUpdateGate(registration);
    }
  }

  function setupPwa() {
    if (!checkAppVersion()) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);

    if ('serviceWorker' in navigator) {
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js?v=' + APP_VERSION).then(function (registration) {
          swRegistration = registration;
          handleWaitingWorker(registration);
          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed') handleWaitingWorker(registration);
            });
          });
          setInterval(function () { registration.update(); }, 60 * 60 * 1000);
        }).catch(function () {});
      });
    }
  }

  function bindEvents() {
    function on(id, eventName, handler, options) {
      var el = $(id);
      if (el) el.addEventListener(eventName, handler, options);
    }

    document.querySelectorAll('.section-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        scrollToSection(parseInt(dot.dataset.section, 10));
        resetIdleTimer();
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
      });
    });

    on('gallery-prev', 'click', function () {
      prevReview();
      resetIdleTimer();
    });

    on('gallery-next', 'click', function () {
      nextReview();
      resetIdleTimer();
    });

    on('faq-prev', 'click', function () {
      prevFaq();
      resetIdleTimer();
    });

    on('faq-next', 'click', function () {
      nextFaq();
      resetIdleTimer();
    });

    on('faq-dots', 'click', function (e) {
      var dot = e.target.closest('.gallery-dot');
      if (!dot) return;
      showFaq(parseInt(dot.dataset.faq, 10), true);
      resetIdleTimer();
    });

    var scrollEl = $('page-scroll');
    if (scrollEl) {
      lastScrollTop = scrollEl.scrollTop;

      scrollEl.addEventListener('scroll', function () {
        updateScrollProgress();
        updateHeroParallax();
        lastScrollTop = scrollEl.scrollTop;
        resetIdleTimer();
      }, { passive: true });

      scrollEl.addEventListener('touchstart', function () {
        pauseAutoplayForTouch();
      }, { passive: true });

      scrollEl.addEventListener('touchend', function () {
        resumeAutoplayAfterTouch();
      }, { passive: true });

      scrollEl.addEventListener('touchcancel', function () {
        resumeAutoplayAfterTouch();
      }, { passive: true });
    }

    ['click', 'touchstart', 'keydown'].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        resetIdleTimer();
      }, { passive: true });
    });

    window.addEventListener('resize', function () {
      updateReviewSecondaryVisibility();
      showReview(shuffleIndex, false);
      updateFaqSecondaryVisibility();
      showFaq(faqIndex, false);
    });
  }

  function init() {
    setLanguage(detectLanguage());
    setupSectionObserver();
    setActiveSection(0);
    updateScrollProgress();
    startVehicleRotation();
    startSectionAutoAdvance();
    bindEvents();
    setupPwa();
  }

  init();
})();
