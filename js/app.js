(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v24';
  var COMFORT_PAGE_SIZE = 4;
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var IDLE_RESET_MS = 60000;
  var SWIPE_THRESHOLD = 50;
  var REVIEW_INTERVAL_MS = 4500;
  var TOTAL_DESTINATIONS = 4;

  var activeLang = 'es';
  var currentSlide = 0;
  var totalSlides = 6;
  var idleTimer = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var reviewTimer = null;
  var shuffledReviews = [];
  var shuffleIndex = 0;
  var lastReviewText = '';
  var currentDest = 0;
  var currentSpot = 0;
  var spotTouchStartX = 0;
  var openFaqIndex = -1;
  var currentComfortPage = 0;
  var swRegistration = null;

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
        'Espacio amplio para valijas',
        'Puerta corrediza · acceso cómodo',
        'Viaje silencioso, sin vibraciones',
        'Climatización confort todo el año',
        'Asientos amplios · viaje relajado',
        '100% eléctrico · aire limpio a bordo'
      ],
      qrLabel: 'Escribile por WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Traslados privados y seguros',
      introSubtitle: 'Atención directa con Adrián y reserva inmediata por WhatsApp.',
      spotSectionTitle: 'Puntos de interés',
      finalCtaLabel: '¿Listo para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nueva versión disponible',
      updateGateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateGateAction: 'Actualizar ahora',
      servicesTitle: 'Traslados',
      servicesSubtitle: 'Destinos desde Montevideo',
      servicesIntro: 'Deslizá para conocer cada destino',
      transferToPrefix: 'Traslados a',
      tripNote: 'Tiempos estimados sin tráfico',
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Escultura icónica en Playa Brava', image: 'assets/spots/la-mano.jpg' },
          { name: 'Playa Brava', desc: 'Olas y atardeceres imperdibles', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Puerto de Punta', desc: 'Yates, lobos marinos y paseo', image: 'assets/spots/puerto-punta.jpg' }
        ],
        [
          { name: 'Barrio Histórico', desc: 'Patrimonio de la Humanidad UNESCO', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Faro de Colonia', desc: 'Vista panorámica del Río de la Plata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Calle de los Suspiros', desc: 'La calle colonial más fotografiada', image: 'assets/spots/calle-suspiros.jpg' }
        ],
        [
          { name: 'Salones Punta del Este', desc: 'Bodas y fiestas frente al mar', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Hoteles de la costa', desc: 'Llegada puntual a tu evento', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Montevideo centro', desc: 'Eventos corporativos y sociales', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Aeropuerto Carrasco', desc: 'Seguimiento de vuelo incluido', image: 'assets/spots/carrasco.jpg' },
          { name: 'Terminal Buquebus', desc: 'Conexión directa con el puerto', image: 'assets/spots/buquebus.jpg' },
          { name: 'Hoteles Montevideo', desc: 'Recogida puerta a puerta', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeropuerto / Traslados'],
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
        'Room for luggage',
        'Sliding door · easy access',
        'Quiet ride, no vibrations',
        'Comfort climate all year',
        'Spacious seats · relaxed trip',
        '100% electric · clean air onboard'
      ],
      qrLabel: 'Message on WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Private and reliable transfers',
      introSubtitle: 'Direct contact with Adrián and instant booking via WhatsApp.',
      spotSectionTitle: 'Points of interest',
      finalCtaLabel: 'Ready to book?',
      finalCtaAction: 'Open WhatsApp',
      updateGateTitle: 'New version available',
      updateGateText: 'An app update is ready. Refresh to see the latest layout.',
      updateGateAction: 'Update now',
      servicesTitle: 'Transport',
      servicesSubtitle: 'Destinations from Montevideo',
      servicesIntro: 'Swipe to explore each destination',
      transferToPrefix: 'Transfers to',
      tripNote: 'Estimated times without traffic',
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Iconic sculpture on Brava Beach', image: 'assets/spots/la-mano.jpg' },
          { name: 'Brava Beach', desc: 'Waves and unforgettable sunsets', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Punta del Este Port', desc: 'Yachts, sea lions and promenade', image: 'assets/spots/puerto-punta.jpg' }
        ],
        [
          { name: 'Historic Quarter', desc: 'UNESCO World Heritage Site', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Colonia Lighthouse', desc: 'Panoramic view of the Río de la Plata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Street of Sighs', desc: 'The most photographed colonial street', image: 'assets/spots/calle-suspiros.jpg' }
        ],
        [
          { name: 'Punta del Este venues', desc: 'Weddings and parties by the sea', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Coast hotels', desc: 'On-time arrival to your event', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Montevideo downtown', desc: 'Corporate and social events', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Carrasco Airport', desc: 'Flight tracking included', image: 'assets/spots/carrasco.jpg' },
          { name: 'Buquebus Terminal', desc: 'Direct connection to the port', image: 'assets/spots/buquebus.jpg' },
          { name: 'Montevideo hotels', desc: 'Door-to-door pickup', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Events', 'Airport / Transfers'],
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
        'Espaço amplo para bagagens',
        'Porta corrediça · acesso confortável',
        'Viagem silenciosa, sem vibrações',
        'Climatização confortável o ano todo',
        'Assentos amplos · viagem relaxada',
        '100% elétrico · ar limpo a bordo'
      ],
      qrLabel: 'Escreva no WhatsApp',
      phoneNumber: '+598 99 774 019',
      introTitle: 'Transfers privados e seguros',
      introSubtitle: 'Contato direto com Adrián e reserva imediata pelo WhatsApp.',
      spotSectionTitle: 'Pontos de interesse',
      finalCtaLabel: 'Pronto para reservar?',
      finalCtaAction: 'Abrir WhatsApp',
      updateGateTitle: 'Nova versão disponível',
      updateGateText: 'Há uma atualização do app. Atualize para ver o layout mais recente.',
      updateGateAction: 'Atualizar agora',
      servicesTitle: 'Transporte',
      servicesSubtitle: 'Destinos desde Montevidéu',
      servicesIntro: 'Deslize para conhecer cada destino',
      transferToPrefix: 'Transfer para',
      tripNote: 'Tempos estimados sem trânsito',
      destinationSpots: [
        [
          { name: 'La Mano', desc: 'Escultura icônica na Playa Brava', image: 'assets/spots/la-mano.jpg' },
          { name: 'Playa Brava', desc: 'Ondas e pores do sol imperdíveis', image: 'assets/spots/playa-brava.jpg' },
          { name: 'Porto de Punta del Este', desc: 'Iates, lobos-marinhos e passeio', image: 'assets/spots/puerto-punta.jpg' }
        ],
        [
          { name: 'Bairro Histórico', desc: 'Patrimônio Mundial da UNESCO', image: 'assets/spots/barrio-historico.jpg' },
          { name: 'Farol de Colonia', desc: 'Vista panorâmica do Rio da Prata', image: 'assets/spots/faro-colonia.jpg' },
          { name: 'Calle de los Suspiros', desc: 'A rua colonial mais fotografada', image: 'assets/spots/calle-suspiros.jpg' }
        ],
        [
          { name: 'Salões em Punta del Este', desc: 'Casamentos e festas à beira-mar', image: 'assets/spots/salones-pde.jpg' },
          { name: 'Hotéis do litoral', desc: 'Chegada pontual ao seu evento', image: 'assets/spots/hoteles-costa.jpg' },
          { name: 'Centro de Montevidéu', desc: 'Eventos corporativos e sociais', image: 'assets/spots/montevideo-centro.jpg' }
        ],
        [
          { name: 'Aeroporto Carrasco', desc: 'Acompanhamento do voo incluído', image: 'assets/spots/carrasco.jpg' },
          { name: 'Terminal Buquebus', desc: 'Conexão direta com o porto', image: 'assets/spots/buquebus.jpg' },
          { name: 'Hotéis em Montevidéu', desc: 'Busca porta a porta', image: 'assets/spots/hoteles-mvd.jpg' }
        ]
      ],
      services: ['Punta del Este', 'Colonia', 'Eventos', 'Aeroporto / Transfer'],
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
    if (saved && translations[saved]) {
      return saved;
    }
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
      setText('comfort-' + (i + 1), t.comfortItems[i]);
    }
    renderComfortPage();

    setText('qr-label', t.qrLabel);
    setText('vehicle-qr-phone', t.phoneNumber);
    setText('final-cta-label', t.finalCtaLabel);
    setText('final-cta-action', t.finalCtaAction);
    setText('update-gate-title', t.updateGateTitle);
    setText('update-gate-text', t.updateGateText);
    setText('update-gate-btn', t.updateGateAction);
    setText('spot-section-title', t.spotSectionTitle);

    setText('services-title', t.servicesTitle);
    setText('services-subtitle', t.servicesSubtitle);
    setText('services-intro', t.servicesIntro);
    setText('dest-trip-note', t.tripNote);

    renderDestTabs();
    goToDestination(currentDest, false);

    setText('review-gallery-title', t.reviewLabel);
    setText('faq-title', t.faqTitle);
    renderFaq();
    showReviewPair(shuffleIndex, false);

    if ($('lang-es')) $('lang-es').setAttribute('aria-pressed', String(lang === 'es'));
    if ($('lang-en')) $('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    if ($('lang-pt')) $('lang-pt').setAttribute('aria-pressed', String(lang === 'pt'));
  }

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    else if (index >= totalSlides) index = 0;

    currentSlide = index;

    document.querySelectorAll('.slide').forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });

    document.querySelectorAll('.dot').forEach(function (dot, i) {
      var isActive = i === currentSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    resetIdleTimer();
    updateVehicleShowcase(currentSlide);

    if (currentSlide === 4) {
      startReviewRotation();
    } else {
      stopReviewRotation();
    }

    if (currentSlide !== 3) {
      currentSpot = 0;
      updateSpotVisibility();
    }
  }

  function updateVehicleShowcase(index) {
    var showcase = $('vehicle-showcase');
    if (!showcase) return;
    showcase.dataset.slide = String(index);
    document.querySelectorAll('.vehicle-view').forEach(function (view, i) {
      view.classList.toggle('active', i === index);
    });
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

  function showReviewPair(startIndex, animate) {
    if (!shuffledReviews.length) reshuffleReviews();
    if (!shuffledReviews.length) return;

    var len = shuffledReviews.length;
    if (startIndex >= len || startIndex < 0) {
      reshuffleReviews();
      startIndex = 0;
      len = shuffledReviews.length;
    }

    shuffleIndex = startIndex;
    var reviewA = shuffledReviews[startIndex];
    var reviewB = shuffledReviews[(startIndex + 1) % len];
    lastReviewText = reviewA.text;

    var cards = [0, 1];
    function applyPair() {
      cards.forEach(function (cardIndex, i) {
        var review = i === 0 ? reviewA : reviewB;
        var textEl = $('gallery-review-text-' + cardIndex);
        var authorEl = $('gallery-review-author-' + cardIndex);
        if (!textEl || !authorEl) return;
        textEl.textContent = review.text;
        authorEl.textContent = '— ' + review.author;
        textEl.classList.remove('is-fading');
        authorEl.classList.remove('is-fading');
      });
    }

    if (animate === false) {
      applyPair();
      return;
    }

    cards.forEach(function (cardIndex) {
      var textEl = $('gallery-review-text-' + cardIndex);
      var authorEl = $('gallery-review-author-' + cardIndex);
      if (textEl) textEl.classList.add('is-fading');
      if (authorEl) authorEl.classList.add('is-fading');
    });
    setTimeout(applyPair, 320);
  }

  function nextReview() {
    var len = shuffledReviews.length;
    if (!len) return;
    var next = shuffleIndex + 2;
    if (next >= len) {
      reshuffleReviews();
      next = 0;
    }
    showReviewPair(next, true);
  }

  function prevReview() {
    var len = shuffledReviews.length;
    if (!len) return;
    var prev = shuffleIndex - 2;
    if (prev < 0) prev = Math.max(0, len - (len % 2 === 0 ? 2 : 1));
    showReviewPair(prev, true);
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

    var overviewTabsEl = $('dest-tabs-overview');
    var spotTabsEl = $('spot-tabs');
    if (overviewTabsEl) overviewTabsEl.innerHTML = tabMarkup;
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
          '<div class="dest-spot-media">' +
            '<img src="' + spot.image + '" alt="" class="dest-spot-photo" loading="lazy">' +
            '<div class="dest-spot-gradient"></div>' +
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

  function goToSpot(spotIndex) {
    var t = translations[activeLang];
    var spots = t.destinationSpots[currentDest];
    if (!spots || spotIndex < 0 || spotIndex >= spots.length) return;

    currentSpot = spotIndex;
    updateSpotVisibility();
    resetIdleTimer();
  }

  function nextSpot() {
    var t = translations[activeLang];
    var spots = t.destinationSpots[currentDest];
    if (!spots) return;
    goToSpot((currentSpot + 1) % spots.length);
  }

  function goToDestination(index, animate) {
    if (index < 0) index = TOTAL_DESTINATIONS - 1;
    else if (index >= TOTAL_DESTINATIONS) index = 0;

    currentDest = index;
    currentSpot = 0;
    var t = translations[activeLang];
    var trip = t.tripInfo[index];

    var summaryNameEl = $('dest-summary-name');
    var summaryBadgeEl = $('dest-summary-badge');
    var spotNameEl = $('spot-dest-name');
    var spotBadgeEl = $('spot-dest-badge');
    var slideEl = $('dest-slide');

    var label = t.transferToPrefix + ' ' + t.services[index];
    var meta = trip.distance + ' · ' + trip.duration;
    if (summaryNameEl) summaryNameEl.textContent = label;
    if (summaryBadgeEl) summaryBadgeEl.textContent = meta;
    if (spotNameEl) spotNameEl.textContent = label;
    if (spotBadgeEl) spotBadgeEl.textContent = meta;

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

    resetIdleTimer();
  }

  function nextDestination() {
    goToDestination(currentDest + 1, true);
  }

  function prevDestination() {
    goToDestination(currentDest - 1, true);
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
    resetIdleTimer();
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

  function shouldPaginateComfort() {
    return window.matchMedia('(max-width: 639px) and (orientation: portrait)').matches;
  }

  function renderComfortPage() {
    var chips = document.querySelectorAll('.comfort-chip');
    var dots = document.querySelectorAll('.comfort-page-dot');
    var totalPages = Math.ceil(chips.length / COMFORT_PAGE_SIZE);
    var i;
    var start;
    var end;

    if (!shouldPaginateComfort()) {
      for (i = 0; i < chips.length; i++) {
        chips[i].hidden = false;
      }
      dots.forEach(function (dot) {
        dot.hidden = true;
      });
      return;
    }

    if (currentComfortPage >= totalPages) {
      currentComfortPage = 0;
    }

    start = currentComfortPage * COMFORT_PAGE_SIZE;
    end = start + COMFORT_PAGE_SIZE;

    for (i = 0; i < chips.length; i++) {
      chips[i].hidden = i < start || i >= end;
    }

    dots.forEach(function (dot, index) {
      var visible = totalPages > 1;
      dot.hidden = !visible;
      dot.classList.toggle('active', index === currentComfortPage);
      dot.setAttribute('aria-selected', String(index === currentComfortPage));
    });
  }

  function goToComfortPage(page) {
    var chips = document.querySelectorAll('.comfort-chip');
    var totalPages = Math.ceil(chips.length / COMFORT_PAGE_SIZE);
    if (totalPages < 1) return;
    currentComfortPage = ((page % totalPages) + totalPages) % totalPages;
    renderComfortPage();
  }

  function clearCachesAndReload() {
    if ('caches' in window) {
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
          return caches.delete(key);
        }));
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
              if (newWorker.state === 'installed') {
                handleWaitingWorker(registration);
              }
            });
          });

          setInterval(function () {
            registration.update();
          }, 60 * 60 * 1000);
        }).catch(function () {});
      });
    }
  }

  function bindEvents() {
    function on(id, eventName, handler, options) {
      var el = $(id);
      if (el) el.addEventListener(eventName, handler, options);
    }

    on('nav-prev', 'click', prevSlide);
    on('nav-next', 'click', nextSlide);

    document.querySelectorAll('.comfort-page-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToComfortPage(parseInt(dot.getAttribute('data-page'), 10));
      });
    });

    document.querySelectorAll('.dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(dot.dataset.slide, 10));
      });
    });

    ['lang-es', 'lang-en', 'lang-pt'].forEach(function (id) {
      on(id, 'click', function () {
        setLanguage($(id).dataset.lang);
      });
    });

    on('gallery-prev', 'click', function () {
      prevReview();
      stopReviewRotation();
      startReviewRotation();
    });

    on('gallery-next', 'click', function () {
      nextReview();
      stopReviewRotation();
      startReviewRotation();
    });

    on('dest-tabs-overview', 'click', function (e) {
      var tab = e.target.closest('.dest-tab');
      if (!tab) return;
      goToDestination(parseInt(tab.dataset.dest, 10), true);
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
    if (!spotViewport) return;
    spotViewport.addEventListener('touchstart', function (e) {
      spotTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    spotViewport.addEventListener('touchend', function (e) {
      var deltaX = e.changedTouches[0].screenX - spotTouchStartX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) nextSpot();
      else {
        var t = translations[activeLang];
        var spots = t.destinationSpots[currentDest];
        if (!spots) return;
        goToSpot((currentSpot - 1 + spots.length) % spots.length);
      }
    }, { passive: true });

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

      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;

      var activeCard = document.querySelector('.slide.active .slide-card');
      if (activeCard && activeCard.scrollTop > 10) return;

      if (deltaX < 0) nextSlide();
      else prevSlide();
    }, { passive: true });

    ['click', 'touchstart', 'keydown'].forEach(function (eventName) {
      document.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    window.addEventListener('resize', renderComfortPage);
    window.addEventListener('orientationchange', renderComfortPage);
  }

  function init() {
    setLanguage(detectLanguage());
    goToSlide(0);
    renderComfortPage();
    bindEvents();
    setupPwa();
  }

  init();
})();
