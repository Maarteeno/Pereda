(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var IDLE_RESET_MS = 60000;
  var SWIPE_THRESHOLD = 50;

  var activeLang = 'es';
  var currentSlide = 0;
  var totalSlides = 3;
  var idleTimer = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var reviewIndex = 0;
  var reviewTimer = null;
  var REVIEW_INTERVAL_MS = 4500;

  var translations = {
    es: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Traslados',
      vehicleBadge: '100% Eléctrico',
      vehicleColor: 'Blanco',
      comfortSubtitle: 'Por qué viajar en Bestune',
      driverName: 'Adrián Pereda',
      driverRole: 'Conductor profesional · Montevideo y costa',
      uberLabel: 'Valoración Uber',
      uberRating: '4.9',
      tripsLabel: 'Viajes realizados',
      tripsCount: '42.350',
      comfortItems: [
        'Espacio amplio para valijas',
        'Puerta corrediza · acceso cómodo',
        'Viaje silencioso, sin vibraciones',
        'Climatización confort todo el año',
        'Asientos amplios · viaje relajado',
        '100% eléctrico · aire limpio a bordo'
      ],
      servicesTitle: 'Traslados',
      servicesSubtitle: 'Contacto directo',
      servicesIntro: 'Viajes seguros, cómodos y directos en vehículo eléctrico.',
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeropuerto / Traslados'],
      serviceDescs: [
        'Traslados puerta a puerta desde Montevideo',
        'Viajes regionales con horario a convenir',
        'Bodas, corporativos y ocasiones especiales',
        'Carrasco, puerto y hoteles · puntualidad'
      ],
      servicesNote: 'Reservá tu traslado con un solo toque en la siguiente pantalla.',
      contactTitle: 'Contacto',
      contactSubtitle: 'Estamos para ayudarte',
      contactPhoneLabel: 'Teléfono',
      whatsapp: 'Enviar WhatsApp',
      copyPhone: 'Copiar Número',
      qrLabel: 'O escaneá el código QR',
      copySuccess: 'Copiado',
      copyError: 'No se pudo copiar',
      phoneNumber: '+598 99 774 019',
      reviewLabel: 'Lo dicen los pasajeros'
    },
    en: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Transport',
      vehicleBadge: '100% Electric',
      vehicleColor: 'White',
      comfortSubtitle: 'Why ride in a Bestune',
      driverName: 'Adrián Pereda',
      driverRole: 'Professional driver · Montevideo and coast',
      uberLabel: 'Uber rating',
      uberRating: '4.9',
      tripsLabel: 'Trips completed',
      tripsCount: '42,350',
      comfortItems: [
        'Room for luggage',
        'Sliding door · easy access',
        'Quiet ride, no vibrations',
        'Comfort climate all year',
        'Spacious seats · relaxed trip',
        '100% electric · clean air onboard'
      ],
      servicesTitle: 'Transport',
      servicesSubtitle: 'Direct contact',
      servicesIntro: 'Safe, comfortable and direct trips in an electric vehicle.',
      services: ['Punta del Este', 'Colonia', 'Events', 'Airport / Transfers'],
      serviceDescs: [
        'Door-to-door transfers from Montevideo',
        'Regional trips at your preferred schedule',
        'Weddings, corporate and special occasions',
        'Carrasco, port and hotels · on time'
      ],
      servicesNote: 'Book your transfer with one tap on the next screen.',
      contactTitle: 'Contact',
      contactSubtitle: 'We are here to help',
      contactPhoneLabel: 'Phone',
      whatsapp: 'Send Message',
      copyPhone: 'Copy Number',
      qrLabel: 'Or scan the QR code',
      copySuccess: 'Copied',
      copyError: 'Could not copy',
      phoneNumber: '+598 99 774 019',
      reviewLabel: 'What passengers say'
    },
    pt: {
      brandName: 'Adrián Pereda',
      headerSubtitle: 'Transporte',
      vehicleBadge: '100% Elétrico',
      vehicleColor: 'Branco',
      comfortSubtitle: 'Por que viajar na Bestune',
      driverName: 'Adrián Pereda',
      driverRole: 'Motorista profissional · Montevidéu e litoral',
      uberLabel: 'Avaliação Uber',
      uberRating: '4.9',
      tripsLabel: 'Viagens realizadas',
      tripsCount: '42.350',
      comfortItems: [
        'Espaço amplo para bagagens',
        'Porta corrediça · acesso confortável',
        'Viagem silenciosa, sem vibrações',
        'Climatização confortável o ano todo',
        'Assentos amplos · viagem relaxada',
        '100% elétrico · ar limpo a bordo'
      ],
      servicesTitle: 'Transporte',
      servicesSubtitle: 'Contato direto',
      servicesIntro: 'Viagens seguras, confortáveis e diretas em veículo elétrico.',
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeroporto / Transfer'],
      serviceDescs: [
        'Transfers porta a porta desde Montevidéu',
        'Viagens regionais com horário combinado',
        'Casamentos, corporativos e ocasiões especiais',
        'Carrasco, porto e hotéis · pontualidade'
      ],
      servicesNote: 'Reserve seu transfer com um toque na próxima tela.',
      contactTitle: 'Contato',
      contactSubtitle: 'Estamos aqui para ajudar',
      contactPhoneLabel: 'Telefone',
      whatsapp: 'Enviar WhatsApp',
      copyPhone: 'Copiar número',
      qrLabel: 'Ou escaneie o código QR',
      copySuccess: 'Copiado',
      copyError: 'Não foi possível copiar',
      phoneNumber: '+598 99 774 019',
      reviewLabel: 'O que dizem os passageiros'
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function detectLanguage() {
    var saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && translations[saved]) {
      return saved;
    }

    var browserLang = (navigator.language || 'es').toLowerCase();
    if (browserLang.indexOf('pt') === 0) {
      return 'pt';
    }
    if (browserLang.indexOf('en') === 0) {
      return 'en';
    }
    return 'es';
  }

  function setLanguage(lang) {
    if (!translations[lang]) {
      return;
    }

    activeLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    renderTranslations(lang);
  }

  function renderTranslations(lang) {
    var t = translations[lang];
    var i;

    $('brand-name').textContent = t.brandName;
    $('header-subtitle').textContent = t.headerSubtitle;
    $('vehicle-badge').textContent = t.vehicleBadge;
    $('vehicle-color').textContent = t.vehicleColor;
    $('comfort-subtitle').textContent = t.comfortSubtitle;

    $('driver-name').textContent = t.driverName;
    $('driver-role').textContent = t.driverRole;
    $('uber-label').textContent = t.uberLabel;
    $('uber-rating').textContent = t.uberRating;
    $('trips-label').textContent = t.tripsLabel;
    $('trips-count').textContent = t.tripsCount;

    for (i = 0; i < t.comfortItems.length; i++) {
      $('comfort-' + (i + 1)).textContent = t.comfortItems[i];
    }

    $('services-title').textContent = t.servicesTitle;
    $('services-subtitle').textContent = t.servicesSubtitle;
    $('services-intro').textContent = t.servicesIntro;

    for (i = 0; i < t.services.length; i++) {
      $('service-' + (i + 1)).textContent = t.services[i];
      $('service-desc-' + (i + 1)).textContent = t.serviceDescs[i];
    }

    $('services-note').textContent = t.servicesNote;
    $('contact-title').textContent = t.contactTitle;
    $('contact-subtitle').textContent = t.contactSubtitle;
    $('contact-phone-label').textContent = t.contactPhoneLabel;
    $('contact-number').textContent = t.phoneNumber;
    $('whatsapp-text').textContent = t.whatsapp;
    $('copy-phone-btn').textContent = t.copyPhone;
    $('qr-label').textContent = t.qrLabel;
    $('review-label').textContent = t.reviewLabel;
    showReview(reviewIndex, false);

    $('lang-es').setAttribute('aria-pressed', String(lang === 'es'));
    $('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    $('lang-pt').setAttribute('aria-pressed', String(lang === 'pt'));
  }

  function goToSlide(index) {
    if (index < 0) {
      index = totalSlides - 1;
    } else if (index >= totalSlides) {
      index = 0;
    }

    currentSlide = index;

    var slides = document.querySelectorAll('.slide');
    var dots = document.querySelectorAll('.dot');

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach(function (dot, i) {
      var isActive = i === currentSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    resetIdleTimer();
    updateVehicleShowcase(currentSlide);
    if (currentSlide === 0) {
      startReviewRotation();
    } else {
      stopReviewRotation();
    }
  }

  function updateVehicleShowcase(index) {
    var showcase = $('vehicle-showcase');
    if (!showcase) {
      return;
    }

    showcase.dataset.slide = String(index);
    document.querySelectorAll('.vehicle-view').forEach(function (view, i) {
      view.classList.toggle('active', i === index);
    });
  }

  function getReviews() {
    var data = window.PASSENGER_REVIEWS || {};
    return data[activeLang] || data.es || [];
  }

  function showReview(index, animate) {
    var reviews = getReviews();
    var textEl = $('review-text');
    var authorEl = $('review-author');
    if (!reviews.length || !textEl || !authorEl) {
      return;
    }

    if (index >= reviews.length) {
      index = 0;
    }
    if (index < 0) {
      index = reviews.length - 1;
    }
    reviewIndex = index;

    var review = reviews[reviewIndex];

    function applyReview() {
      textEl.textContent = review.text;
      authorEl.textContent = '— ' + review.author;
      textEl.classList.remove('is-fading');
      authorEl.classList.remove('is-fading');
    }

    if (animate === false) {
      applyReview();
      return;
    }

    textEl.classList.add('is-fading');
    authorEl.classList.add('is-fading');
    setTimeout(applyReview, 320);
  }

  function nextReview() {
    showReview(reviewIndex + 1, true);
  }

  function startReviewRotation() {
    stopReviewRotation();
    reviewTimer = setInterval(nextReview, REVIEW_INTERVAL_MS);
  }

  function stopReviewRotation() {
    clearInterval(reviewTimer);
    reviewTimer = null;
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      goToSlide(0);
    }, IDLE_RESET_MS);
  }

  function showToast(message) {
    var toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 1700);
  }

  function copyPhone(button) {
    var phone = '+59899774019';
    navigator.clipboard.writeText(phone).then(function () {
      showToast(translations[activeLang].copySuccess + ': ' + translations[activeLang].phoneNumber);
      if (button) {
        var originalText = button.dataset.originalText || button.textContent;
        button.dataset.originalText = originalText;
        button.textContent = translations[activeLang].copySuccess;
        button.classList.add('copied');
        clearTimeout(button.copyTimer);
        button.copyTimer = setTimeout(function () {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 1500);
      }
    }, function () {
      showToast(translations[activeLang].copyError);
    });
  }

  function setupPwa() {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      return;
    }

    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
          /* optional */
        });
      });
    }
  }

  function bindEvents() {
    $('nav-prev').addEventListener('click', prevSlide);
    $('nav-next').addEventListener('click', nextSlide);

    document.querySelectorAll('.dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(dot.dataset.slide, 10));
      });
    });

    ['lang-es', 'lang-en', 'lang-pt'].forEach(function (id) {
      $(id).addEventListener('click', function () {
        setLanguage($(id).dataset.lang);
      });
    });

    $('copy-phone-btn').addEventListener('click', function () {
      copyPhone(this);
      resetIdleTimer();
    });

    var viewport = $('slides-viewport');

    viewport.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', function (e) {
      var touchEndX = e.changedTouches[0].screenX;
      var touchEndY = e.changedTouches[0].screenY;
      var deltaX = touchEndX - touchStartX;
      var deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }, { passive: true });

    ['click', 'touchstart', 'keydown'].forEach(function (eventName) {
      document.addEventListener(eventName, resetIdleTimer, { passive: true });
    });
  }

  function init() {
    setLanguage(detectLanguage());
    goToSlide(0);
    bindEvents();
    setupPwa();
  }

  init();
})();
