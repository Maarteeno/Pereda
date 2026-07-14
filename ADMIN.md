# Admin & driver onboarding (v52)

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

Admin sidebar: **Conductores** | **Solicitudes** | **Ver logs**

On **Conductores** you can:
- See each driver’s **PIN** in clear text
- **Regenerar PIN** (driver sees the new value once on next login)
- **Activar / Desactivar**

## Driver onboarding

1. Driver: Google Sign-In (“Bienvenido Conductor”)
2. Form: **nombre**, **celular**, **marca** y **modelo** del vehículo → `pending`
3. Admin → **Solicitudes** → Generar PIN → **Activar**
4. Driver sees PIN once → then unlocks with PIN daily (Google + PIN)

## Migration (seed Adrián / PIN 1001)

1. Adrián signs in with Google and submits name, phone, vehicle
2. Admin opens **Solicitudes**, sets PIN **`1001`** (or Generate), Activar

## Data

- `driverAccounts/{uid}` — email, name, phone, vehicleMake, vehicleModel, status, pinHash, optional pinRevealOnce
- `drivers/{pin}` — name, phone, active, uid
- `accessLogs` — includes uid on unlock

App title / PWA name: **App Traslados**
