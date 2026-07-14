# Admin & driver onboarding (v58)

## Enable Google Sign-In (once)

1. Open [Firebase Console → Authentication](https://console.firebase.google.com/project/aptraslados/authentication/providers)
2. Enable **Google** as a sign-in provider
3. Authorized domains must include:
   - `aptraslados.web.app`
   - `aptraslados.firebaseapp.com`
   - `localhost` (for local testing)

## Admin access

1. Open the app → **Ingresá con Google**
2. Sign in with **`malerovi2014@gmail.com`** only
3. Admin panel opens

Admin sidebar: **Conductores** | **Solicitudes** | **Ver logs** | **Changelog**

### Conductores
- Status badge + billing badge (**Trial (Xd)**, **Suscripto**, **Vencido**)
- PIN chip, phone / vehicle / email
- **Regenerar PIN**
- **Marcar suscripto** → 30 días a **US$ 4,99 / mes** (manual hasta pasarela de pago)
- **Marcar vencido** → desactiva la cuenta
- Activar / Desactivar

### Solicitudes
- Activar con PIN → arranca **trial de 15 días**

### Changelog
- Lista de entradas + formulario (versión, título, notas)
- Colección Firestore `changelog` (solo admin)

## Driver onboarding + trial

1. Driver: Google Sign-In → formulario → `pending`
2. Admin activa → `billingStatus: trial`, `trialEndsAt` (+15 días), PIN una vez
3. Diario: Google + PIN mientras el trial/suscripción esté vigente
4. Si venció: mensaje de trial/suscripción vencida (sin acceso)
5. Admin **Marcar suscripto** para renovar 30 días

Cuentas antiguas sin `billingStatus` siguen pudiendo entrar (legacy) hasta que el admin las gestione.

## Destinos / QR

En Paseos y Traslados, cada destino muestra un **QR** (`Escaneá para cotizar`) que abre WhatsApp al celular del conductor logueado con el mensaje `waWantGo` (lugar + nombre). FAB y Contacto se mantienen.

## Security (from v57)

- Hosting CSP / nosniff / referrer / frame / COOP
- Firestore: email propio en create; `accessLogs` con `pinHint`
- Sanitize en registro

## Data

- `driverAccounts/{uid}` — + `billingStatus`, `trialEndsAt`, `subscribedUntil`, `subscriptionPriceUsd`
- `drivers/{pin}`, `config/app`, `accessLogs`
- `changelog/{id}` — version, title, body, at, createdBy

App title / PWA name: **App Traslados**
