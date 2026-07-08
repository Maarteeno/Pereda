(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var IDLE_RESET_MS = 60000;
  var SWIPE_THRESHOLD = 50;
  var REVIEW_INTERVAL_MS = 4500;
  var DEST_INTERVAL_MS = 8000;
  var TOTAL_DESTINATIONS = 4;

  var DEST_IMAGES = [
    'assets/destinations/punta-del-este.jpg',
    'assets/destinations/colonia.jpg',
    'assets/destinations/eventos.jpg',
    'assets/destinations/aeropuerto.jpg'
  ];

  var activeLang = 'es';
  var currentSlide = 0;
  var totalSlides = 3;
  var idleTimer = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var reviewTimer = null;
  var destTimer = null;
  var shuffledReviews = [];
  var shuffleIndex = 0;
  var lastReviewText = '';
  var currentDest = 0;
  var destTouchStartX = 0;
  var openFaqIndex = -1;

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
      servicesTitle: 'Traslados',
      servicesSubtitle: 'Destinos desde Montevideo',
      servicesIntro: 'Deslizá para conocer cada destino',
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
      servicesTitle: 'Transport',
      servicesSubtitle: 'Destinations from Montevideo',
      servicesIntro: 'Swipe to explore each destination',
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
      servicesTitle: 'Transporte',
      servicesSubtitle: 'Destinos desde Montevidéu',
      servicesIntro: 'Deslize para conhecer cada destino',
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

    $('brand-name').textContent = t.brandName;
    $('header-subtitle').textContent = t.headerSubtitle;
    $('vehicle-badge').textContent = t.vehicleBadge;
    $('comfort-subtitle').textContent = t.comfortSubtitle;
    $('driver-name').textContent = t.driverName;
    $('driver-role').textContent = t.driverRole;
    $('uber-label').textContent = t.uberLabel;
    $('uber-rating').textContent = t.uberRating;
    $('trips-label').textContent = t.tripsLabel;
    $('trips-count').textContent = t.tripsCount;
    $('years-label').textContent = t.yearsLabel;
    $('years-value').textContent = t.yearsValue;

    for (i = 0; i < t.comfortItems.length; i++) {
      $('comfort-' + (i + 1)).textContent = t.comfortItems[i];
    }

    $('qr-label').textContent = t.qrLabel;
    $('vehicle-qr-phone').textContent = t.phoneNumber;

    $('services-title').textContent = t.servicesTitle;
    $('services-subtitle').textContent = t.servicesSubtitle;
    $('services-intro').textContent = t.servicesIntro;
    $('dest-trip-note').textContent = t.tripNote;

    renderDestTabs();
    goToDestination(currentDest, false);

    $('review-gallery-title').textContent = t.reviewLabel;
    $('faq-title').textContent = t.faqTitle;
    renderFaq();
    showReview(shuffleIndex, false);

    $('lang-es').setAttribute('aria-pressed', String(lang === 'es'));
    $('lang-en').setAttribute('aria-pressed', String(lang === 'en'));
    $('lang-pt').setAttribute('aria-pressed', String(lang === 'pt'));
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

    if (currentSlide === 2) {
      startReviewRotation();
    } else {
      stopReviewRotation();
    }

    if (currentSlide === 1) {
      startDestRotation();
    } else {
      stopDestRotation();
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

  function showReview(index, animate) {
    if (!shuffledReviews.length) reshuffleReviews();

    var textEl = $('gallery-review-text');
    var authorEl = $('gallery-review-author');
    if (!shuffledReviews.length || !textEl || !authorEl) return;

    if (index >= shuffledReviews.length) {
      reshuffleReviews();
      index = 0;
    }
    if (index < 0) index = shuffledReviews.length - 1;
    shuffleIndex = index;

    var review = shuffledReviews[shuffleIndex];
    lastReviewText = review.text;

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
    showReview(shuffleIndex + 1, true);
  }

  function prevReview() {
    showReview(shuffleIndex - 1, true);
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
    var tabsEl = $('dest-tabs');
    var dotsEl = $('dest-dots');
    if (!tabsEl || !dotsEl) return;

    tabsEl.innerHTML = t.services.map(function (name, i) {
      return (
        '<button type="button" class="dest-tab' + (i === currentDest ? ' active' : '') + '" data-dest="' + i + '" role="tab" aria-selected="' + (i === currentDest) + '">' +
          name +
        '</button>'
      );
    }).join('');

    dotsEl.innerHTML = t.services.map(function (_, i) {
      return (
        '<button type="button" class="dest-dot' + (i === currentDest ? ' active' : '') + '" data-dest="' + i + '" aria-label="Destino ' + (i + 1) + '"></button>'
      );
    }).join('');
  }

  function renderDestSpots(index) {
    var t = translations[activeLang];
    var spotsEl = $('dest-spots');
    if (!spotsEl || !t.destinationSpots[index]) return;

    spotsEl.innerHTML = t.destinationSpots[index].map(function (spot, i) {
      return (
        '<div class="dest-spot" style="--spot-i:' + i + '">' +
          '<img src="' + spot.image + '" alt="" class="dest-spot-photo" loading="lazy">' +
          '<span class="dest-spot-name">' + spot.name + '</span>' +
          '<span class="dest-spot-desc">' + spot.desc + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function goToDestination(index, animate) {
    if (index < 0) index = TOTAL_DESTINATIONS - 1;
    else if (index >= TOTAL_DESTINATIONS) index = 0;

    currentDest = index;
    var t = translations[activeLang];
    var trip = t.tripInfo[index];

    var heroImg = $('dest-hero-img');
    var nameEl = $('dest-name');
    var badgeEl = $('dest-trip-badge');
    var slideEl = $('dest-slide');

    if (heroImg) heroImg.src = DEST_IMAGES[index];
    if (nameEl) nameEl.textContent = t.services[index];
    if (badgeEl) badgeEl.textContent = trip.distance + ' · ' + trip.duration;

    renderDestSpots(index);

    document.querySelectorAll('.dest-tab').forEach(function (tab, i) {
      var isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    document.querySelectorAll('.dest-dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
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

  function startDestRotation() {
    stopDestRotation();
    destTimer = setInterval(nextDestination, DEST_INTERVAL_MS);
  }

  function stopDestRotation() {
    clearInterval(destTimer);
    destTimer = null;
  }

  function pauseDestRotation() {
    stopDestRotation();
    if (currentSlide === 1) {
      destTimer = setTimeout(function () {
        startDestRotation();
      }, DEST_INTERVAL_MS * 2);
    }
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

  function setupPwa() {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      });
    }
  }

  function requestAppFullscreen() {
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
      var promise = req.call(el);
      if (promise && promise.catch) promise.catch(function () {});
    } catch (error) {}
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

    $('gallery-prev').addEventListener('click', function () {
      prevReview();
      stopReviewRotation();
      startReviewRotation();
    });

    $('gallery-next').addEventListener('click', function () {
      nextReview();
      stopReviewRotation();
      startReviewRotation();
    });

    $('dest-prev').addEventListener('click', function () {
      prevDestination();
      pauseDestRotation();
    });

    $('dest-next').addEventListener('click', function () {
      nextDestination();
      pauseDestRotation();
    });

    $('dest-tabs').addEventListener('click', function (e) {
      var tab = e.target.closest('.dest-tab');
      if (!tab) return;
      goToDestination(parseInt(tab.dataset.dest, 10), true);
      pauseDestRotation();
    });

    $('dest-dots').addEventListener('click', function (e) {
      var dot = e.target.closest('.dest-dot');
      if (!dot) return;
      goToDestination(parseInt(dot.dataset.dest, 10), true);
      pauseDestRotation();
    });

    $('faq-list').addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;
      toggleFaq(parseInt(btn.dataset.faq, 10));
    });

    var destViewport = $('dest-viewport');
    destViewport.addEventListener('touchstart', function (e) {
      destTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    destViewport.addEventListener('touchend', function (e) {
      var deltaX = e.changedTouches[0].screenX - destTouchStartX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) nextDestination();
      else prevDestination();
      pauseDestRotation();
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

    var app = document.querySelector('.app');
    if (app) {
      ['click', 'touchstart'].forEach(function (eventName) {
        app.addEventListener(eventName, requestAppFullscreen, { once: true, passive: true });
      });
    }
  }

  function init() {
    setLanguage(detectLanguage());
    goToSlide(0);
    bindEvents();
    setupPwa();
    requestAppFullscreen();
  }

  init();
})();
