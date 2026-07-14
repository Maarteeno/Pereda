# Admin & driver onboarding (1.0.1 Beta)

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
- Badge de estado + **countdown vivo** (`Trial · 2d 14h`, `Activo · 5h 12m`, `Vencido`)
- PIN chip, phone / vehicle / email, fecha de expiración
- **Presets**: 24h · 7d · 15d · 30d (otorgan / extienden sobre el fin actual)
- **Cantidad + unidad**: horas | días | semanas | meses → **Otorgar / Extender**
- **Vencer ahora** → desactiva y marca acceso vencido
- Regenerar PIN · Activar / Desactivar

La extensión suma tiempo a `max(ahora, accessUntilActual)` (estilo InfraHub “cuando expire”).

### Solicitudes
- Activar con PIN → **trial de 15 días** (`accessUntil`)

### Changelog
- Historial de versiones **solo lectura** (semillas en código, actualizado en cada release)

## Driver onboarding + acceso

1. Driver: Google Sign-In → formulario → `pending`
2. Admin activa → `billingStatus: trial`, `accessUntil` (+15 días), PIN una vez
3. Diario: Google + PIN mientras `accessUntil` esté vigente
4. Si venció: bloqueo con mensaje genérico (sin “15 días” fijo)
5. Admin otorga / extiende duración flexible (US$ 4,99/mes como referencia de precio)

Cuentas antiguas sin `billingStatus` ni fechas siguen pudiendo entrar (legacy) hasta que el admin las gestione.

## Destinos / QR

En Paseos y Traslados, cada destino muestra un **QR** (`Escaneá para cotizar`) que abre WhatsApp al celular del conductor logueado con el mensaje `waWantGo` (lugar + nombre). Contacto mantiene QR verde.

## Security (from v57)

- Hosting CSP / nosniff / referrer / frame / COOP
- Firestore: email propio en create; `accessLogs` con `pinHint`
- Sanitize en registro

## Data

- `driverAccounts/{uid}` — `billingStatus`, `accessUntil`, `trialEndsAt`, `subscribedUntil` (legacy sync), `subscriptionPriceUsd`
- `drivers/{pin}`, `config/app`, `accessLogs`
- `changelog/{id}` — legado (ya no se escribe desde la UI)

App title / PWA name: **App Traslados** · Version **1.0.1 Beta**
