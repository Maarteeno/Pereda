(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v28';
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var IDLE_RESET_MS = 60000;
  var SWIPE_THRESHOLD = 50;
  var REVIEW_INTERVAL_MS = 5000;
  var SECTION_AUTO_MS = 13000;
  var SPOT_AUTO_MS = 6000;
  var VEHICLE_ROTATE_MS = 8000;
  var TOTAL_DESTINATIONS = 4;
  var TOTAL_SECTIONS = 5;

  var activeLang = 'es';
  var currentSection = 0;
  var idleTimer = null;
  var sectionAutoTimer = null;
  var spotAutoTimer = null;
  var vehicleRotateTimer = null;
  var reviewTimer = null;
  var temporaryAutoplayTimer = null;
  var autoplayPaused = false;
  var shuffledReviews = [];
  var shuffleIndex = 0;
  var lastReviewText = '';
  var currentDest = 0;
  var currentSpot = 0;
  var spotTouchStartX = 0;
  var openFaqIndex = -1;
  var currentVehicleView = 0;
  var swRegistration = null;
  var sectionObserver = null;
  var isProgrammaticScroll = false;
  var userScrolledManually = false;
  var lastScrollTop = 0;
  var touchScrollStartY = 0;
  var touchScrollActive = false;

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
      spotSectionTitle: 'Puntos de interés',
      finalCtaLabel: '¿Listo para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nueva versión disponible',
      updateGateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateGateAction: 'Actualizar ahora',
      tripNote: 'Tiempos estimados sin tráfico',
      destinationCovers: [
        'assets/destinations/punta-del-este.jpg',
        'assets/destinations/colonia.jpg',
        'assets/destinations/eventos.jpg',
        'assets/destinations/aeropuerto.jpg'
      ],
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Escultura icónica en Playa Brava', image: 'assets/spots/la-mano.jpg' },
          { name: 'Playa Brava', desc: 'Olas y atardeceres imperdibles', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Puerto de Punta', desc: 'Yates, lobos marinos y paseo', image: 'assets/spots/puerto-punta.jpg' },
          { name: 'Isla Gorriti', desc: 'Paseo en lancha y naturaleza frente al puerto', image: 'assets/spots/gorriti.jpg' }
        ],
        [
          { name: 'Barrio Histórico', desc: 'Patrimonio de la Humanidad UNESCO', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Faro de Colonia', desc: 'Vista panorámica del Río de la Plata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Calle de los Suspiros', desc: 'La calle colonial más fotografiada', image: 'assets/spots/calle-suspiros.jpg' },
          { name: 'Rambla de Colonia', desc: 'Paseo costero con vistas al río', image: 'assets/spots/rambla-colonia.jpg' }
        ],
        [
          { name: 'Boda en la costa', desc: 'Llegada puntual a ceremonias frente al mar', image: 'assets/spots/boda-costa.jpg' },
          { name: 'Salón de eventos', desc: 'Bodas, fiestas y celebraciones en Punta', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Hotel cinco estrellas', desc: 'Traslado VIP a hoteles de la costa', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Evento corporativo', desc: 'Montevideo y zonas empresariales', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Aeropuerto Carrasco', desc: 'Terminal internacional con seguimiento de vuelo', image: 'assets/spots/carrasco.jpg' },
          { name: 'Seguimiento de vuelo', desc: 'Monitoreo en tiempo real de tu arribo', image: 'assets/spots/vuelo-seguimiento.jpg' },
          { name: 'Terminal Buquebus', desc: 'Conexión directa con el puerto', image: 'assets/spots/buquebus.jpg' },
          { name: 'Hoteles Montevideo', desc: 'Recogida puerta a puerta en la ciudad', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeropuerto'],
      tripInfo: [
        { distance: '~130 km', duration: '~1h 45min' },
        { distance: '~180 km', duration: '~2h 15min' },
        { distance: 'A convenir', duration: 'Según ubicación del evento' },
        { distance: '~20 km', duration: '~25 min' }
      ],
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
      spotSectionTitle: 'Points of interest',
      finalCtaLabel: 'Ready to book?',
      finalCtaAction: 'Open WhatsApp',
      updateGateTitle: 'New version available',
      updateGateText: 'An app update is ready. Refresh to see the latest layout.',
      updateGateAction: 'Update now',
      tripNote: 'Estimated times without traffic',
      destinationCovers: [
        'assets/destinations/punta-del-este.jpg',
        'assets/destinations/colonia.jpg',
        'assets/destinations/eventos.jpg',
        'assets/destinations/aeropuerto.jpg'
      ],
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Iconic sculpture on Brava Beach', image: 'assets/spots/la-mano.jpg' },
          { name: 'Brava Beach', desc: 'Waves and unforgettable sunsets', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Punta del Este Port', desc: 'Yachts, sea lions and promenade', image: 'assets/spots/puerto-punta.jpg' },
          { name: 'Gorriti Island', desc: 'Boat trip and nature by the harbour', image: 'assets/spots/gorriti.jpg' }
        ],
        [
          { name: 'Historic Quarter', desc: 'UNESCO World Heritage Site', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Colonia Lighthouse', desc: 'Panoramic view of the Río de la Plata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Street of Sighs', desc: 'The most photographed colonial street', image: 'assets/spots/calle-suspiros.jpg' },
          { name: 'Colonia Waterfront', desc: 'Coastal promenade with river views', image: 'assets/spots/rambla-colonia.jpg' }
        ],
        [
          { name: 'Coastal wedding', desc: 'On-time arrival to seaside ceremonies', image: 'assets/spots/boda-costa.jpg' },
          { name: 'Event venue', desc: 'Weddings, parties and celebrations in Punta', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Five-star hotel', desc: 'VIP transfer to coast hotels', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Corporate event', desc: 'Montevideo and business districts', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Carrasco Airport', desc: 'International terminal with flight tracking', image: 'assets/spots/carrasco.jpg' },
          { name: 'Flight tracking', desc: 'Real-time monitoring of your arrival', image: 'assets/spots/vuelo-seguimiento.jpg' },
          { name: 'Buquebus Terminal', desc: 'Direct connection to the port', image: 'assets/spots/buquebus.jpg' },
          { name: 'Montevideo hotels', desc: 'Door-to-door pickup in the city', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Events', 'Airport'],
      tripInfo: [
        { distance: '~130 km', duration: '~1h 45min' },
        { distance: '~180 km', duration: '~2h 15min' },
        { distance: 'By arrangement', duration: 'Depends on event location' },
        { distance: '~20 km', duration: '~25 min' }
      ],
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
      spotSectionTitle: 'Pontos de interesse',
      finalCtaLabel: 'Pronto para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nova versão disponível',
      updateGateText: 'Há uma atualização do app. Atualize para ver o layout mais recente.',
      updateGateAction: 'Atualizar agora',
      tripNote: 'Tempos estimados sem trânsito',
      destinationCovers: [
        'assets/destinations/punta-del-este.jpg',
        'assets/destinations/colonia.jpg',
        'assets/destinations/eventos.jpg',
        'assets/destinations/aeropuerto.jpg'
      ],
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Escultura icônica na Playa Brava', image: 'assets/spots/la-mano.jpg' },
          { name: 'Playa Brava', desc: 'Ondas e pores do sol imperdíveis', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Porto de Punta del Este', desc: 'Iates, lobos-marinhos e passeio', image: 'assets/spots/puerto-punta.jpg' },
          { name: 'Ilha Gorriti', desc: 'Passeio de barco e natureza no porto', image: 'assets/spots/gorriti.jpg' }
        ],
        [
          { name: 'Bairro Histórico', desc: 'Patrimônio Mundial da UNESCO', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Farol de Colonia', desc: 'Vista panorâmica do Rio da Prata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Calle de los Suspiros', desc: 'A rua colonial mais fotografada', image: 'assets/spots/calle-suspiros.jpg' },
          { name: 'Rambla de Colonia', desc: 'Passeio costeiro com vista ao rio', image: 'assets/spots/rambla-colonia.jpg' }
        ],
        [
          { name: 'Casamento na costa', desc: 'Chegada pontual a cerimônias à beira-mar', image: 'assets/spots/boda-costa.jpg' },
          { name: 'Salão de eventos', desc: 'Casamentos, festas e celebrações em Punta', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Hotel cinco estrelas', desc: 'Transfer VIP para hotéis do litoral', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Evento corporativo', desc: 'Montevidéu e zonas empresariais', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Aeroporto Carrasco', desc: 'Terminal internacional com acompanhamento de voo', image: 'assets/spots/carrasco.jpg' },
          { name: 'Acompanhamento de voo', desc: 'Monitoramento em tempo real da sua chegada', image: 'assets/spots/vuelo-seguimiento.jpg' },
          { name: 'Terminal Buquebus', desc: 'Conexão direta com o porto', image: 'assets/spots/buquebus.jpg' },
          { name: 'Hotéis em Montevidéu', desc: 'Busca porta a porta na cidade', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeroporto'],
      tripInfo: [
        { distance: '~130 km', duration: '~1h 45min' },
        { distance: '~180 km', duration: '~2h 15min' },
        { distance: 'A combinar', duration: 'Conforme local do evento' },
        { distance: '~20 km', duration: '~25 min' }
      ],
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
    setText('dest-trip-note', t.tripNote);
    setText('review-gallery-title', t.reviewLabel);
    setText('faq-title', t.faqTitle);

    renderDestTabs();
    goToDestination(currentDest, false);
    renderFaq();
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

  function markManualScroll() {
    if (isProgrammaticScroll) return;
    userScrolledManually = true;
    pauseAutoplay();
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

    if (index === 3) startSpotRotation();
    else stopSpotRotation();
  }

  function setupSectionObserver() {
    var scrollEl = $('page-scroll');
    if (!scrollEl || !('IntersectionObserver' in window)) return;

    if (sectionObserver) sectionObserver.disconnect();

    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
        var index = parseInt(entry.target.getAttribute('data-section'), 10);
        if (!isNaN(index) && index !== currentSection) {
          setActiveSection(index);
        }
      });
    }, { root: scrollEl, threshold: [0.25, 0.4, 0.55] });

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
    if (openFaqIndex >= 0) return;
    clearTimeout(temporaryAutoplayTimer);
    autoplayPaused = true;
    stopSectionAutoAdvance();
    temporaryAutoplayTimer = setTimeout(function () {
      resumeAutoplay();
    }, delay || 5000);
  }

  function startSectionAutoAdvance() {
    stopSectionAutoAdvance();
    if (autoplayPaused || openFaqIndex >= 0) return;
    sectionAutoTimer = setInterval(function () {
      if (autoplayPaused || openFaqIndex >= 0) return;
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
    var review = shuffledReviews[index];
    lastReviewText = review.text;

    var textEl = $('gallery-review-text-0');
    var authorEl = $('gallery-review-author-0');
    var avatarEl = $('review-author-avatar');
    var card = $('review-kiosk-card');

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

  function renderDestTabs() {
    var t = translations[activeLang];
    var tabMarkup = t.services.map(function (name, i) {
      return (
        '<button type="button" class="dest-tab' + (i === currentDest ? ' active' : '') + '" data-dest="' + i + '" role="tab" aria-selected="' + (i === currentDest) + '">' +
          name +
        '</button>'
      );
    }).join('');
    var spotTabsEl = $('spot-tabs');
    if (spotTabsEl) spotTabsEl.innerHTML = tabMarkup;
  }

  function renderDestSpots(index) {
    var t = translations[activeLang];
    var spotsEl = $('dest-spots');
    if (!spotsEl || !t.destinationSpots[index]) return;

    spotsEl.innerHTML = t.destinationSpots[index].map(function (spot, i) {
      var activeClass = i === currentSpot ? ' is-active' : '';
      return (
        '<article class="dest-spot' + activeClass + '" data-spot="' + i + '">' +
          '<div class="dest-spot-media dest-spot-media-tall">' +
            '<img src="' + spot.image + '" alt="' + spot.name + '" class="dest-spot-photo" loading="lazy">' +
          '</div>' +
          '<div class="dest-spot-body">' +
            '<h4 class="dest-spot-name">' + spot.name + '</h4>' +
            '<p class="dest-spot-desc">' + spot.desc + '</p>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    renderSpotDots(index);
  }

  function renderSpotDots(index) {
    var dotsEl = $('dest-spot-dots');
    var t = translations[activeLang];
    if (!dotsEl || !t.destinationSpots[index]) return;
    dotsEl.hidden = false;
    dotsEl.setAttribute('aria-hidden', 'false');
    dotsEl.innerHTML = t.destinationSpots[index].map(function (_, i) {
      return (
        '<button type="button" class="dest-spot-dot' + (i === currentSpot ? ' active' : '') + '" data-spot="' + i + '" aria-label="Lugar ' + (i + 1) + '"></button>'
      );
    }).join('');
  }

  function updateSpotVisibility() {
    var spotsEl = $('dest-spots');
    if (!spotsEl) return;
    spotsEl.querySelectorAll('.dest-spot').forEach(function (spot, i) {
      spot.classList.toggle('is-active', i === currentSpot);
    });
    document.querySelectorAll('.dest-spot-dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSpot);
    });
  }

  function goToSpot(spotIndex, options) {
    options = options || {};
    var t = translations[activeLang];
    var spots = t.destinationSpots[currentDest];
    if (!spots || spotIndex < 0 || spotIndex >= spots.length) return;
    currentSpot = spotIndex;
    updateSpotVisibility();
    if (options.manual !== false) {
      markManualScroll();
      resetIdleTimer();
    }
    startSpotRotation();
  }

  function nextSpot(options) {
    var t = translations[activeLang];
    var spots = t.destinationSpots[currentDest];
    if (!spots) return;
    goToSpot((currentSpot + 1) % spots.length, options);
  }

  function startSpotRotation() {
    stopSpotRotation();
    if (currentSection !== 3) return;
    spotAutoTimer = setInterval(function () {
      nextSpot({ manual: false });
    }, SPOT_AUTO_MS);
  }

  function stopSpotRotation() {
    clearInterval(spotAutoTimer);
    spotAutoTimer = null;
  }

  function goToDestination(index, animate) {
    if (index < 0) index = TOTAL_DESTINATIONS - 1;
    else if (index >= TOTAL_DESTINATIONS) index = 0;

    currentDest = index;
    currentSpot = 0;
    var t = translations[activeLang];
    var trip = t.tripInfo[index];
    var spotNameEl = $('spot-dest-name');
    var spotBadgeEl = $('spot-dest-badge');
    var coverEl = $('spot-category-cover');
    var slideEl = $('dest-slide');
    var label = t.services[index];
    var meta = trip.distance + ' · ' + trip.duration;

    if (spotNameEl) spotNameEl.textContent = label;
    if (spotBadgeEl) spotBadgeEl.textContent = meta;
    if (coverEl && t.destinationCovers[index]) {
      coverEl.src = t.destinationCovers[index];
      coverEl.alt = label;
    }

    renderDestSpots(index);
    document.querySelectorAll('.dest-tab').forEach(function (tab, i) {
      var isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    if (slideEl && animate !== false) {
      slideEl.classList.remove('is-entering');
      void slideEl.offsetWidth;
      slideEl.classList.add('is-entering');
    }

    if (animate !== false) {
      markManualScroll();
      resetIdleTimer();
    }
    startSpotRotation();
  }

  function renderFaq() {
    var t = translations[activeLang];
    var listEl = $('faq-list');
    if (!listEl) return;

    listEl.innerHTML = t.faqItems.map(function (item, i) {
      var isOpen = openFaqIndex === i;
      return (
        '<div class="faq-item' + (isOpen ? ' is-open' : '') + '">' +
          '<button type="button" class="faq-question" data-faq="' + i + '" aria-expanded="' + isOpen + '">' +
            '<span>' + item.q + '</span>' +
            '<span class="faq-chevron" aria-hidden="true">' + (isOpen ? '−' : '+') + '</span>' +
          '</button>' +
          '<div class="faq-answer" ' + (isOpen ? '' : 'hidden') + '>' +
            '<p>' + item.a + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function toggleFaq(index) {
    openFaqIndex = openFaqIndex === index ? -1 : index;
    renderFaq();
    if (openFaqIndex >= 0) pauseAutoplay();
    else resumeAutoplay();
    resetIdleTimer();
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      userScrolledManually = false;
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
        markManualScroll();
        scrollToSection(parseInt(dot.dataset.section, 10));
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
      });
    });

    on('gallery-prev', 'click', function () {
      markManualScroll();
      prevReview();
      resetIdleTimer();
    });

    on('gallery-next', 'click', function () {
      markManualScroll();
      nextReview();
      resetIdleTimer();
    });

    on('spot-tabs', 'click', function (e) {
      var tab = e.target.closest('.dest-tab');
      if (!tab) return;
      goToDestination(parseInt(tab.dataset.dest, 10), true);
    });

    on('dest-spot-dots', 'click', function (e) {
      var dot = e.target.closest('.dest-spot-dot');
      if (!dot) return;
      goToSpot(parseInt(dot.dataset.spot, 10));
    });

    on('faq-list', 'click', function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;
      toggleFaq(parseInt(btn.dataset.faq, 10));
    });

    var spotViewport = $('dest-spots');
    if (spotViewport) {
      spotViewport.addEventListener('touchstart', function (e) {
        spotTouchStartX = e.changedTouches[0].screenX;
        markManualScroll();
      }, { passive: true });

      spotViewport.addEventListener('touchend', function (e) {
        var deltaX = e.changedTouches[0].screenX - spotTouchStartX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (deltaX < 0) nextSpot({ manual: true });
        else {
          var t = translations[activeLang];
          var spots = t.destinationSpots[currentDest];
          if (!spots) return;
          goToSpot((currentSpot - 1 + spots.length) % spots.length, { manual: true });
        }
      }, { passive: true });
    }

    var scrollEl = $('page-scroll');
    if (scrollEl) {
      lastScrollTop = scrollEl.scrollTop;

      scrollEl.addEventListener('scroll', function () {
        updateScrollProgress();
        updateHeroParallax();

        if (!isProgrammaticScroll) {
          var delta = Math.abs(scrollEl.scrollTop - lastScrollTop);
          if (delta > 8) markManualScroll();
        }
        lastScrollTop = scrollEl.scrollTop;
        resetIdleTimer();
      }, { passive: true });

      scrollEl.addEventListener('wheel', function () {
        markManualScroll();
      }, { passive: true });

      scrollEl.addEventListener('touchstart', function (e) {
        touchScrollStartY = e.changedTouches[0].screenY;
        touchScrollActive = true;
      }, { passive: true });

      scrollEl.addEventListener('touchmove', function (e) {
        if (!touchScrollActive) return;
        var deltaY = Math.abs(e.changedTouches[0].screenY - touchScrollStartY);
        if (deltaY > 12) markManualScroll();
      }, { passive: true });

      scrollEl.addEventListener('touchend', function () {
        touchScrollActive = false;
      }, { passive: true });
    }

    document.addEventListener('keydown', function (e) {
      var keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
      if (keys.indexOf(e.key) >= 0) markManualScroll();
    });

    ['click', 'touchstart', 'keydown'].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        resetIdleTimer();
      }, { passive: true });
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
