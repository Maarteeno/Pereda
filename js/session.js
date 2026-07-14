(function (global) {
  'use strict';

  var SESSION_KEY = 'pereda-driver-session';
  var ADMIN_EMAIL = String(global.PEREDA_ADMIN_EMAIL || 'malerovi2014@gmail.com').toLowerCase();
  var db = null;
  var auth = null;
  var currentDriver = null;
  var isAdmin = false;
  var cachedPins = [];
  var accountCache = null;
  var adminListSeq = 0;
  var adminReqSeq = 0;
  var adminView = 'drivers';
  var authView = 'google';
  var routeReady = null;

  function $(id) { return document.getElementById(id); }

  function uniquePins(pins) {
    return Array.from(new Set((pins || []).map(String).filter(Boolean)));
  }

  function sanitizeText(value, maxLen) {
    var text = String(value || '')
      .replace(/[\u0000-\u001F\u007F<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (maxLen && text.length > maxLen) text = text.slice(0, maxLen);
    return text;
  }

  function sanitizePhone(value) {
    return phoneDigits(value).slice(0, 20);
  }

  function pinHintFrom(pin) {
    var p = String(pin || '');
    if (p.length <= 2) return p;
    return p.slice(-2);
  }

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

  function setGateError(text) {
    var err = $('pin-error');
    if (!err) return;
    err.hidden = !text;
    if (text) err.textContent = text;
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
  }

  function setAuthView(view) {
    authView = view || 'google';
    document.querySelectorAll('[data-auth-view]').forEach(function (el) {
      el.hidden = el.getAttribute('data-auth-view') !== authView;
    });
    setGateError('');
    if (authView === 'pin') {
      var input = $('pin-input');
      if (input) {
        input.value = '';
        setTimeout(function () { input.focus(); }, 50);
      }
    }
  }

  function accountRef(uid) {
    return db.collection('driverAccounts').doc(uid);
  }

  function configRef() {
    return db.collection('config').doc('app');
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
    if (!db || !driver || !auth || !auth.currentUser) return Promise.resolve();
    var ua = String(navigator.userAgent || '').slice(0, 160);
    return db.collection('accessLogs').add({
      pinHint: pinHintFrom(driver.pin),
      name: sanitizeText(driver.name, 80),
      phone: sanitizePhone(driver.phone),
      uid: auth.currentUser.uid,
      at: firebase.firestore.FieldValue.serverTimestamp(),
      ua: ua
    }).catch(function (e) {
      console.warn('accessLog', e);
    });
  }

  function unlockDriver(driver) {
    setSession({
      pin: driver.pin,
      name: driver.name,
      phone: driver.phone,
      uid: driver.uid || (auth.currentUser && auth.currentUser.uid) || ''
    });
    showAdmin(false);
    showPinGate(false);
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

    brand.addEventListener('click', function (e) {
      e.preventDefault();
      if (!getDriver()) return;
      clicks += 1;
      if (timer) window.clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        showLogoutConfirm(true);
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
    accountCache = null;
    showLogoutConfirm(false);
    showAdmin(false);
    var done = function () {
      showPinGate(true);
      setAuthView('google');
    };
    if (auth && auth.currentUser) {
      auth.signOut().then(done).catch(done);
    } else {
      done();
    }
  }

  function signOutToGoogle() {
    setSession(null);
    accountCache = null;
    showAdmin(false);
    showPinGate(true);
    setAuthView('google');
    if (auth && auth.currentUser) {
      return auth.signOut();
    }
    return Promise.resolve();
  }

  function googleProvider() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }

  function signInWithGoogle() {
    setGateError('');
    return auth.signInWithPopup(googleProvider()).catch(function (e) {
      console.error(e);
      var useRedirect = e && (
        e.code === 'auth/popup-blocked' ||
        e.code === 'auth/operation-not-supported-in-this-environment' ||
        e.code === 'auth/cancelled-popup-request' ||
        (e.message && /Cross-Origin-Opener-Policy|window\.closed/i.test(e.message))
      );
      if (useRedirect) {
        setGateError('Abriendo login Google…');
        return auth.signInWithRedirect(googleProvider());
      }
      if (e.code === 'auth/popup-closed-by-user') {
        setGateError('Login cancelado');
      } else {
        setGateError('Error de Google Sign-In. ¿Auth Google habilitado?');
      }
      return null;
    });
  }

  function loadAccount(uid) {
    return accountRef(uid).get().then(function (snap) {
      accountCache = snap.exists ? Object.assign({ id: snap.id }, snap.data()) : null;
      return accountCache;
    });
  }

  function submitRegistration(name, phone, vehicleMake, vehicleModel) {
    var user = auth.currentUser;
    if (!user) return Promise.reject(new Error('Sin sesión'));
    name = sanitizeText(name, 80);
    phone = sanitizePhone(phone);
    vehicleMake = sanitizeText(vehicleMake, 80);
    vehicleModel = sanitizeText(vehicleModel, 80);
    if (!name || phone.length < 8 || !vehicleMake || !vehicleModel) {
      setGateError('Completá nombre, teléfono y vehículo');
      return Promise.resolve(false);
    }
    return accountRef(user.uid).set({
      email: String(user.email || '').toLowerCase(),
      name: name,
      phone: phone,
      vehicleMake: vehicleMake,
      vehicleModel: vehicleModel,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      accountCache = {
        id: user.uid,
        email: String(user.email || '').toLowerCase(),
        name: name,
        phone: phone,
        vehicleMake: vehicleMake,
        vehicleModel: vehicleModel,
        status: 'pending'
      };
      setAuthView('pending');
      return true;
    }).catch(function (e) {
      console.error(e);
      setGateError('No se pudo enviar la solicitud');
      return false;
    });
  }

  function ackPinReveal(uid) {
    return accountRef(uid).update({
      pinRevealOnce: firebase.firestore.FieldValue.delete()
    }).then(function () {
      if (accountCache) delete accountCache.pinRevealOnce;
    }).catch(function (e) {
      console.warn('ack reveal', e);
    });
  }

  function routeSignedInUser(user) {
    if (isAdminUser(user)) {
      setSession(null);
      showPinGate(false);
      showAdmin(true);
      routeReady();
      return Promise.resolve();
    }

    return loadAccount(user.uid).then(function (account) {
      showAdmin(false);
      showPinGate(true);

      if (!account) {
        setAuthView('register');
        var nameInput = $('register-name');
        if (nameInput && user.displayName) nameInput.value = user.displayName;
        routeReady();
        return;
      }

      if (account.status === 'pending') {
        setAuthView('pending');
        routeReady();
        return;
      }

      if (account.status === 'disabled') {
        setAuthView('pending');
        setGateError('Tu cuenta está desactivada. Contactá al admin.');
        routeReady();
        return;
      }

      if (account.status === 'active') {
        if (account.pinRevealOnce) {
          var revealEl = $('auth-pin-reveal');
          if (revealEl) revealEl.textContent = String(account.pinRevealOnce);
          setAuthView('reveal');
          routeReady();
          return;
        }

        var existing = getSession();
        if (existing && existing.uid === user.uid && existing.phone) {
          currentDriver = existing;
          showPinGate(false);
          applyDriverToUi(existing);
          routeReady();
          return;
        }

        setAuthView('pin');
        routeReady();
        return;
      }

      setAuthView('register');
      routeReady();
    }).catch(function (e) {
      console.error(e);
      showPinGate(true);
      setAuthView('google');
      setGateError('Error al cargar tu cuenta');
      routeReady();
    });
  }

  function findPinForUid(uid) {
    return configRef().get().then(function (snap) {
      var pins = uniquePins((snap.exists && snap.data().driverPins) || []);
      cachedPins = pins.slice();
      return Promise.all(pins.map(function (pin) {
        return db.collection('drivers').doc(pin).get().then(function (d) {
          if (!d.exists) return null;
          var data = d.data() || {};
          if (data.uid === uid) {
            return { pin: pin, data: data };
          }
          return null;
        });
      }));
    }).then(function (rows) {
      for (var i = 0; i < rows.length; i += 1) {
        if (rows[i]) return rows[i];
      }
      return null;
    });
  }

  function tryUnlockWithPin(pin) {
    var user = auth.currentUser;
    if (!user) {
      setGateError('Primero iniciá con Google');
      setAuthView('google');
      return Promise.resolve(false);
    }
    pin = String(pin || '').trim();
    if (!/^\d{3,8}$/.test(pin)) {
      setGateError('PIN incorrecto');
      return Promise.resolve(false);
    }

    return loadAccount(user.uid).then(function (account) {
      if (!account || account.status !== 'active' || !account.pinHash) {
        setGateError('Cuenta no activa');
        return false;
      }
      return sha256(pin).then(function (hash) {
        if (hash !== account.pinHash) {
          setGateError('PIN incorrecto');
          return false;
        }
        return db.collection('drivers').doc(pin).get().then(function (snap) {
          if (!snap.exists) {
            setGateError('PIN no vinculado. Pedile al admin que reactive tu cuenta.');
            return false;
          }
          var data = snap.data() || {};
          if (data.uid !== user.uid || data.active === false) {
            setGateError('PIN incorrecto');
            return false;
          }
          unlockDriver({
            pin: pin,
            name: account.name || data.name || 'Conductor',
            phone: phoneDigits(account.phone || data.phone || ''),
            uid: user.uid
          });
          return true;
        });
      });
    }).catch(function (e) {
      console.error(e);
      setGateError('Error de conexión. Reintentá.');
      return false;
    });
  }

  function setAdminView(view) {
    if (view === 'logs' || view === 'requests') adminView = view;
    else adminView = 'drivers';
    document.querySelectorAll('[data-admin-nav]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-admin-nav') === adminView);
    });
    document.querySelectorAll('[data-admin-view]').forEach(function (section) {
      section.hidden = section.getAttribute('data-admin-view') !== adminView;
    });
    if (adminView === 'logs') loadLogs();
    if (adminView === 'requests') refreshRequests();
    if (adminView === 'drivers') refreshAdminList();
  }

  function updateRequestsBadge(count) {
    var badge = $('admin-requests-badge');
    if (!badge) return;
    var n = Number(count) || 0;
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? '99+' : String(n);
    } else {
      badge.hidden = true;
      badge.textContent = '';
    }
  }

  function refreshPendingBadge() {
    if (!db || !isAdmin) return;
    db.collection('driverAccounts').where('status', '==', 'pending').get()
      .then(function (snap) {
        updateRequestsBadge(snap.size);
      })
      .catch(function () {
        updateRequestsBadge(0);
      });
  }

  function showAdmin(on) {
    var panel = $('admin-panel');
    if (!panel) return;
    panel.hidden = !on;
    isAdmin = !!on;
    syncLock();
    if (on) {
      setAdminView('drivers');
      ensureSeedAsAdmin()
        .then(function () {
          refreshAdminList();
          refreshPendingBadge();
        })
        .catch(function (e) {
          console.error(e);
          setAdminMsg('Error al inicializar datos', true);
        });
    } else {
      updateRequestsBadge(0);
    }
  }

  function setAdminMsg(text, isError) {
    var el = $('admin-msg');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.classList.toggle('is-error', !!isError);
  }

  function ensureSeedAsAdmin() {
    return configRef().get().then(function (snap) {
      if (snap.exists) {
        var data = snap.data() || {};
        var pins = uniquePins(data.driverPins);
        cachedPins = pins.slice();
        var writeCfg = pins.length !== (data.driverPins || []).length
          ? configRef().set({
              adminPinHash: data.adminPinHash || 'legacy',
              driverPins: pins
            })
          : Promise.resolve();
        return writeCfg.then(function () {
          return Promise.all(pins.map(function (pin) {
            return db.collection('drivers').doc(pin).get().then(function (d) {
              if (!d.exists) return null;
              var row = d.data() || {};
              if (typeof row.uid === 'string') return null;
              return d.ref.set({
                name: row.name || '',
                phone: phoneDigits(row.phone),
                active: row.active !== false,
                uid: ''
              });
            });
          }));
        }).then(function () {
          return { adminPinHash: data.adminPinHash || 'legacy', driverPins: pins };
        });
      }
      var def = {
        pin: '1001',
        name: (global.PEREDA_DEFAULT_DRIVER && global.PEREDA_DEFAULT_DRIVER.name) || 'Adrián Pereda',
        phone: (global.PEREDA_DEFAULT_DRIVER && global.PEREDA_DEFAULT_DRIVER.phone) || '59899774019'
      };
      var payload = {
        adminPinHash: 'legacy',
        driverPins: [def.pin]
      };
      var driverPayload = {
        name: def.name,
        phone: phoneDigits(def.phone),
        active: true,
        uid: ''
      };
      return configRef().set(payload).then(function () {
        return db.collection('drivers').doc(def.pin).set(driverPayload);
      }).then(function () {
        cachedPins = [def.pin];
        return payload;
      });
    });
  }

  function generateUnusedPin() {
    var used = {};
    cachedPins.forEach(function (p) { used[p] = true; });
    var pin = '';
    var tries = 0;
    do {
      pin = String(Math.floor(1000 + Math.random() * 9000));
      tries += 1;
    } while (used[pin] && tries < 200);
    return pin;
  }

  function writeConfigPins(pins, adminPinHash) {
    return configRef().set({
      adminPinHash: adminPinHash || 'legacy',
      driverPins: uniquePins(pins)
    }).then(function () {
      cachedPins = uniquePins(pins);
    });
  }

  function activateAccount(uid, pin) {
    pin = String(pin || '').trim();
    if (!/^\d{3,8}$/.test(pin)) {
      setAdminMsg('PIN inválido', true);
      return Promise.resolve(false);
    }
    return accountRef(uid).get().then(function (snap) {
      if (!snap.exists) throw new Error('Sin cuenta');
      var account = snap.data() || {};
      return configRef().get().then(function (cfgSnap) {
        var cfg = cfgSnap.exists ? cfgSnap.data() : { adminPinHash: 'legacy', driverPins: [] };
        var pins = uniquePins(cfg.driverPins);
        if (pins.indexOf(pin) === -1) pins.push(pin);
        return sha256(pin).then(function (hash) {
          var batch = [
            accountRef(uid).set({
              email: account.email || '',
              name: account.name || '',
              phone: phoneDigits(account.phone),
              vehicleMake: account.vehicleMake || '',
              vehicleModel: account.vehicleModel || '',
              status: 'active',
              pinHash: hash,
              pinRevealOnce: pin,
              activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              createdAt: account.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }),
            db.collection('drivers').doc(pin).set({
              name: account.name || '',
              phone: phoneDigits(account.phone),
              active: true,
              uid: uid
            }),
            writeConfigPins(pins, cfg.adminPinHash)
          ];
          return Promise.all(batch);
        });
      });
    }).then(function () {
      setAdminMsg('Activado. El conductor verá el PIN al ingresar.');
      refreshRequests();
      refreshAdminList();
      refreshPendingBadge();
      return true;
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al activar', true);
      return false;
    });
  }

  function regeneratePin(uid, oldPin) {
    var newPin = generateUnusedPin();
    return accountRef(uid).get().then(function (snap) {
      if (!snap.exists) throw new Error('Sin cuenta');
      var account = snap.data() || {};
      return configRef().get().then(function (cfgSnap) {
        var cfg = cfgSnap.exists ? cfgSnap.data() : { adminPinHash: 'legacy', driverPins: [] };
        var pins = uniquePins(cfg.driverPins).filter(function (p) { return p !== oldPin; });
        pins.push(newPin);
        return sha256(newPin).then(function (hash) {
          var ops = [
            accountRef(uid).set({
              email: account.email || '',
              name: account.name || '',
              phone: phoneDigits(account.phone),
              vehicleMake: account.vehicleMake || '',
              vehicleModel: account.vehicleModel || '',
              status: 'active',
              pinHash: hash,
              pinRevealOnce: newPin,
              activatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              createdAt: account.createdAt || null
            }, { merge: true }),
            db.collection('drivers').doc(newPin).set({
              name: account.name || '',
              phone: phoneDigits(account.phone),
              active: true,
              uid: uid
            }),
            writeConfigPins(pins, cfg.adminPinHash)
          ];
          if (oldPin && oldPin !== newPin) {
            ops.push(db.collection('drivers').doc(oldPin).delete().catch(function () {}));
          }
          return Promise.all(ops);
        });
      });
    }).then(function () {
      setAdminMsg('PIN regenerado. El conductor lo verá al entrar.');
      refreshAdminList();
      return true;
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al regenerar PIN', true);
      return false;
    });
  }

  function disableAccount(uid, pin) {
    return accountRef(uid).set({ status: 'disabled' }, { merge: true }).then(function () {
      if (!pin) return null;
      return db.collection('drivers').doc(pin).set({ active: false }, { merge: true });
    }).then(function () {
      setAdminMsg('Desactivado');
      refreshAdminList();
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al desactivar', true);
    });
  }

  function enableAccount(uid, pin) {
    return accountRef(uid).set({ status: 'active' }, { merge: true }).then(function () {
      if (!pin) return null;
      return db.collection('drivers').doc(pin).set({ active: true }, { merge: true });
    }).then(function () {
      setAdminMsg('Activado');
      refreshAdminList();
    }).catch(function (e) {
      console.error(e);
      setAdminMsg('Error al activar', true);
    });
  }

  function vehicleLabel(account) {
    var make = String((account && account.vehicleMake) || '').trim();
    var model = String((account && account.vehicleModel) || '').trim();
    if (!make && !model) return '';
    return (make + ' ' + model).trim();
  }

  function statusLabel(status) {
    if (status === 'disabled') return 'Desactivado';
    if (status === 'pending') return 'Pendiente';
    return 'Activo';
  }

  function fillAdminMeta(container, account, extraBits) {
    var bits = [];
    var phone = formatPhoneDisplay(account.phone);
    var vehicle = vehicleLabel(account);
    if (phone) bits.push(phone);
    if (vehicle) bits.push(vehicle);
    if (account.email) bits.push(account.email);
    if (extraBits && extraBits.length) bits = bits.concat(extraBits);
    container.textContent = bits.join(' · ');
  }

  function refreshAdminList() {
    var list = $('admin-list');
    if (!list || !db) return;
    var seq = ++adminListSeq;
    list.innerHTML = '<p class="admin-logs-empty">Cargando…</p>';
    db.collection('driverAccounts').where('status', 'in', ['active', 'disabled']).get()
      .then(function (snap) {
        if (seq !== adminListSeq) return;
        list.innerHTML = '';
        if (snap.empty) {
          list.innerHTML = '<p class="admin-logs-empty">Sin conductores. Revisá Solicitudes.</p>';
          return;
        }
        var rows = [];
        snap.forEach(function (doc) {
          rows.push(Object.assign({ id: doc.id }, doc.data()));
        });
        rows.sort(function (a, b) {
          var aOff = a.status === 'disabled' ? 1 : 0;
          var bOff = b.status === 'disabled' ? 1 : 0;
          if (aOff !== bOff) return aOff - bOff;
          return String(a.name || '').localeCompare(String(b.name || ''));
        });
        return Promise.all(rows.map(function (row) {
          return findPinForUid(row.id).then(function (found) {
            return { account: row, pin: found ? found.pin : null };
          });
        })).then(function (enriched) {
          if (seq !== adminListSeq) return;
          list.innerHTML = '';
          enriched.forEach(function (item) {
            var account = item.account;
            var isDisabled = account.status === 'disabled';
            var el = document.createElement('article');
            el.className = 'admin-card' + (isDisabled ? ' is-disabled' : '');
            el.innerHTML =
              '<div class="admin-card-main">' +
              '<div class="admin-card-top">' +
              '<strong class="admin-card-name"></strong>' +
              '<span class="admin-status"></span>' +
              '</div>' +
              '<div class="admin-card-pin-row">' +
              '<span class="admin-pin-chip"></span>' +
              '</div>' +
              '<p class="admin-card-meta"></p>' +
              '</div>' +
              '<div class="admin-card-actions">' +
              '<button type="button" class="admin-btn" data-regen></button>' +
              '<button type="button" class="admin-btn" data-toggle></button></div>';
            el.querySelector('.admin-card-name').textContent = account.name || 'Conductor';
            var statusEl = el.querySelector('.admin-status');
            statusEl.textContent = statusLabel(account.status);
            statusEl.className = 'admin-status is-' + (isDisabled ? 'disabled' : 'active');
            var pinChip = el.querySelector('.admin-pin-chip');
            if (item.pin) {
              pinChip.textContent = 'PIN ' + item.pin;
              pinChip.classList.add('has-pin');
            } else {
              pinChip.textContent = 'Sin PIN';
              pinChip.classList.add('no-pin');
            }
            fillAdminMeta(el.querySelector('.admin-card-meta'), account);
            var regen = el.querySelector('[data-regen]');
            var toggle = el.querySelector('[data-toggle]');
            regen.textContent = 'Regenerar PIN';
            toggle.textContent = isDisabled ? 'Activar' : 'Desactivar';
            toggle.classList.toggle('admin-btn-warn', !isDisabled);
            toggle.classList.toggle('admin-btn-ok', isDisabled);
            regen.addEventListener('click', function () {
              if (!confirm('¿Regenerar PIN? El valor anterior deja de servir.')) return;
              regeneratePin(account.id, item.pin);
            });
            toggle.addEventListener('click', function () {
              if (isDisabled) {
                if (!confirm('¿Activar a ' + (account.name || '') + '?')) return;
                enableAccount(account.id, item.pin);
              } else {
                if (!confirm('¿Desactivar a ' + (account.name || '') + '?')) return;
                disableAccount(account.id, item.pin);
              }
            });
            list.appendChild(el);
          });
        });
      })
      .catch(function (e) {
        if (seq !== adminListSeq) return;
        console.error(e);
        list.innerHTML = '<p class="admin-logs-empty is-error">No se pudo cargar conductores.</p>';
      });
  }

  function refreshRequests() {
    var list = $('admin-requests');
    if (!list || !db) return;
    var seq = ++adminReqSeq;
    list.innerHTML = '<p class="admin-logs-empty">Cargando…</p>';
    ensureSeedAsAdmin().then(function () {
      return db.collection('driverAccounts').where('status', '==', 'pending').get();
    })
      .then(function (snap) {
        if (seq !== adminReqSeq) return;
        updateRequestsBadge(snap.size);
        list.innerHTML = '';
        if (snap.empty) {
          list.innerHTML = '<p class="admin-logs-empty">No hay solicitudes pendientes.</p>';
          return;
        }
        snap.forEach(function (doc) {
          var account = Object.assign({ id: doc.id }, doc.data());
          var el = document.createElement('article');
          el.className = 'admin-card admin-card-request';
          el.innerHTML =
            '<div class="admin-card-main">' +
            '<div class="admin-card-top">' +
            '<strong class="admin-card-name"></strong>' +
            '<span class="admin-status is-pending">Pendiente</span>' +
            '</div>' +
            '<p class="admin-card-meta"></p>' +
            '<div class="admin-request-actions">' +
            '<label class="admin-request-pin-label">PIN' +
            '<input type="text" inputmode="numeric" maxlength="8" class="admin-request-pin" placeholder="4 dígitos" />' +
            '</label>' +
            '<button type="button" class="admin-btn" data-gen-pin>Generar</button>' +
            '<button type="button" class="admin-btn admin-btn-primary" data-activate>Activar</button></div>' +
            '</div>';
          el.querySelector('.admin-card-name').textContent = account.name || 'Sin nombre';
          fillAdminMeta(el.querySelector('.admin-card-meta'), account);
          var pinInput = el.querySelector('.admin-request-pin');
          pinInput.value = generateUnusedPin();
          el.querySelector('[data-gen-pin]').addEventListener('click', function () {
            pinInput.value = generateUnusedPin();
          });
          el.querySelector('[data-activate]').addEventListener('click', function () {
            var pin = pinInput.value.trim() || generateUnusedPin();
            pinInput.value = pin;
            if (!confirm('¿Activar a ' + (account.name || 'este conductor') + ' con PIN ' + pin + '?\nLo verá una vez al ingresar.')) return;
            activateAccount(account.id, pin);
          });
          list.appendChild(el);
        });
      })
      .catch(function (e) {
        if (seq !== adminReqSeq) return;
        console.error(e);
        list.innerHTML = '<p class="admin-logs-empty is-error">No se pudieron cargar las solicitudes.</p>';
      });
  }

  function formatLogTime(ts) {
    if (!ts) return '—';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return '—';
    try {
      return d.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' });
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
          var item = document.createElement('article');
          item.className = 'admin-log';
          item.innerHTML =
            '<div class="admin-log-top"><strong></strong><em></em></div>' +
            '<span class="admin-log-meta"></span>';
          item.querySelector('strong').textContent = row.name || 'Conductor';
          item.querySelector('em').textContent = formatLogTime(row.at);
          var hint = row.pinHint != null && row.pinHint !== ''
            ? String(row.pinHint)
            : (row.pin ? String(row.pin).slice(-2) : '');
          var meta = [];
          if (hint) meta.push('PIN …' + hint);
          var phone = formatPhoneDisplay(row.phone || '');
          if (phone) meta.push(phone);
          if (row.uid) meta.push('uid…' + String(row.uid).slice(-6));
          item.querySelector('.admin-log-meta').textContent = meta.join(' · ') || '—';
          list.appendChild(item);
        });
      })
      .catch(function (e) {
        console.error(e);
        list.innerHTML = '<p class="admin-logs-empty is-error">No se pudieron cargar los logs.</p>';
      });
  }

  function bindUi() {
    bindBrandTripleClick();

    var googleBtn = $('google-sign-in');
    if (googleBtn) {
      googleBtn.addEventListener('click', function () {
        signInWithGoogle();
      });
    }

    var registerForm = $('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitRegistration(
          ($('register-name') || {}).value,
          ($('register-phone') || {}).value,
          ($('register-vehicle-make') || {}).value,
          ($('register-vehicle-model') || {}).value
        );
      });
    }

    var pinForm = $('pin-form');
    if (pinForm) {
      pinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        tryUnlockWithPin(($('pin-input') || {}).value);
      });
    }

    var revealContinue = $('auth-reveal-continue');
    if (revealContinue) {
      revealContinue.addEventListener('click', function () {
        var user = auth.currentUser;
        if (!user) {
          setAuthView('google');
          return;
        }
        ackPinReveal(user.uid).then(function () {
          setAuthView('pin');
        });
      });
    }

    var authSignOut = $('auth-sign-out');
    if (authSignOut) {
      authSignOut.addEventListener('click', function () {
        signOutToGoogle();
      });
    }

    var switchAccount = $('auth-switch-account');
    if (switchAccount) {
      switchAccount.addEventListener('click', function () {
        signOutToGoogle();
      });
    }

    var exit = $('admin-exit');
    if (exit) exit.addEventListener('click', clearSessionAndLock);

    var refreshLogs = $('admin-refresh-logs');
    if (refreshLogs) refreshLogs.addEventListener('click', loadLogs);

    document.querySelectorAll('[data-admin-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setAdminView(btn.getAttribute('data-admin-nav'));
      });
    });
  }

  function start(onReady) {
    var readyOnce = false;
    routeReady = function () {
      if (readyOnce) return;
      readyOnce = true;
      if (onReady) onReady(getDriver());
    };

    try {
      initFirebase();
    } catch (e) {
      console.error(e);
      showPinGate(true);
      setAuthView('google');
      setGateError('Firebase no cargó');
      routeReady();
      return;
    }
    bindUi();
    showPinGate(true);
    setAuthView('google');

    auth.getRedirectResult().catch(function (e) {
      console.error(e);
    });

    auth.onAuthStateChanged(function (user) {
      if (!user) {
        showAdmin(false);
        var existing = getSession();
        if (existing && existing.phone) {
          /* Session requires Google on next open */
          setSession(null);
        }
        showPinGate(true);
        setAuthView('google');
        routeReady();
        return;
      }
      routeSignedInUser(user);
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
