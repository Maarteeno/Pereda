(function (global) {
  'use strict';

  var SESSION_KEY = 'pereda-driver-session';
  var ADMIN_PIN = String(global.PEREDA_DEFAULT_ADMIN_PIN || '2991');
  var ADMIN_EMAIL = String(global.PEREDA_ADMIN_EMAIL || 'malerovi2014@gmail.com').toLowerCase();
  var db = null;
  var auth = null;
  var currentDriver = null;
  var isAdmin = false;
  var editingPin = null;
  var cachedPins = [];

  function $(id) { return document.getElementById(id); }

  function sha256(text) {
    var enc = new TextEncoder().encode(String(text));
    return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function initFirebase() {
    if (!global.firebase || !global.PEREDA_FIREBASE) {
      throw new Error('Firebase no disponible');
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(global.PEREDA_FIREBASE);
    }
    db = firebase.firestore();
    auth = firebase.auth();
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function setSession(driver) {
    currentDriver = driver;
    if (driver) sessionStorage.setItem(SESSION_KEY, JSON.stringify(driver));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function getDriver() {
    return currentDriver || getSession();
  }

  function phoneDigits(phone) {
    return String(phone || '').replace(/\D/g, '');
  }

  function formatPhoneDisplay(phone) {
    var d = phoneDigits(phone);
    if (d.indexOf('598') === 0 && d.length >= 11) {
      return '+' + d.slice(0, 3) + ' ' + d.slice(3, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    }
    return phone ? ('+' + d) : '';
  }

  function firstName(full) {
    return String(full || '').trim().split(/\s+/)[0] || full || '';
  }

  function isAdminUser(user) {
    return !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL);
  }

  function syncLock() {
    var gate = $('pin-gate');
    var panel = $('admin-panel');
    var locked = (gate && !gate.hidden) || (panel && !panel.hidden);
    document.body.classList.toggle('pin-locked', !!locked);
  }

  function showPinGate(on) {
    var gate = $('pin-gate');
    if (!gate) return;
    gate.hidden = !on;
    syncLock();
    if (on) {
      var input = $('pin-input');
      if (input) {
        input.value = '';
        setTimeout(function () { input.focus(); }, 50);
      }
    }
  }

  function showAdmin(on) {
    var panel = $('admin-panel');
    if (!panel) return;
    panel.hidden = !on;
    isAdmin = !!on;
    syncLock();
    if (on) {
      ensureSeedAsAdmin()
        .then(function () {
          refreshAdminList();
          loadLogs();
        })
        .catch(function (e) {
          console.error(e);
          setAdminMsg('Error al inicializar datos', true);
        });
    }
  }

  function applyDriverToUi(driver) {
    if (!driver) return;
    document.querySelectorAll('[data-driver-name]').forEach(function (el) {
      el.textContent = driver.name;
    });
    document.querySelectorAll('[data-driver-firstname]').forEach(function (el) {
      el.textContent = firstName(driver.name);
    });
    document.querySelectorAll('[data-driver-phone]').forEach(function (el) {
      el.textContent = formatPhoneDisplay(driver.phone);
    });
    if (typeof global.PeredaApplyDriverLinks === 'function') {
      global.PeredaApplyDriverLinks(driver);
    }
  }

  function logAccess(driver) {
    if (!db || !driver) return Promise.resolve();
    var ua = String(navigator.userAgent || '').slice(0, 160);
    return db.collection('accessLogs').add({
      pin: String(driver.pin || ''),
      name: String(driver.name || ''),
      phone: String(driver.phone || ''),
      at: firebase.firestore.FieldValue.serverTimestamp(),
      ua: ua
    }).catch(function (e) {
      console.warn('accessLog', e);
    });
  }

  function unlockDriver(driver) {
    setSession({ pin: driver.pin, name: driver.name, phone: driver.phone });
    showPinGate(false);
    showAdmin(false);
    applyDriverToUi(getDriver());
    logAccess(driver);
  }

  function showLogoutConfirm(on) {
    var el = $('logout-confirm');
    if (!el) return;
    el.hidden = !on;
  }

  function bindBrandTripleClick() {
    var clicks = 0;
    var timer = null;
    var brand = document.querySelector('[data-driver-name]');
    if (!brand) return;

    function onTriple() {
      if (!getDriver()) return;
      showLogoutConfirm(true);
    }

    brand.addEventListener('click', function (e) {
      e.preventDefault();
      clicks += 1;
      if (timer) window.clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        onTriple();
        return;
      }
      timer = window.setTimeout(function () { clicks = 0; }, 550);
    });

    var cancel = $('logout-cancel');
    var ok = $('logout-ok');
    if (cancel) {
      cancel.addEventListener('click', function () {
        showLogoutConfirm(false);
      });
    }
    if (ok) {
      ok.addEventListener('click', function () {
        showLogoutConfirm(false);
        clearSessionAndLock();
      });
    }
    var overlay = $('logout-confirm');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) showLogoutConfirm(false);
      });
    }
  }

  function clearSessionAndLock() {
    setSession(null);
    editingPin = null;
    showLogoutConfirm(false);
    showAdmin(false);
    var done = function () {
      showPinGate(true);
    };
    if (auth && auth.currentUser) {
      auth.signOut().then(done).catch(done);
    } else {
      done();
    }
  }

  function configRef() {
    return db.collection('config').doc('app');
  }

  function ensureSeedAsAdmin() {
    return configRef().get().then(function (snap) {
      if (snap.exists) {
        cachedPins = (snap.data().driverPins || []).slice();
        return snap.data();
      }
      var def = global.PEREDA_DEFAULT_DRIVER || { pin: '1001', name: 'Adrián Pereda', phone: '59899774019' };
      return sha256(ADMIN_PIN).then(function (hash) {
        var payload = {
          adminPinHash: hash,
          driverPins: [def.pin]
        };
        var driverPayload = {
          name: def.name,
          phone: phoneDigits(def.phone),
          active: true
        };
        return configRef().set(payload).then(function () {
          return db.collection('drivers').doc(def.pin).set(driverPayload);
        }).then(function () {
          cachedPins = [def.pin];
          return payload;
        });
      });
    });
  }

  function signInAdminWithGoogle() {
    var err = $('pin-error');
    if (err) {
      err.hidden = true;
      err.textContent = err.getAttribute('data-i18n-default') || 'PIN incorrecto';
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider).then(function (result) {
      var user = result.user;
      if (!isAdminUser(user)) {
        return auth.signOut().then(function () {
          if (err) {
            err.hidden = false;
            err.textContent = 'No autorizado. Solo ' + ADMIN_EMAIL;
          }
          showPinGate(true);
          return false;
        });
      }
      showPinGate(false);
      showAdmin(true);
      return true;
    }).catch(function (e) {
      console.error(e);
      if (err) {
        err.hidden = false;
        err.textContent = e.code === 'auth/popup-closed-by-user'
          ? 'Login cancelado'
          : 'Error de Google Sign-In. ¿Auth Google habilitado?';
      }
      showPinGate(true);
      return false;
    });
  }

  function tryUnlock(pin) {
    var err = $('pin-error');
    if (err) {
      err.hidden = true;
      if (!err.getAttribute('data-i18n-default')) {
        err.setAttribute('data-i18n-default', err.textContent || 'PIN incorrecto');
      }
      err.textContent = err.getAttribute('data-i18n-default');
    }
    pin = String(pin || '').trim();
    if (!/^\d{3,8}$/.test(pin)) {
      if (err) err.hidden = false;
      return Promise.resolve(false);
    }

    if (pin === ADMIN_PIN) {
      return signInAdminWithGoogle();
    }

    return db.collection('drivers').doc(pin).get().then(function (snap) {
      if (!snap.exists) {
        if (err) err.hidden = false;
        return false;
      }
      var data = snap.data() || {};
      if (data.active === false) {
        if (err) err.hidden = false;
        return false;
      }
      unlockDriver({
        pin: pin,
        name: data.name || 'Conductor',
        phone: phoneDigits(data.phone)
      });
      return true;
    }).catch(function (e) {
      console.error(e);
      if (err) {
        err.hidden = false;
        err.textContent = 'Error de conexión. Reintentá.';
      }
      return false;
    });
  }

  function setAdminMsg(text, isError) {
    var el = $('admin-msg');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.classList.toggle('is-error', !!isError);
  }

  function refreshAdminList() {
    var list = $('admin-list');
    if (!list || !db) return;
    list.innerHTML = '';
    configRef().get().then(function (snap) {
      var pins = (snap.exists && snap.data().driverPins) || [];
      cachedPins = pins.slice();
      return Promise.all(pins.map(function (pin) {
        return db.collection('drivers').doc(pin).get().then(function (d) {
          return { pin: pin, data: d.exists ? d.data() : null };
        });
      }));
    }).then(function (rows) {
      rows.forEach(function (row) {
        if (!row.data) return;
        var item = document.createElement('div');
        item.className = 'admin-driver';
        item.innerHTML =
          '<div><strong></strong><span></span></div>' +
          '<div class="admin-driver-actions">' +
          '<button type="button" data-edit></button>' +
          '<button type="button" data-del></button></div>';
        item.querySelector('strong').textContent = row.data.name;
        item.querySelector('span').textContent = 'PIN ' + row.pin + ' · ' + formatPhoneDisplay(row.data.phone);
        var editBtn = item.querySelector('[data-edit]');
        var delBtn = item.querySelector('[data-del]');
        editBtn.textContent = 'Editar';
        delBtn.textContent = 'Borrar';
        editBtn.addEventListener('click', function () {
          editingPin = row.pin;
          var form = $('admin-form');
          if (!form) return;
          form.pin.value = row.pin;
          form.pin.readOnly = true;
          form.name.value = row.data.name || '';
          form.phone.value = row.data.phone || '';
        });
        delBtn.addEventListener('click', function () {
          if (!confirm('¿Borrar PIN ' + row.pin + '?')) return;
          deleteDriver(row.pin);
        });
        list.appendChild(item);
      });
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('No se pudo cargar la lista', true);
    });
  }

  function formatLogTime(ts) {
    if (!ts) return '—';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return '—';
    try {
      return d.toLocaleString('es-UY', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (e) {
      return d.toISOString();
    }
  }

  function loadLogs() {
    var list = $('admin-logs');
    if (!list || !db) return;
    list.innerHTML = '<p class="admin-logs-empty">Cargando…</p>';
    db.collection('accessLogs')
      .orderBy('at', 'desc')
      .limit(50)
      .get()
      .then(function (snap) {
        list.innerHTML = '';
        if (snap.empty) {
          list.innerHTML = '<p class="admin-logs-empty">Sin ingresos todavía.</p>';
          return;
        }
        snap.forEach(function (doc) {
          var row = doc.data() || {};
          var item = document.createElement('div');
          item.className = 'admin-log';
          item.innerHTML = '<strong></strong><span></span><em></em>';
          item.querySelector('strong').textContent = row.name || 'Conductor';
          item.querySelector('span').textContent =
            'PIN ' + (row.pin || '—') + ' · ' + formatPhoneDisplay(row.phone || '');
          item.querySelector('em').textContent = formatLogTime(row.at);
          list.appendChild(item);
        });
      })
      .catch(function (e) {
        console.error(e);
        list.innerHTML = '<p class="admin-logs-empty is-error">No se pudieron cargar los logs.</p>';
      });
  }

  function generatePin() {
    var used = {};
    cachedPins.forEach(function (p) { used[p] = true; });
    used[ADMIN_PIN] = true;
    var pin = '';
    var tries = 0;
    do {
      pin = String(Math.floor(1000 + Math.random() * 9000));
      tries += 1;
    } while (used[pin] && tries < 200);
    var form = $('admin-form');
    if (form && form.pin) {
      form.pin.readOnly = false;
      form.pin.value = pin;
      editingPin = null;
      form.pin.focus();
    }
    setAdminMsg('PIN generado: ' + pin);
  }

  function upsertDriver(pin, name, phone) {
    pin = String(pin || '').trim();
    name = String(name || '').trim();
    phone = phoneDigits(phone);
    if (!/^\d{3,8}$/.test(pin) || !name || phone.length < 8) {
      setAdminMsg('Datos inválidos', true);
      return Promise.resolve();
    }
    if (pin === ADMIN_PIN) {
      setAdminMsg('Ese PIN está reservado para admin', true);
      return Promise.resolve();
    }
    return configRef().get().then(function (snap) {
      var cfg = snap.exists ? snap.data() : { adminPinHash: '', driverPins: [] };
      var pins = (cfg.driverPins || []).slice();
      if (pins.indexOf(pin) === -1) pins.push(pin);
      return sha256(ADMIN_PIN).then(function (hash) {
        return db.collection('drivers').doc(pin).set({
          name: name,
          phone: phone,
          active: true
        }).then(function () {
          return configRef().set({
            adminPinHash: cfg.adminPinHash || hash,
            driverPins: pins
          });
        });
      });
    }).then(function () {
      setAdminMsg('Guardado');
      editingPin = null;
      var form = $('admin-form');
      if (form) {
        form.reset();
        form.pin.readOnly = false;
      }
      refreshAdminList();
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al guardar (¿sesión Google?)', true);
    });
  }

  function deleteDriver(pin) {
    return configRef().get().then(function (snap) {
      var cfg = snap.exists ? snap.data() : { driverPins: [] };
      var pins = (cfg.driverPins || []).filter(function (p) { return p !== pin; });
      return sha256(ADMIN_PIN).then(function (hash) {
        return db.collection('drivers').doc(pin).delete().then(function () {
          return configRef().set({
            adminPinHash: cfg.adminPinHash || hash,
            driverPins: pins
          });
        });
      });
    }).then(function () {
      setAdminMsg('Eliminado');
      refreshAdminList();
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al borrar', true);
    });
  }

  function bindUi() {
    bindBrandTripleClick();
    var form = $('pin-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        tryUnlock(($('pin-input') || {}).value);
      });
    }
    var exit = $('admin-exit');
    if (exit) exit.addEventListener('click', clearSessionAndLock);
    var clear = $('admin-clear');
    if (clear) {
      clear.addEventListener('click', function () {
        editingPin = null;
        var f = $('admin-form');
        if (f) {
          f.reset();
          f.pin.readOnly = false;
        }
        setAdminMsg('');
      });
    }
    var gen = $('admin-generate-pin');
    if (gen) gen.addEventListener('click', generatePin);
    var refreshLogs = $('admin-refresh-logs');
    if (refreshLogs) refreshLogs.addEventListener('click', loadLogs);
    var adminForm = $('admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', function (e) {
        e.preventDefault();
        upsertDriver(adminForm.pin.value, adminForm.name.value, adminForm.phone.value);
      });
    }
  }

  function start(onReady) {
    var readyOnce = false;
    function ready(driver) {
      if (readyOnce) return;
      readyOnce = true;
      if (onReady) onReady(driver);
    }

    try {
      initFirebase();
    } catch (e) {
      console.error(e);
      showPinGate(true);
      var err = $('pin-error');
      if (err) {
        err.hidden = false;
        err.textContent = 'Firebase no cargó';
      }
      ready(null);
      return;
    }
    bindUi();

    auth.onAuthStateChanged(function (user) {
      if (isAdminUser(user)) {
        setSession(null);
        showPinGate(false);
        showAdmin(true);
        ready(null);
        return;
      }
      if (user && !isAdminUser(user)) {
        auth.signOut();
        return;
      }
      var existing = getSession();
      if (existing && existing.phone) {
        currentDriver = existing;
        showAdmin(false);
        showPinGate(false);
        applyDriverToUi(existing);
        ready(existing);
        return;
      }
      showAdmin(false);
      showPinGate(true);
      ready(null);
    });
  }

  global.PeredaSession = {
    start: start,
    getDriver: getDriver,
    phoneDigits: phoneDigits,
    firstName: firstName,
    clearSessionAndLock: clearSessionAndLock
  };
})(window);
