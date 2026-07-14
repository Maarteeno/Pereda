/* Firebase web config for project aptraslados (UberAP). */
window.PEREDA_FIREBASE = {
  apiKey: 'AIzaSyBbznCdSF7D4pndVlV9s14UAbH9YNR1tys',
  authDomain: 'aptraslados.firebaseapp.com',
  projectId: 'aptraslados',
  storageBucket: 'aptraslados.firebasestorage.app',
  messagingSenderId: '323588975408',
  appId: '1:323588975408:web:589e7de119e3e7fb4576f5'
};

/* Client write token must match firestore.rules. Acceptable for private tablet fleet. */
window.PEREDA_WRITE_TOKEN = 'APT_WRITE_2026';

/* Default admin PIN until changed in Firestore config/app (hash). Document for ops: 2468 */
window.PEREDA_DEFAULT_ADMIN_PIN = '2468';
window.PEREDA_DEFAULT_DRIVER = {
  pin: '1001',
  name: 'Adrián Pereda',
  phone: '59899774019'
};
