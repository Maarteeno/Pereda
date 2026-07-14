(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v43';
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var swRegistration = null;

  var T = {
    es: {
      role: 'Conductor profesional',
      navPaseos: 'Paseos',
      navTraslados: 'Traslados',
      navContacto: 'Contacto',
      heroTitle: 'Traslados con conductor profesional',
      heroLead: 'Montevideo, Costa de Oro y trayectos a Punta del Este o Colonia. Viaje silencioso, cómodo y puntual — pedí presupuesto por WhatsApp.',
      chips: ['100% eléctrico', 'Viaje silencioso', 'Climatización', 'Maletero amplio', 'Puerta corrediza', 'Asientos amplios'],
      hubPaseosTitle: 'Paseos',
      hubPaseosDesc: 'Experiencias por Uruguay a tu ritmo.',
      hubTrasladosTitle: 'Traslados',
      hubTrasladosDesc: 'Aeropuerto, ciudad y costa con puntualidad.',
      hubContactoTitle: 'Contacto',
      hubContactoDesc: 'Escribile a Adrián por WhatsApp.',
      backHome: 'Inicio',
      titlePaseos: 'Paseos',
      titleTraslados: 'Traslados',
      titleContacto: 'Contacto',
      contactKicker: 'Hablemos',
      contactIntro: 'Contale a Adrián destino, horario y cantidad de pasajeros. Respuesta por WhatsApp.',
      driverRole: 'Conductor profesional. Montevideo y La Costa',
      contactCoverage: 'Montevideo, Costa de Oro y trayectos a PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% eléctrico',
      qrLabel: 'Escribile por WhatsApp',
      qrAction: 'Abrir WhatsApp',
      contactNote: 'Los precios se cotizan según trayecto. Sin tarifas fijas publicadas.',
      footer: 'Adrián Pereda — Traslados · Bestune NAT eléctrico · Montevideo, Uruguay',
      updateTitle: 'Nueva versión disponible',
      updateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateAction: 'Actualizar ahora'
    },
    en: {
      role: 'Professional driver',
      navPaseos: 'Tours',
      navTraslados: 'Transfers',
      navContacto: 'Contact',
      heroTitle: 'Transfers with a professional driver',
      heroLead: 'Montevideo, Costa de Oro and trips to Punta del Este or Colonia. Quiet, comfortable and on time — request a quote on WhatsApp.',
      chips: ['100% electric', 'Quiet ride', 'Climate control', 'Room for luggage', 'Sliding door', 'Spacious seats'],
      hubPaseosTitle: 'Tours',
      hubPaseosDesc: 'Experiences across Uruguay at your pace.',
      hubTrasladosTitle: 'Transfers',
      hubTrasladosDesc: 'Airport, city and coast — on time.',
      hubContactoTitle: 'Contact',
      hubContactoDesc: 'Message Adrián on WhatsApp.',
      backHome: 'Home',
      titlePaseos: 'Tours',
      titleTraslados: 'Transfers',
      titleContacto: 'Contact',
      contactKicker: "Let's talk",
      contactIntro: 'Tell Adrián the destination, time and number of passengers. Reply on WhatsApp.',
      driverRole: 'Professional driver. Montevideo and the Coast',
      contactCoverage: 'Montevideo, Gold Coast and routes to PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% electric',
      qrLabel: 'Message on WhatsApp',
      qrAction: 'Open WhatsApp',
      contactNote: 'Prices are quoted per trip. No fixed published rates.',
      footer: 'Adrián Pereda — Transfers · Electric Bestune NAT · Montevideo, Uruguay',
      updateTitle: 'New version available',
      updateText: 'An app update is ready. Update to see the latest design.',
      updateAction: 'Update now'
    },
    pt: {
      role: 'Motorista profissional',
      navPaseos: 'Passeios',
      navTraslados: 'Transfers',
      navContacto: 'Contato',
      heroTitle: 'Transfers com motorista profissional',
      heroLead: 'Montevidéu, Costa de Oro e trajetos a Punta del Este ou Colonia. Viagem silenciosa, confortável e pontual — peça orçamento no WhatsApp.',
      chips: ['100% elétrico', 'Viagem silenciosa', 'Climatização', 'Porta-malas amplo', 'Porta deslizante', 'Assentos espaçosos'],
      hubPaseosTitle: 'Passeios',
      hubPaseosDesc: 'Experiências pelo Uruguai no seu ritmo.',
      hubTrasladosTitle: 'Transfers',
      hubTrasladosDesc: 'Aeroporto, cidade e costa com pontualidade.',
      hubContactoTitle: 'Contato',
      hubContactoDesc: 'Fale com Adrián pelo WhatsApp.',
      backHome: 'Início',
      titlePaseos: 'Passeios',
      titleTraslados: 'Transfers',
      titleContacto: 'Contato',
      contactKicker: 'Vamos conversar',
      contactIntro: 'Conte a Adrián destino, horário e número de passageiros. Resposta no WhatsApp.',
      driverRole: 'Motorista profissional. Montevidéu e a Costa',
      contactCoverage: 'Montevidéu, Costa de Oro e trajetos a PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% elétrico',
      qrLabel: 'Fale pelo WhatsApp',
      qrAction: 'Abrir WhatsApp',
      contactNote: 'Os preços são cotados conforme o trajeto. Sem tarifas fixas publicadas.',
      footer: 'Adrián Pereda — Transfers · Bestune NAT elétrico · Montevidéu, Uruguai',
      updateTitle: 'Nova versão disponível',
      updateText: 'Há uma atualização do app. Atualize para ver o design mais recente.',
      updateAction: 'Atualizar agora'
    }
  };

  function $(id) { return document.getElementById(id); }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  function detectLanguage() {
    var stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && T[stored]) return stored;
    var nav = (navigator.language || 'es').toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt';
    if (nav.indexOf('en') === 0) return 'en';
    return 'es';
  }

  function setChipText(chip, label) {
    var svg = chip.querySelector('svg');
    chip.textContent = '';
    if (svg) chip.appendChild(svg);
    chip.appendChild(document.createTextNode(label));
  }

  function applyLang(lang) {
    if (!T[lang]) return;
    var t = T[lang];
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);

    setText('header-subtitle', t.role);
    setText('hero-title', t.heroTitle);
    setText('hero-lead', t.heroLead);
    setText('update-gate-title', t.updateTitle);
    setText('update-gate-text', t.updateText);
    setText('update-gate-btn', t.updateAction);

    document.querySelectorAll('.header-nav [data-open-screen]').forEach(function (btn) {
      var id = btn.getAttribute('data-open-screen');
      if (id === 'paseos') btn.textContent = t.navPaseos;
      if (id === 'traslados') btn.textContent = t.navTraslados;
      if (id === 'contacto') btn.textContent = t.navContacto;
    });

    document.querySelectorAll('.chip-row .chip').forEach(function (chip, i) {
      if (t.chips[i]) setChipText(chip, t.chips[i]);
    });

    var hubs = {
      paseos: [t.hubPaseosTitle, t.hubPaseosDesc],
      traslados: [t.hubTrasladosTitle, t.hubTrasladosDesc],
      contacto: [t.hubContactoTitle, t.hubContactoDesc]
    };
    Object.keys(hubs).forEach(function (key) {
      var copy = document.querySelector('.hub-btn[data-open-screen="' + key + '"] .hub-copy');
      if (!copy) return;
      var strong = copy.querySelector('strong');
      var span = copy.querySelector('span');
      if (strong) strong.textContent = hubs[key][0];
      if (span) span.textContent = hubs[key][1];
    });

    var titles = { paseos: t.titlePaseos, traslados: t.titleTraslados, contacto: t.titleContacto };
    Object.keys(titles).forEach(function (key) {
      var screen = document.querySelector('[data-screen="' + key + '"]');
      if (!screen) return;
      screen.setAttribute('aria-label', titles[key]);
      var bar = screen.querySelector(':scope > .screen-bar .screen-bar-title');
      if (bar) bar.textContent = titles[key];
      /* Keep exported section headlines (e.g. "Paseos y experiencias"); only sync Contacto h2. */
      if (key === 'contacto') {
        var headTitle = screen.querySelector('.section-title');
        if (headTitle) headTitle.textContent = titles[key];
      }
    });

    document.querySelectorAll('.screen-back[data-close-screen]').forEach(function (btn) {
      var svg = btn.querySelector('svg');
      btn.textContent = '';
      if (svg) btn.appendChild(svg);
      btn.appendChild(document.createTextNode(t.backHome));
    });

    var contact = document.querySelector('[data-screen="contacto"]');
    if (contact) {
      var kicker = contact.querySelector('.section-kicker');
      var intro = contact.querySelector('.section-intro');
      var role = contact.querySelector('.profile p');
      var lis = contact.querySelectorAll('.info-list li');
      var qrP = contact.querySelector('.qr-block > p:not(.phone)');
      var waBtn = contact.querySelector('.btn-wa-lg');
      var note = contact.querySelector('.note');
      if (kicker) kicker.textContent = t.contactKicker;
      if (intro) intro.textContent = t.contactIntro;
      if (role) role.textContent = t.driverRole;
      if (lis[0]) {
        var s0 = lis[0].querySelector('svg');
        lis[0].textContent = '';
        if (s0) lis[0].appendChild(s0);
        lis[0].appendChild(document.createTextNode(t.contactCoverage));
      }
      if (lis[1]) {
        var s1 = lis[1].querySelector('svg');
        lis[1].textContent = '';
        if (s1) lis[1].appendChild(s1);
        lis[1].appendChild(document.createTextNode(t.contactVehicle));
      }
      if (qrP) qrP.textContent = t.qrLabel;
      if (waBtn) {
        var wsvg = waBtn.querySelector('svg');
        waBtn.textContent = '';
        if (wsvg) waBtn.appendChild(wsvg);
        waBtn.appendChild(document.createTextNode(t.qrAction));
      }
      if (note) note.textContent = t.contactNote;
    }

    var footer = document.querySelector('footer .shell');
    if (footer) footer.textContent = t.footer;

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });
  }

  function clearCachesAndReload() {
    var done = function () {
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
      window.location.reload();
    };
    if ('caches' in window) {
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) { return caches.delete(key); }));
      }).then(done);
      return;
    }
    done();
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

  function initUi() {

          var imgs = Array.prototype.slice.call(document.querySelectorAll("#vehicle-rotator img"));
          var dots = Array.prototype.slice.call(document.querySelectorAll(".vehicle-dot"));
          var idx = 0;
          var timer = null;
          var ROTATE_MS = 7000;

          function show(i) {
            idx = (i + imgs.length) % imgs.length;
            imgs.forEach(function (img, n) {
              img.classList.toggle("is-active", n === idx);
            });
            dots.forEach(function (dot, n) {
              var on = n === idx;
              dot.classList.toggle("is-active", on);
              dot.setAttribute("aria-selected", on ? "true" : "false");
            });
          }

          function start() {
            stop();
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            timer = window.setInterval(function () { show(idx + 1); }, ROTATE_MS);
          }

          function stop() {
            if (timer) window.clearInterval(timer);
            timer = null;
          }

          dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
              show(Number(dot.getAttribute("data-index")) || 0);
              start();
            });
          });

          var stage = document.querySelector(".vehicle-stage");
          if (stage) {
            stage.addEventListener("mouseenter", stop);
            stage.addEventListener("mouseleave", start);
            stage.addEventListener("focusin", stop);
            stage.addEventListener("focusout", start);
          }

          show(0);
          start();

          /* Full-screen panels: only one visible at a time */
          var screens = Array.prototype.slice.call(document.querySelectorAll("[data-screen]"));
          var openers = Array.prototype.slice.call(document.querySelectorAll("[data-open-screen]"));
          var closers = Array.prototype.slice.call(document.querySelectorAll("[data-close-screen]"));
          var activeScreen = null;

          var homeRoot = document.querySelector("main.home");
          var siteHeader = document.querySelector(".site-header");
          var siteFooter = document.querySelector("footer");

          function setHomeInert(on) {
            [homeRoot, siteHeader, siteFooter].forEach(function (el) {
              if (!el) return;
              if (on) el.setAttribute("inert", "");
              else el.removeAttribute("inert");
              el.setAttribute("aria-hidden", on ? "true" : "false");
            });
          }

          function closeScreen() {
            screens.forEach(function (el) {
              el.classList.remove("is-open");
              el.setAttribute("aria-hidden", "true");
              el.setAttribute("inert", "");
              el.hidden = true;
              el.removeAttribute("aria-modal");
            });
            document.body.classList.remove("screen-open");
            setHomeInert(false);
            activeScreen = null;
            if (location.hash && /^#(paseos|traslados|contacto)$/.test(location.hash)) {
              history.replaceState(null, "", location.pathname + location.search);
            }
            start();
          }

          function openScreen(id) {
            var target = document.querySelector('[data-screen="' + id + '"]');
            if (!target) return;
            /* Close every screen first — no mixed content, no double-open */
            screens.forEach(function (el) {
              el.classList.remove("is-open");
              el.setAttribute("aria-hidden", "true");
              el.setAttribute("inert", "");
              el.hidden = true;
              el.removeAttribute("aria-modal");
            });
            target.hidden = false;
            target.removeAttribute("inert");
            target.classList.add("is-open");
            target.setAttribute("aria-hidden", "false");
            target.setAttribute("aria-modal", "true");
            document.body.classList.add("screen-open");
            setHomeInert(true);
            activeScreen = id;
            stop();
            var body = target.querySelector(".screen-body");
            if (body) body.scrollTop = 0;
            var back = target.querySelector("[data-close-screen]");
            if (back) back.focus();
            if (location.hash !== "#" + id) {
              history.replaceState(null, "", "#" + id);
            }
          }

          openers.forEach(function (btn) {
            btn.addEventListener("click", function () {
              openScreen(btn.getAttribute("data-open-screen"));
            });
          });

          closers.forEach(function (btn) {
            btn.addEventListener("click", closeScreen);
          });

          /* Nested paseo details inside Paseos screen */
          var paseoDetails = Array.prototype.slice.call(document.querySelectorAll("[data-paseo]"));
          var paseoOpeners = Array.prototype.slice.call(document.querySelectorAll("[data-open-paseo]"));
          var paseoClosers = Array.prototype.slice.call(document.querySelectorAll("[data-close-paseo]"));
          var paseosMain = document.querySelector(".screen-paseos-main");
          var paseosOuterBar = document.querySelector("#screen-paseos > .screen-bar");
          var activePaseo = null;

          function closePaseoDetail() {
            paseoDetails.forEach(function (el) {
              el.classList.remove("is-open");
              el.setAttribute("aria-hidden", "true");
              el.setAttribute("inert", "");
              el.hidden = true;
            });
            if (paseosMain) {
              paseosMain.removeAttribute("aria-hidden");
              paseosMain.removeAttribute("inert");
            }
            if (paseosOuterBar) {
              paseosOuterBar.removeAttribute("aria-hidden");
              paseosOuterBar.removeAttribute("inert");
              paseosOuterBar.hidden = false;
            }
            activePaseo = null;
          }

          function openPaseoDetail(id) {
            var target = document.querySelector('[data-paseo="' + id + '"]');
            if (!target) return;
            if (activeScreen !== "paseos") openScreen("paseos");
            paseoDetails.forEach(function (el) {
              el.classList.remove("is-open");
              el.setAttribute("aria-hidden", "true");
              el.setAttribute("inert", "");
              el.hidden = true;
            });
            if (paseosMain) {
              paseosMain.setAttribute("aria-hidden", "true");
              paseosMain.setAttribute("inert", "");
            }
            if (paseosOuterBar) {
              paseosOuterBar.setAttribute("aria-hidden", "true");
              paseosOuterBar.setAttribute("inert", "");
              paseosOuterBar.hidden = true;
            }
            target.hidden = false;
            target.removeAttribute("inert");
            target.classList.add("is-open");
            target.setAttribute("aria-hidden", "false");
            activePaseo = id;
            var body = target.querySelector(".screen-body");
            if (body) body.scrollTop = 0;
            var back = target.querySelector("[data-close-paseo]");
            if (back) back.focus();
          }

          paseoOpeners.forEach(function (btn) {
            btn.addEventListener("click", function () {
              openPaseoDetail(btn.getAttribute("data-open-paseo"));
            });
          });

          paseoClosers.forEach(function (btn) {
            btn.addEventListener("click", closePaseoDetail);
          });

          var _openScreen = openScreen;
          openScreen = function (id) {
            closePaseoDetail();
            _openScreen(id);
          };

          var _closeScreen = closeScreen;
          closeScreen = function () {
            closePaseoDetail();
            _closeScreen();
          };

          document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            if (activePaseo) {
              closePaseoDetail();
              var backHome = document.querySelector("#screen-paseos > .screen-bar [data-close-screen]");
              if (backHome) backHome.focus();
              return;
            }
            if (activeScreen) closeScreen();
          });

          function syncFromHash() {
            var id = (location.hash || "").replace(/^#/, "");
            if (id === "paseos" || id === "traslados" || id === "contacto") openScreen(id);
            else if (activeScreen) closeScreen();
          }

          window.addEventListener("hashchange", syncFromHash);
          syncFromHash();
    
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  applyLang(detectLanguage());
  initUi();
  setupPwa();
})();
