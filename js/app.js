(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v34';
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var VEHICLE_ROTATE_MS = 8000;

  var activeLang = 'es';
  var currentView = 'home';
  var vehicleRotateTimer = null;
  var currentVehicleView = 0;
  var swRegistration = null;

  var translations = {
    es: {
      brandName: 'Adrián Pereda',
      vehicleBadge: '100% Eléctrico',
      hubTraslados: 'Traslados',
      hubPaseos: 'Paseos',
      hubContacto: 'Contacto',
      hubSoftware: 'Software',
      backLabel: 'Volver',
      trasladosTitle: 'Traslados',
      paseosTitle: 'Paseos',
      paseosIntro: 'Paseos y experiencias en Uruguay',
      contactoTitle: 'Contacto',
      driverName: 'Adrián',
      driverRole: 'Conductor Profesional. Montevideo y La Costa',
      uberLabel: 'Valoración Uber',
      uberRating: '4.99',
      tripsLabel: 'Viajes realizados',
      tripsCount: '+40.000',
      yearsLabel: 'Años de servicio',
      yearsValue: '9,5',
      qrLabel: 'Escribile por WhatsApp',
      qrAction: 'Abrir WhatsApp',
      phoneNumber: '+598 99 774 019',
      trasladosItems: [
        { image: 'assets/destinations/punta-del-este-ai.png', name: 'Punta del Este', spots: ['La Mano', 'Playa Brava', 'Puerto de Punta'] },
        { image: 'assets/destinations/colonia-ai.png', name: 'Colonia del Sacramento', spots: ['Barrio Histórico', 'Faro de Colonia', 'Calle de los Suspiros'] },
        { image: 'assets/destinations/montevideo-ai.png', name: 'Montevideo', spots: ['Aeropuerto Carrasco', 'Centro', 'Rambla'] }
      ],
      paseosItems: [
        { image: 'assets/paseos/montevideo-ai.png', name: 'Montevideo', spots: ['Estadio Centenario', 'Rambla', 'Parque Rodó'] },
        { image: 'assets/paseos/eventos-ai.png', name: 'Eventos', spots: ['Bodas', 'Salones', 'Congresos'] },
        { image: 'assets/paseos/costa-ai.png', name: 'Costa y hoteles', spots: ['Punta del Este', 'La Barra', 'José Ignacio'] }
      ],
      softwareTitle: 'Software Mac',
      softwareBrand: 'Silicon Software',
      softwareIntro: 'Catálogo exclusivo para Mac',
      softwarePhoneLabel: 'WhatsApp',
      softwarePhone: '+598 91 555 764',
      softwareSiteLabel: 'silicon-software.web.app',
      softwarePayments: 'Formas de pago: PREX · Transferencia · Efectivo',
      softwareServices: [
        'Retiro o recepción a coordinar',
        'Instalación presencial en tu Mac',
        'Instalación remota',
        'Soporte 6 meses'
      ],
      softwareApps: [
        { name: 'Microsoft Office', desc: 'Word, Excel, PowerPoint y Outlook' },
        { name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere' },
        { name: 'Final Cut Pro', desc: 'Edición de video profesional' },
        { name: 'Logic Pro', desc: 'Producción musical en Mac' },
        { name: 'Parallels Desktop', desc: 'Windows en tu Mac' },
        { name: 'CleanMyMac', desc: 'Mantenimiento y optimización' }
      ],
      updateGateTitle: 'Nueva versión disponible',
      updateGateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateGateAction: 'Actualizar ahora'
    },
    en: {
      brandName: 'Adrián Pereda',
      vehicleBadge: '100% Electric',
      hubTraslados: 'Transfers',
      hubPaseos: 'Tours',
      hubContacto: 'Contact',
      hubSoftware: 'Software',
      backLabel: 'Back',
      trasladosTitle: 'Transfers',
      paseosTitle: 'Tours',
      paseosIntro: 'Tours and experiences in Uruguay',
      contactoTitle: 'Contact',
      driverName: 'Adrián',
      driverRole: 'Professional Driver. Montevideo and the Coast',
      uberLabel: 'Uber rating',
      uberRating: '4.99',
      tripsLabel: 'Trips completed',
      tripsCount: '40,000+',
      yearsLabel: 'Years of service',
      yearsValue: '9.5',
      qrLabel: 'Message on WhatsApp',
      qrAction: 'Open WhatsApp',
      phoneNumber: '+598 99 774 019',
      trasladosItems: [
        { image: 'assets/destinations/punta-del-este-ai.png', name: 'Punta del Este', spots: ['La Mano', 'Brava Beach', 'Punta del Este Port'] },
        { image: 'assets/destinations/colonia-ai.png', name: 'Colonia del Sacramento', spots: ['Historic Quarter', 'Colonia Lighthouse', 'Street of Sighs'] },
        { image: 'assets/destinations/montevideo-ai.png', name: 'Montevideo', spots: ['Carrasco Airport', 'Downtown', 'Waterfront'] }
      ],
      paseosItems: [
        { image: 'assets/paseos/montevideo-ai.png', name: 'Montevideo', spots: ['Estadio Centenario', 'Waterfront', 'Parque Rodó'] },
        { image: 'assets/paseos/eventos-ai.png', name: 'Events', spots: ['Weddings', 'Venues', 'Conferences'] },
        { image: 'assets/paseos/costa-ai.png', name: 'Coast and hotels', spots: ['Punta del Este', 'La Barra', 'José Ignacio'] }
      ],
      softwareTitle: 'Mac Software',
      softwareBrand: 'Silicon Software',
      softwareIntro: 'Exclusive catalog for Mac',
      softwarePhoneLabel: 'WhatsApp',
      softwarePhone: '+598 91 555 764',
      softwareSiteLabel: 'silicon-software.web.app',
      softwarePayments: 'Payment: PREX · Bank transfer · Cash',
      softwareServices: [
        'Pickup or delivery by appointment',
        'On-site installation on your Mac',
        'Remote installation',
        '6 months support'
      ],
      softwareApps: [
        { name: 'Microsoft Office', desc: 'Word, Excel, PowerPoint and Outlook' },
        { name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere' },
        { name: 'Final Cut Pro', desc: 'Professional video editing' },
        { name: 'Logic Pro', desc: 'Music production on Mac' },
        { name: 'Parallels Desktop', desc: 'Windows on your Mac' },
        { name: 'CleanMyMac', desc: 'Maintenance and optimization' }
      ],
      updateGateTitle: 'New version available',
      updateGateText: 'An app update is ready. Refresh to see the latest layout.',
      updateGateAction: 'Update now'
    },
    pt: {
      brandName: 'Adrián Pereda',
      vehicleBadge: '100% Elétrico',
      hubTraslados: 'Transfers',
      hubPaseos: 'Passeios',
      hubContacto: 'Contato',
      hubSoftware: 'Software',
      backLabel: 'Voltar',
      trasladosTitle: 'Transfers',
      paseosTitle: 'Passeios',
      paseosIntro: 'Passeios e experiências no Uruguai',
      contactoTitle: 'Contato',
      driverName: 'Adrián',
      driverRole: 'Motorista Profissional. Montevidéu e o Litoral',
      uberLabel: 'Avaliação Uber',
      uberRating: '4.99',
      tripsLabel: 'Viagens realizadas',
      tripsCount: '+40.000',
      yearsLabel: 'Anos de serviço',
      yearsValue: '9,5',
      qrLabel: 'Escreva no WhatsApp',
      qrAction: 'Abrir WhatsApp',
      phoneNumber: '+598 99 774 019',
      trasladosItems: [
        { image: 'assets/destinations/punta-del-este-ai.png', name: 'Punta del Este', spots: ['La Mano', 'Playa Brava', 'Porto de Punta del Este'] },
        { image: 'assets/destinations/colonia-ai.png', name: 'Colonia del Sacramento', spots: ['Bairro Histórico', 'Farol de Colonia', 'Calle de los Suspiros'] },
        { image: 'assets/destinations/montevideo-ai.png', name: 'Montevidéu', spots: ['Aeroporto Carrasco', 'Centro', 'Rambla'] }
      ],
      paseosItems: [
        { image: 'assets/paseos/montevideo-ai.png', name: 'Montevidéu', spots: ['Estádio Centenário', 'Rambla', 'Parque Rodó'] },
        { image: 'assets/paseos/eventos-ai.png', name: 'Eventos', spots: ['Casamentos', 'Salões', 'Congressos'] },
        { image: 'assets/paseos/costa-ai.png', name: 'Costa e hotéis', spots: ['Punta del Este', 'La Barra', 'José Ignacio'] }
      ],
      softwareTitle: 'Software Mac',
      softwareBrand: 'Silicon Software',
      softwareIntro: 'Catálogo exclusivo para Mac',
      softwarePhoneLabel: 'WhatsApp',
      softwarePhone: '+598 91 555 764',
      softwareSiteLabel: 'silicon-software.web.app',
      softwarePayments: 'Pagamento: PREX · Transferência · Dinheiro',
      softwareServices: [
        'Retirada ou recepção a combinar',
        'Instalação presencial no seu Mac',
        'Instalação remota',
        'Suporte 6 meses'
      ],
      softwareApps: [
        { name: 'Microsoft Office', desc: 'Word, Excel, PowerPoint e Outlook' },
        { name: 'Adobe Creative Cloud', desc: 'Photoshop, Illustrator, Premiere' },
        { name: 'Final Cut Pro', desc: 'Edição de vídeo profissional' },
        { name: 'Logic Pro', desc: 'Produção musical no Mac' },
        { name: 'Parallels Desktop', desc: 'Windows no seu Mac' },
        { name: 'CleanMyMac', desc: 'Manutenção e otimização' }
      ],
      updateGateTitle: 'Nova versão disponível',
      updateGateText: 'Há uma atualização do app. Atualize para ver o layout mais recente.',
      updateGateAction: 'Atualizar agora'
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

  function renderDestCards(containerId, items) {
    var container = $(containerId);
    if (!container || !items) return;

    container.innerHTML = items.map(function (item) {
      var spotsHtml = item.spots.map(function (spot) {
        return '<li class="dest-card-spot">' + spot + '</li>';
      }).join('');
      return (
        '<article class="dest-card">' +
          '<img src="' + item.image + '" alt="" class="dest-card-image" loading="lazy">' +
          '<div class="dest-card-body">' +
            '<h3 class="dest-card-title">' + item.name + '</h3>' +
            '<ul class="dest-card-spots">' + spotsHtml + '</ul>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderSoftware(t) {
    var serviceList = $('software-service-list');
    var appsGrid = $('software-apps-grid');

    if (serviceList) {
      serviceList.innerHTML = t.softwareServices.map(function (line) {
        return '<li class="software-service-item">' + line + '</li>';
      }).join('');
    }

    if (appsGrid) {
      appsGrid.innerHTML = t.softwareApps.map(function (app) {
        return (
          '<article class="software-app-card">' +
            '<h4 class="software-app-name">' + app.name + '</h4>' +
            '<p class="software-app-desc">' + app.desc + '</p>' +
          '</article>'
        );
      }).join('');
    }
  }

  function renderTranslations(lang) {
    var t = translations[lang];

    setText('brand-name', t.brandName);
    setText('vehicle-badge', t.vehicleBadge);
    setText('hub-traslados-label', t.hubTraslados);
    setText('hub-paseos-label', t.hubPaseos);
    setText('hub-contacto-label', t.hubContacto);
    setText('hub-software-label', t.hubSoftware);
    setText('back-traslados-label', t.backLabel);
    setText('back-paseos-label', t.backLabel);
    setText('back-contacto-label', t.backLabel);
    setText('back-software-label', t.backLabel);
    setText('traslados-title', t.trasladosTitle);
    setText('paseos-title', t.paseosTitle);
    setText('paseos-intro', t.paseosIntro);
    setText('contacto-title', t.contactoTitle);
    setText('driver-name', t.driverName);
    setText('driver-role', t.driverRole);
    setText('uber-label', t.uberLabel);
    setText('uber-rating', t.uberRating);
    setText('trips-label', t.tripsLabel);
    setText('trips-count', t.tripsCount);
    setText('years-label', t.yearsLabel);
    setText('years-value', t.yearsValue);
    setText('qr-label', t.qrLabel);
    setText('qr-action-btn', t.qrAction);
    setText('vehicle-qr-phone', t.phoneNumber);
    setText('software-title', t.softwareTitle);
    setText('software-brand', t.softwareBrand);
    setText('software-intro', t.softwareIntro);
    setText('software-phone-label', t.softwarePhoneLabel);
    setText('software-phone', t.softwarePhone);
    setText('software-site-link', t.softwareSiteLabel);
    setText('software-payments', t.softwarePayments);
    setText('update-gate-title', t.updateGateTitle);
    setText('update-gate-text', t.updateGateText);
    setText('update-gate-btn', t.updateGateAction);

    renderDestCards('traslados-cards', t.trasladosItems);
    renderDestCards('paseos-cards', t.paseosItems);
    renderSoftware(t);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    activeLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    renderTranslations(lang);
  }

  function showView(name) {
    if (!name) name = 'home';
    currentView = name;

    document.querySelectorAll('.app-view').forEach(function (view) {
      var isActive = view.id === 'view-' + name;
      view.classList.toggle('app-view-active', isActive);
      view.hidden = !isActive;
    });

    if (name === 'home') {
      startVehicleRotation();
    } else {
      stopVehicleRotation();
    }
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
    document.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('click', function () {
        showView(el.dataset.view);
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
      });
    });
  }

  function init() {
    setLanguage(detectLanguage());
    showView('home');
    bindEvents();
    setupPwa();
  }

  init();
})();
