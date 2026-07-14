(function (global) {
  'use strict';

  var SESSION_KEY = 'pereda-driver-session';
  var WRITE_TOKEN = global.PEREDA_WRITE_TOKEN || 'APT_WRITE_2026';
  var db = null;
  var currentDriver = null;
  var isAdmin = false;
  var editingPin = null;

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

  function showPinGate(on) {
    var gate = $('pin-gate');
    if (!gate) return;
    gate.hidden = !on;
    document.body.classList.toggle('pin-locked', !!on);
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
    document.body.classList.toggle('pin-locked', !!on);
    if (on) refreshAdminList();
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

  function unlockDriver(driver) {
    setSession({ pin: driver.pin, name: driver.name, phone: driver.phone });
    showPinGate(false);
    showAdmin(false);
    applyDriverToUi(getDriver());
  }

  function clearSessionAndLock() {
    setSession(null);
    editingPin = null;
    showAdmin(false);
    showPinGate(true);
  }

  function configRef() {
    return db.collection('config').doc('app');
  }

  function ensureSeed() {
    return configRef().get().then(function (snap) {
      if (snap.exists) return snap.data();
      var def = global.PEREDA_DEFAULT_DRIVER || { pin: '1001', name: 'Adrián Pereda', phone: '59899774019' };
      var adminPin = global.PEREDA_DEFAULT_ADMIN_PIN || '2468';
      return sha256(adminPin).then(function (hash) {
        var payload = {
          adminPinHash: hash,
          driverPins: [def.pin],
          writeToken: WRITE_TOKEN
        };
        var driverPayload = {
          name: def.name,
          phone: phoneDigits(def.phone),
          active: true,
          writeToken: WRITE_TOKEN
        };
        return configRef().set(payload).then(function () {
          return db.collection('drivers').doc(def.pin).set(driverPayload);
        }).then(function () {
          return payload;
        });
      });
    });
  }

  function tryUnlock(pin) {
    var err = $('pin-error');
    if (err) err.hidden = true;
    pin = String(pin || '').trim();
    if (!/^\d{3,8}$/.test(pin)) {
      if (err) err.hidden = false;
      return Promise.resolve(false);
    }

    return ensureSeed().then(function (cfg) {
      return sha256(pin).then(function (hash) {
        if (cfg && cfg.adminPinHash && cfg.adminPinHash === hash) {
          showPinGate(false);
          showAdmin(true);
          return true;
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
        });
      });
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

  function upsertDriver(pin, name, phone) {
    pin = String(pin || '').trim();
    name = String(name || '').trim();
    phone = phoneDigits(phone);
    if (!/^\d{3,8}$/.test(pin) || !name || phone.length < 8) {
      setAdminMsg('Datos inválidos', true);
      return Promise.resolve();
    }
    return configRef().get().then(function (snap) {
      var cfg = snap.exists ? snap.data() : { adminPinHash: '', driverPins: [] };
      var pins = (cfg.driverPins || []).slice();
      if (pins.indexOf(pin) === -1) pins.push(pin);
      return db.collection('drivers').doc(pin).set({
        name: name,
        phone: phone,
        active: true,
        writeToken: WRITE_TOKEN
      }).then(function () {
        return configRef().set({
          adminPinHash: cfg.adminPinHash,
          driverPins: pins,
          writeToken: WRITE_TOKEN
        }, { merge: true });
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
      setAdminMsg('Error al guardar', true);
    });
  }

  function deleteDriver(pin) {
    return configRef().get().then(function (snap) {
      var cfg = snap.exists ? snap.data() : { driverPins: [] };
      var pins = (cfg.driverPins || []).filter(function (p) { return p !== pin; });
      return db.collection('drivers').doc(pin).delete().then(function () {
        return configRef().set({
          adminPinHash: cfg.adminPinHash,
          driverPins: pins,
          writeToken: WRITE_TOKEN
        }, { merge: true });
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
    var adminForm = $('admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', function (e) {
        e.preventDefault();
        upsertDriver(adminForm.pin.value, adminForm.name.value, adminForm.phone.value);
      });
    }
  }

  function start(onReady) {
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
      if (onReady) onReady(null);
      return;
    }
    bindUi();
    var existing = getSession();
    if (existing && existing.phone) {
      currentDriver = existing;
      showPinGate(false);
      applyDriverToUi(existing);
      if (onReady) onReady(existing);
      return;
    }
    showPinGate(true);
    ensureSeed().catch(function (e) { console.warn('seed', e); });
    if (onReady) onReady(null);
  }

  global.PeredaSession = {
    start: start,
    getDriver: getDriver,
    phoneDigits: phoneDigits,
    firstName: firstName,
    clearSessionAndLock: clearSessionAndLock
  };
})(window);
