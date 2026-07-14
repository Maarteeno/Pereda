# Admin & driver onboarding (v51)

## Enable Google Sign-In (once)

1. Open [Firebase Console → Authentication](https://console.firebase.google.com/project/aptraslados/authentication/providers)
2. Enable **Google** as a sign-in provider
3. Authorized domains must include:
   - `aptraslados.web.app`
   - `aptraslados.firebaseapp.com`
   - `localhost` (for local testing)

## Admin access

1. Open the app → **Continuar con Google**
2. Sign in with **`malerovi2014@gmail.com`** only
3. Admin panel opens (no PIN `2991`)

Admin sidebar: **Conductores** | **Solicitudes** | **Ver logs**

## Driver onboarding

1. Driver: Google Sign-In
2. First time: form with **nombre** + **celular** → status `pending`
3. Admin → **Solicitudes** → Generar PIN → **Activar**
4. Driver logs in again → sees PIN **once** → then unlocks with PIN
5. Daily use: Google → PIN

PINs are never listed in clear text in the admin driver list. Regenerating a PIN shows the new value to the driver on their next login (`pinRevealOnce`).

## Migration (existing seed Adrián / PIN 1001)

1. Adrián signs in with Google and submits name + phone
2. Admin opens **Solicitudes**, sets PIN **`1001`** (or Generate), Activar
3. That links his Google `uid` to `drivers/1001`

Legacy PIN-only unlock without Google is removed.

## Data

- `driverAccounts/{uid}` — email, name, phone, status (`pending` | `active` | `disabled`), `pinHash`, optional `pinRevealOnce`
- `drivers/{pin}` — name, phone, active, `uid` (no public get)
- `accessLogs` — includes `uid` on unlock
