# Admin & driver onboarding (v57)

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

Admin sidebar: **Conductores** | **Solicitudes** (badge con pendientes) | **Ver logs**

On **Conductores** you can:
- See status badge (Activo / Desactivado) and **PIN** chip
- Phone, vehicle, and email as meta
- **Regenerar PIN** (driver sees the new value once on next login)
- **Activar / Desactivar**

On **Solicitudes**:
- Pending Google accounts with a suggested PIN ready
- **Generar** a new PIN / **Activar**

## Driver onboarding

1. Driver: Google Sign-In (“Bienvenido Conductor”)
2. Form: **nombre**, **celular**, **marca** y **modelo** del vehículo → `pending`
3. Admin → **Solicitudes** → Generar PIN → **Activar**
4. Driver sees PIN once → then unlocks with PIN daily (Google + PIN)

## Migration (seed Adrián / PIN 1001)

1. Adrián signs in with Google and submits name, phone, vehicle
2. Admin opens **Solicitudes**, sets PIN **`1001`** (or Generate), Activar

## Security (v57)

- Hosting: CSP, `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, COOP for Google popup
- Firestore: create account only with **own** email; name/vehicle ≤ 80; phone 8–20 digits
- `accessLogs` store **`pinHint`** (last 2 digits), not the full PIN
- Client sanitizes registration inputs; seed PIN is not exposed on `window`

Residual: Firebase `apiKey` is public (normal); authenticated drivers can still read their own `pinHash`; admin sees PIN as `drivers/{pin}` doc id.

## Data

- `driverAccounts/{uid}` — email, name, phone, vehicleMake, vehicleModel, status, pinHash, optional pinRevealOnce
- `drivers/{pin}` — name, phone, active, uid
- `accessLogs` — pinHint, name, phone, uid, at, ua

App title / PWA name: **App Traslados**
