(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'pereda-lang';
  var VERSION_STORAGE_KEY = 'pereda-app-version';
  var APP_VERSION = 'v62';
  var WA_NUMBER = '59899774019';
  var QR_DEST = 72;
  var QR_CONTACT = 148;
  var QR_DARK = '#25d366';
  var QR_LIGHT = '#ffffff';
  window.__PEREDA_APP_VERSION__ = APP_VERSION;
  var swRegistration = null;
  var activeLang = 'es';

  var DEST_NAMES = {
    aeropuerto: { es: 'Aeropuerto de Carrasco', en: 'Carrasco Airport', pt: 'Aeroporto de Carrasco' },
    buquebus: { es: 'Buquebus', en: 'Buquebus', pt: 'Buquebus' },
    punta: { es: 'Punta del Este', en: 'Punta del Este', pt: 'Punta del Este' },
    colonia: { es: 'Colonia del Sacramento', en: 'Colonia del Sacramento', pt: 'Colonia del Sacramento' },
    montevideo: { es: 'Montevideo', en: 'Montevideo', pt: 'Montevidéu' },
    'paseo-costa': { es: 'Costa y hoteles', en: 'Coast and hotels', pt: 'Costa e hotéis' },
    'paseo-montevideo': { es: 'paseo por Montevideo', en: 'Montevideo tour', pt: 'passeio por Montevidéu' },
    'paseo-eventos': { es: 'Eventos', en: 'Events', pt: 'Eventos' },
    'paseo-bodegas': { es: 'Bodegas', en: 'Wineries', pt: 'Vinícolas' },
    'spot-costa-hoteles': { es: 'Punta del Este Hoteles', en: 'Punta del Este hotels', pt: 'Hotéis de Punta del Este' },
    'spot-costa-barra': { es: 'La Barra', en: 'La Barra', pt: 'La Barra' },
    'spot-costa-ji': { es: 'José Ignacio', en: 'José Ignacio', pt: 'José Ignacio' },
    'spot-mvd-centenario': { es: 'Estadio Centenario', en: 'Centenario Stadium', pt: 'Estádio Centenario' },
    'spot-mvd-rambla': { es: 'Rambla de Montevideo', en: 'Montevideo Rambla', pt: 'Rambla de Montevidéu' },
    'spot-mvd-rodo': { es: 'Parque Rodó', en: 'Parque Rodó', pt: 'Parque Rodó' },
    'spot-mvd-mercado': { es: 'Mercado del Puerto', en: 'Mercado del Puerto', pt: 'Mercado del Puerto' },
    'spot-evt-boda': { es: 'Bodas', en: 'Weddings', pt: 'Casamentos' },
    'spot-evt-salon': { es: 'Salones', en: 'Event halls', pt: 'Salões' },
    'spot-evt-congreso': { es: 'Congresos', en: 'Conferences', pt: 'Congressos' },
    'spot-bod-bouza': { es: 'Bodega Bouza', en: 'Bouza Winery', pt: 'Vinícola Bouza' },
    'spot-bod-juanico': { es: 'Bodega Juanicó', en: 'Juanicó Winery', pt: 'Vinícola Juanicó' },
    'spot-bod-garzon': { es: 'Bodega Garzón', en: 'Garzón Winery', pt: 'Vinícola Garzón' },
    'spot-bod-carmelo': { es: 'Bodegas en Carmelo', en: 'Carmelo wineries', pt: 'Vinícolas em Carmelo' }
  };

  var T = {
    es: {
      langGroup: 'Idioma',
      navSections: 'Secciones',
      hubAria: 'Menú principal',
      chipRowAria: 'Comodidades del vehículo',
      vehicleAria: 'Bestune NAT eléctrico',
      waAria: 'Abrir chat de WhatsApp con Adrián Pereda',
      role: 'Conductor profesional',
      navPaseos: 'Paseos',
      navTraslados: 'Traslados',
      navContacto: 'Contacto',
      whatsapp: 'WhatsApp',
      eyebrow: 'Bestune NAT · 100% eléctrico',
      heroTitle: 'Traslados con conductor profesional',
      heroLead: 'Montevideo, Costa de Oro y trayectos a Punta del Este o Colonia. Viaje silencioso, cómodo y puntual — pedí presupuesto por WhatsApp.',
      chip0: '100% eléctrico',
      chip1: 'Viaje silencioso',
      chip2: 'Climatización',
      chip3: 'Maletero amplio',
      chip4: 'Puerta corrediza',
      chip5: 'Asientos amplios',
      hubPaseosTitle: 'Paseos',
      hubPaseosDesc: 'Experiencias por Uruguay a tu ritmo.',
      hubTrasladosTitle: 'Traslados',
      hubTrasladosDesc: 'Aeropuerto, ciudad y costa con puntualidad.',
      hubContactoTitle: 'Contacto',
      hubContactoDesc: 'Escribile a Adrián por WhatsApp.',
      backHome: 'Inicio',
      backGallery: 'Galería',
      paseosKicker: 'Galería',
      paseosTitle: 'Paseos y experiencias',
      paseosIntro: 'Tocá un paseo para ver los lugares incluidos. Cada vista muestra solo ese recorrido.',
      seePlaces: 'Ver lugares',
      paseoKicker: 'Paseo',
      gCostaTitle: 'Costa y hoteles',
      gCostaSub: 'Punta del Este · La Barra · José Ignacio',
      gMvdTitle: 'Montevideo',
      gMvdSub: 'Centenario · Rambla · Parque Rodó · Mercado del Puerto',
      gEvtTitle: 'Eventos',
      gEvtSub: 'Bodas · Salones · Congresos',
      gBodTitle: 'Bodegas',
      gBodSub: 'Bouza · Juanicó · Garzón · Carmelo',
      dCostaIntro: 'Llegadas a hoteles y recorridos por la costa Este: playa, puente y faro incluidos en el trayecto.',
      sCostaHotelsTitle: 'Punta del Este · hoteles',
      sCostaHotelsDesc: 'Traslados puerta a puerta a hoteles de Playa Brava y Mansa, sin bajar equipaje en la calle.',
      sCostaBarraTitle: 'La Barra',
      sCostaBarraDesc: 'El puente emblemático y el pueblo playero: ideal para una mañana o un atardecer sin apuro.',
      sCostaJiTitle: 'José Ignacio',
      sCostaJiDesc: 'Costa más quieta, faro y boutique: el tramo largo de la costa sin cambiar de vehículo.',
      dMvdIntro: 'Un circuito por íconos de la ciudad: estadio, rambla, parque y mercado, con paradas cómodas.',
      sMvdCentTitle: 'Estadio Centenario',
      sMvdCentDesc: 'Parada frente al monumento del fútbol mundial en Parque Batlle.',
      sMvdRamblaTitle: 'Rambla',
      sMvdRamblaDesc: 'El paseo costero de Pocitos y Punta Carretas: luz, río y ciudad en un solo tramo.',
      sMvdRodoTitle: 'Parque Rodó',
      sMvdRodoDesc: 'Parque, lago y ambiente de fin de semana a minutos del centro.',
      sMvdMercTitle: 'Mercado del Puerto',
      sMvdMercDesc: 'Ciudad Vieja: el mercado de hierro y las parrillas del puerto.',
      dEvtIntro: 'Llevamos invitados o equipos a salones, bodas y congresos: puntualidad y espacio para equipaje.',
      sEvtBodaTitle: 'Bodas',
      sEvtBodaDesc: 'Llegada de novios e invitados a quintas y salones, con horario coordinado.',
      sEvtSalonTitle: 'Salones',
      sEvtSalonDesc: 'Eventos sociales y corporativos: puerta a puerta sin buscar estacionamiento.',
      sEvtCongTitle: 'Congresos',
      sEvtCongDesc: 'Traslados a auditorios y centros de convenciones en ciudad o costa.',
      dBodIntro: 'Rutas de vino sin conducir: Bouza, Juanicó, Garzón y Carmelo con tiempo para degustar.',
      sBodBouzaTitle: 'Bouza',
      sBodBouzaDesc: 'Melilla, a minutos de Montevideo: bodega boutique con degustación y paisaje de viñas.',
      sBodJuanTitle: 'Juanicó',
      sBodJuanDesc: 'Canelones, cerca de Montevideo: viñas y cava histórica en un día completo.',
      sBodGarTitle: 'Garzón',
      sBodGarDesc: 'Maldonado: bodega moderna entre cerros, ideal combinada con la costa.',
      sBodCarTitle: 'Carmelo',
      sBodCarDesc: 'Colonia: viñedos junto al río Uruguay, un trayecto más largo y pausado.',
      trasladosKicker: 'Destinos frecuentes',
      trasladosIntro: 'Ideal para llegadas al aeropuerto, mudanzas temporales o traslados puerta a puerta. Sin precios públicos: consultá tu recorrido.',
      destAirportTitle: 'Aeropuerto',
      destAirportS0: 'Carrasco (MVD)',
      destAirportS1: 'Llegadas / Salidas',
      destAirportS2: 'Puerta a puerta',
      destBuqueTitle: 'Buquebus',
      destBuqueS0: 'Terminal Montevideo',
      destBuqueS1: 'Buenos Aires',
      destBuqueS2: 'Conexión ferries',
      destPuntaTitle: 'Punta del Este',
      destPuntaS0: 'La Mano',
      destPuntaS1: 'Playa Brava',
      destPuntaS2: 'Puerto de Punta',
      destColoniaTitle: 'Colonia del Sacramento',
      destColoniaS0: 'Barrio Histórico',
      destColoniaS1: 'Faro de Colonia',
      destColoniaS2: 'Calle de los Suspiros',
      destMvdTitle: 'Montevideo',
      destMvdS0: 'Aeropuerto Carrasco',
      destMvdS1: 'Centro',
      destMvdS2: 'Rambla',
      destMvdS3: 'Mercado del Puerto',
      wantGo: 'Quiero ir',
      scanQuote: 'Escaneá y escribinos',
      waWantGo: 'Hola {name}, quiero ir a {place}. ¿Me cotizás un traslado?',
      waWantGoQr: 'Hola {name}, quiero ir a {place}',
      authBoot: 'Cargando…',
      switchDriver: 'Cambiar PIN',
      pinBrand: 'Bienvenido Conductor',
      pinTitle: 'Ingresá tu PIN',
      pinSubmit: 'Entrar',
      pinError: 'PIN incorrecto',
      authGoogleTitle: 'Ingresá con Google',
      authGoogleText: '',
      authGoogleBtn: 'Ingresá con Google',
      authRegisterTitle: 'Completá tus datos',
      authRegisterText: 'Nombre, celular y vehículo. El admin te asigna un PIN y te activa.',
      authRegisterSubmit: 'Enviar solicitud',
      authVehicleMake: 'Marca del vehículo',
      authVehicleModel: 'Modelo',
      authPendingTitle: 'Solicitud enviada',
      authPendingText: 'Cuando el admin active tu cuenta, vas a ver tu PIN acá. Podés cerrar y volver más tarde.',
      authSignOut: 'Cerrar sesión Google',
      authRevealTitle: 'Tu PIN de conductor',
      authRevealText: 'Guardalo. Solo se muestra esta vez.',
      authRevealContinue: 'Entendido, continuar',
      authSwitchAccount: 'Cambiar cuenta Google',
      adminTitle: 'Administración',
      adminIntro: 'Conductores con trial (15 días) o suscripción US$ 4,99/mes. PIN, regenerar y billing.',
      adminExit: 'Salir',
      adminNavDrivers: 'Conductores',
      adminNavRequests: 'Solicitudes',
      adminNavLogs: 'Ver logs',
      adminNavChangelog: 'Changelog',
      adminPinLabel: 'PIN',
      adminNameLabel: 'Nombre',
      adminPhoneLabel: 'Teléfono (con código país)',
      adminSave: 'Guardar',
      adminClear: 'Limpiar',
      adminGeneratePin: 'Generar PIN',
      adminDriversTitle: 'Conductores',
      adminRequestsTitle: 'Solicitudes',
      adminRequestsHint: 'Cuentas Google pendientes. Al activar arranca trial de 15 días.',
      adminLogsTitle: 'Logs de ingreso',
      adminRefreshLogs: 'Actualizar',
      adminLogsHint: 'Últimos ingresos de conductores (quién y cuándo).',
      adminChangelogTitle: 'Changelog',
      adminChangelogHint: 'Notas de versión internas. Visible solo para admin.',
      adminChangelogSave: 'Guardar entrada',
      logoutTitle: '¿Cerrar sesión?',
      logoutText: 'Cerrás la sesión del conductor. Vas a tener que entrar de nuevo con Google y tu PIN.',
      logoutCancel: 'Cancelar',
      logoutOk: 'Salir',
      contactKicker: 'Hablemos',
      contactIntro: 'Contale destino, horario y cantidad de pasajeros. Respuesta por WhatsApp.',
      driverRole: 'Conductor profesional. Montevideo y La Costa',
      contactCoverage: 'Montevideo, Costa de Oro y trayectos a PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% eléctrico',
      qrLabel: 'Escribile por WhatsApp',
      qrAction: 'Abrir WhatsApp',
      contactNote: 'Los precios se cotizan según trayecto. Sin tarifas fijas publicadas.',
      footer: 'Traslados · Bestune NAT eléctrico · Montevideo, Uruguay',
      updateTitle: 'Nueva versión disponible',
      updateText: 'Hay una actualización de la app. Actualizá para ver el diseño más reciente.',
      updateAction: 'Actualizar ahora'
    },
    en: {
      langGroup: 'Language',
      navSections: 'Sections',
      hubAria: 'Main menu',
      chipRowAria: 'Vehicle amenities',
      vehicleAria: 'Electric Bestune NAT',
      waAria: 'Open WhatsApp chat with Adrián Pereda',
      role: 'Professional driver',
      navPaseos: 'Tours',
      navTraslados: 'Transfers',
      navContacto: 'Contact',
      whatsapp: 'WhatsApp',
      eyebrow: 'Bestune NAT · 100% electric',
      heroTitle: 'Transfers with a professional driver',
      heroLead: 'Montevideo, Costa de Oro and trips to Punta del Este or Colonia. Quiet, comfortable and on time — request a quote on WhatsApp.',
      chip0: '100% electric',
      chip1: 'Quiet ride',
      chip2: 'Climate control',
      chip3: 'Room for luggage',
      chip4: 'Sliding door',
      chip5: 'Spacious seats',
      hubPaseosTitle: 'Tours',
      hubPaseosDesc: 'Experiences across Uruguay at your pace.',
      hubTrasladosTitle: 'Transfers',
      hubTrasladosDesc: 'Airport, city and coast — on time.',
      hubContactoTitle: 'Contact',
      hubContactoDesc: 'Message Adrián on WhatsApp.',
      backHome: 'Home',
      backGallery: 'Gallery',
      paseosKicker: 'Gallery',
      paseosTitle: 'Tours and experiences',
      paseosIntro: 'Tap a tour to see the places included. Each view shows only that route.',
      seePlaces: 'See places',
      paseoKicker: 'Tour',
      gCostaTitle: 'Coast and hotels',
      gCostaSub: 'Punta del Este · La Barra · José Ignacio',
      gMvdTitle: 'Montevideo',
      gMvdSub: 'Centenario · Rambla · Parque Rodó · Mercado del Puerto',
      gEvtTitle: 'Events',
      gEvtSub: 'Weddings · Venues · Conferences',
      gBodTitle: 'Wineries',
      gBodSub: 'Bouza · Juanicó · Garzón · Carmelo',
      dCostaIntro: 'Hotel arrivals and East Coast routes: beach, bridge and lighthouse along the way.',
      sCostaHotelsTitle: 'Punta del Este · hotels',
      sCostaHotelsDesc: 'Door-to-door transfers to Playa Brava and Mansa hotels — no street-side luggage drop.',
      sCostaBarraTitle: 'La Barra',
      sCostaBarraDesc: 'The iconic bridge and beach town: perfect for a morning or unhurried sunset.',
      sCostaJiTitle: 'José Ignacio',
      sCostaJiDesc: 'Quieter coast, lighthouse and boutique stays — the long stretch without changing cars.',
      dMvdIntro: 'A circuit of city icons: stadium, rambla, park and market, with comfortable stops.',
      sMvdCentTitle: 'Estadio Centenario',
      sMvdCentDesc: 'A stop at the world football landmark in Parque Batlle.',
      sMvdRamblaTitle: 'Rambla',
      sMvdRamblaDesc: 'The coastal promenade of Pocitos and Punta Carretas: light, river and city in one stretch.',
      sMvdRodoTitle: 'Parque Rodó',
      sMvdRodoDesc: 'Park, lake and weekend vibe minutes from downtown.',
      sMvdMercTitle: 'Mercado del Puerto',
      sMvdMercDesc: 'Ciudad Vieja: the iron market and the port grills.',
      dEvtIntro: 'We take guests or teams to venues, weddings and conferences: punctuality and luggage space.',
      sEvtBodaTitle: 'Weddings',
      sEvtBodaDesc: 'Bride, groom and guest arrivals to estates and venues, on a coordinated schedule.',
      sEvtSalonTitle: 'Venues',
      sEvtSalonDesc: 'Social and corporate events: door to door without hunting for parking.',
      sEvtCongTitle: 'Conferences',
      sEvtCongDesc: 'Transfers to auditoriums and convention centers in the city or on the coast.',
      dBodIntro: 'Wine routes without driving: Bouza, Juanicó, Garzón and Carmelo with time to taste.',
      sBodBouzaTitle: 'Bouza',
      sBodBouzaDesc: 'Melilla, minutes from Montevideo: boutique winery with tasting and vineyard views.',
      sBodJuanTitle: 'Juanicó',
      sBodJuanDesc: 'Canelones, near Montevideo: vineyards and historic cellar — a full day.',
      sBodGarTitle: 'Garzón',
      sBodGarDesc: 'Maldonado: modern winery among the hills, ideal with the coast.',
      sBodCarTitle: 'Carmelo',
      sBodCarDesc: 'Colonia: vineyards by the Uruguay River — a longer, slower trip.',
      trasladosKicker: 'Popular destinations',
      trasladosIntro: 'Ideal for airport arrivals, short stays or door-to-door transfers. No public fixed rates: ask about your route.',
      destAirportTitle: 'Airport',
      destAirportS0: 'Carrasco (MVD)',
      destAirportS1: 'Arrivals / Departures',
      destAirportS2: 'Door to door',
      destBuqueTitle: 'Buquebus',
      destBuqueS0: 'Montevideo terminal',
      destBuqueS1: 'Buenos Aires',
      destBuqueS2: 'Ferry connection',
      destPuntaTitle: 'Punta del Este',
      destPuntaS0: 'La Mano',
      destPuntaS1: 'Playa Brava',
      destPuntaS2: 'Puerto de Punta',
      destColoniaTitle: 'Colonia del Sacramento',
      destColoniaS0: 'Historic Quarter',
      destColoniaS1: 'Colonia Lighthouse',
      destColoniaS2: 'Calle de los Suspiros',
      destMvdTitle: 'Montevideo',
      destMvdS0: 'Carrasco Airport',
      destMvdS1: 'Downtown',
      destMvdS2: 'Rambla',
      destMvdS3: 'Mercado del Puerto',
      wantGo: 'I want to go',
      scanQuote: 'Scan and message us',
      waWantGo: 'Hi {name}, I want to go to {place}. Could you quote a transfer?',
      waWantGoQr: 'Hi {name}, I want to go to {place}',
      authBoot: 'Loading…',
      switchDriver: 'Change PIN',
      pinBrand: 'Welcome, Driver',
      pinTitle: 'Enter your PIN',
      pinSubmit: 'Enter',
      pinError: 'Incorrect PIN',
      authGoogleTitle: 'Sign in with Google',
      authGoogleText: '',
      authGoogleBtn: 'Sign in with Google',
      authRegisterTitle: 'Complete your details',
      authRegisterText: 'Name, phone and vehicle. The admin assigns a PIN and activates you.',
      authRegisterSubmit: 'Submit request',
      authVehicleMake: 'Vehicle make',
      authVehicleModel: 'Model',
      authPendingTitle: 'Request sent',
      authPendingText: 'When the admin activates your account, you will see your PIN here. You can close and come back later.',
      authSignOut: 'Sign out of Google',
      authRevealTitle: 'Your driver PIN',
      authRevealText: 'Save it. It is only shown this once.',
      authRevealContinue: 'Got it, continue',
      authSwitchAccount: 'Switch Google account',
      adminTitle: 'Administration',
      adminIntro: 'Drivers on a 15-day trial or US$ 4.99/mo subscription. PIN, regenerate, billing.',
      adminExit: 'Exit',
      adminNavDrivers: 'Drivers',
      adminNavRequests: 'Requests',
      adminNavLogs: 'View logs',
      adminNavChangelog: 'Changelog',
      adminPinLabel: 'PIN',
      adminNameLabel: 'Name',
      adminPhoneLabel: 'Phone (with country code)',
      adminSave: 'Save',
      adminClear: 'Clear',
      adminGeneratePin: 'Generate PIN',
      adminDriversTitle: 'Drivers',
      adminRequestsTitle: 'Requests',
      adminRequestsHint: 'Pending Google accounts. Activation starts a 15-day trial.',
      adminLogsTitle: 'Login logs',
      adminRefreshLogs: 'Refresh',
      adminLogsHint: 'Recent driver logins (who and when).',
      adminChangelogTitle: 'Changelog',
      adminChangelogHint: 'Internal release notes. Admin only.',
      adminChangelogSave: 'Save entry',
      logoutTitle: 'Log out?',
      logoutText: 'This ends the driver session. You will need to sign in again with Google and your PIN.',
      logoutCancel: 'Cancel',
      logoutOk: 'Log out',
      contactKicker: "Let's talk",
      contactIntro: 'Tell the destination, time and number of passengers. Reply on WhatsApp.',
      driverRole: 'Professional driver. Montevideo and the Coast',
      contactCoverage: 'Montevideo, Gold Coast and routes to PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% electric',
      qrLabel: 'Message on WhatsApp',
      qrAction: 'Open WhatsApp',
      contactNote: 'Prices are quoted per trip. No fixed published rates.',
      footer: 'Transfers · Electric Bestune NAT · Montevideo, Uruguay',
      updateTitle: 'New version available',
      updateText: 'An app update is ready. Update to see the latest design.',
      updateAction: 'Update now'
    },
    pt: {
      langGroup: 'Idioma',
      navSections: 'Seções',
      hubAria: 'Menu principal',
      chipRowAria: 'Comodidades do veículo',
      vehicleAria: 'Bestune NAT elétrico',
      waAria: 'Abrir chat do WhatsApp com Adrián Pereda',
      role: 'Motorista profissional',
      navPaseos: 'Passeios',
      navTraslados: 'Transfers',
      navContacto: 'Contato',
      whatsapp: 'WhatsApp',
      eyebrow: 'Bestune NAT · 100% elétrico',
      heroTitle: 'Transfers com motorista profissional',
      heroLead: 'Montevidéu, Costa de Oro e trajetos a Punta del Este ou Colonia. Viagem silenciosa, confortável e pontual — peça orçamento no WhatsApp.',
      chip0: '100% elétrico',
      chip1: 'Viagem silenciosa',
      chip2: 'Climatização',
      chip3: 'Porta-malas amplo',
      chip4: 'Porta deslizante',
      chip5: 'Assentos espaçosos',
      hubPaseosTitle: 'Passeios',
      hubPaseosDesc: 'Experiências pelo Uruguai no seu ritmo.',
      hubTrasladosTitle: 'Transfers',
      hubTrasladosDesc: 'Aeroporto, cidade e costa com pontualidade.',
      hubContactoTitle: 'Contato',
      hubContactoDesc: 'Fale com Adrián pelo WhatsApp.',
      backHome: 'Início',
      backGallery: 'Galeria',
      paseosKicker: 'Galeria',
      paseosTitle: 'Passeios e experiências',
      paseosIntro: 'Toque um passeio para ver os lugares incluídos. Cada vista mostra só aquele percurso.',
      seePlaces: 'Ver lugares',
      paseoKicker: 'Passeio',
      gCostaTitle: 'Costa e hotéis',
      gCostaSub: 'Punta del Este · La Barra · José Ignacio',
      gMvdTitle: 'Montevidéu',
      gMvdSub: 'Centenario · Rambla · Parque Rodó · Mercado del Puerto',
      gEvtTitle: 'Eventos',
      gEvtSub: 'Casamentos · Salões · Congressos',
      gBodTitle: 'Vinícolas',
      gBodSub: 'Bouza · Juanicó · Garzón · Carmelo',
      dCostaIntro: 'Chegadas a hotéis e percursos pela costa Leste: praia, ponte e farol no trajeto.',
      sCostaHotelsTitle: 'Punta del Este · hotéis',
      sCostaHotelsDesc: 'Transfers porta a porta a hotéis de Playa Brava e Mansa, sem descarregar na rua.',
      sCostaBarraTitle: 'La Barra',
      sCostaBarraDesc: 'A ponte emblemática e o vilarejo: ideal para uma manhã ou um entardecer sem pressa.',
      sCostaJiTitle: 'José Ignacio',
      sCostaJiDesc: 'Costa mais quieta, farol e boutique: o trecho longo sem trocar de veículo.',
      dMvdIntro: 'Um circuito pelos ícones da cidade: estádio, rambla, parque e mercado, com paradas confortáveis.',
      sMvdCentTitle: 'Estádio Centenario',
      sMvdCentDesc: 'Parada no monumento do futebol mundial no Parque Batlle.',
      sMvdRamblaTitle: 'Rambla',
      sMvdRamblaDesc: 'O passeio costeiro de Pocitos e Punta Carretas: luz, rio e cidade num só trecho.',
      sMvdRodoTitle: 'Parque Rodó',
      sMvdRodoDesc: 'Parque, lago e clima de fim de semana a minutos do centro.',
      sMvdMercTitle: 'Mercado del Puerto',
      sMvdMercDesc: 'Ciudad Vieja: o mercado de ferro e as parrillas do porto.',
      dEvtIntro: 'Levamos convidados ou equipes a salões, casamentos e congressos: pontualidade e espaço para bagagem.',
      sEvtBodaTitle: 'Casamentos',
      sEvtBodaDesc: 'Chegada de noivos e convidados a sítios e salões, com horário coordenado.',
      sEvtSalonTitle: 'Salões',
      sEvtSalonDesc: 'Eventos sociais e corporativos: porta a porta sem procurar estacionamento.',
      sEvtCongTitle: 'Congressos',
      sEvtCongDesc: 'Transfers a auditórios e centros de convenções na cidade ou na costa.',
      dBodIntro: 'Rotas de vinho sem dirigir: Bouza, Juanicó, Garzón e Carmelo com tempo para degustar.',
      sBodBouzaTitle: 'Bouza',
      sBodBouzaDesc: 'Melilla, a minutos de Montevidéu: vinícola boutique com degustação e vinhas.',
      sBodJuanTitle: 'Juanicó',
      sBodJuanDesc: 'Canelones, perto de Montevidéu: vinhas e cave histórica num dia completo.',
      sBodGarTitle: 'Garzón',
      sBodGarDesc: 'Maldonado: vinícola moderna entre morros, ideal combinada com a costa.',
      sBodCarTitle: 'Carmelo',
      sBodCarDesc: 'Colonia: vinhedos junto ao rio Uruguai — um trajeto mais longo e pausado.',
      trasladosKicker: 'Destinos frequentes',
      trasladosIntro: 'Ideal para chegadas ao aeroporto, estadias curtas ou transfers porta a porta. Sem tarifas públicas fixas: consulte o seu percurso.',
      destAirportTitle: 'Aeroporto',
      destAirportS0: 'Carrasco (MVD)',
      destAirportS1: 'Chegadas / Partidas',
      destAirportS2: 'Porta a porta',
      destBuqueTitle: 'Buquebus',
      destBuqueS0: 'Terminal Montevidéu',
      destBuqueS1: 'Buenos Aires',
      destBuqueS2: 'Conexão ferries',
      destPuntaTitle: 'Punta del Este',
      destPuntaS0: 'La Mano',
      destPuntaS1: 'Playa Brava',
      destPuntaS2: 'Porto de Punta',
      destColoniaTitle: 'Colonia del Sacramento',
      destColoniaS0: 'Bairro Histórico',
      destColoniaS1: 'Farol de Colonia',
      destColoniaS2: 'Calle de los Suspiros',
      destMvdTitle: 'Montevidéu',
      destMvdS0: 'Aeroporto Carrasco',
      destMvdS1: 'Centro',
      destMvdS2: 'Rambla',
      destMvdS3: 'Mercado del Puerto',
      wantGo: 'Quero ir',
      scanQuote: 'Escaneie e escreva',
      waWantGo: 'Olá {name}, quero ir a {place}. Pode cotar um transfer?',
      waWantGoQr: 'Olá {name}, quero ir a {place}',
      authBoot: 'Carregando…',
      switchDriver: 'Trocar PIN',
      pinBrand: 'Bem-vindo, Motorista',
      pinTitle: 'Digite seu PIN',
      pinSubmit: 'Entrar',
      pinError: 'PIN incorreto',
      authGoogleTitle: 'Entre com o Google',
      authGoogleText: '',
      authGoogleBtn: 'Entrar com Google',
      authRegisterTitle: 'Complete seus dados',
      authRegisterText: 'Nome, celular e veículo. O admin atribui um PIN e ativa você.',
      authRegisterSubmit: 'Enviar solicitação',
      authVehicleMake: 'Marca do veículo',
      authVehicleModel: 'Modelo',
      authPendingTitle: 'Solicitação enviada',
      authPendingText: 'Quando o admin ativar sua conta, você verá seu PIN aqui. Pode fechar e voltar depois.',
      authSignOut: 'Sair do Google',
      authRevealTitle: 'Seu PIN de motorista',
      authRevealText: 'Guarde. Só é mostrado esta vez.',
      authRevealContinue: 'Entendi, continuar',
      authSwitchAccount: 'Trocar conta Google',
      adminTitle: 'Administração',
      adminIntro: 'Motoristas em trial de 15 dias ou assinatura US$ 4,99/mês. PIN, regenerar, billing.',
      adminExit: 'Sair',
      adminNavDrivers: 'Motoristas',
      adminNavRequests: 'Solicitações',
      adminNavLogs: 'Ver logs',
      adminNavChangelog: 'Changelog',
      adminPinLabel: 'PIN',
      adminNameLabel: 'Nome',
      adminPhoneLabel: 'Telefone (com código do país)',
      adminSave: 'Salvar',
      adminClear: 'Limpar',
      adminGeneratePin: 'Gerar PIN',
      adminDriversTitle: 'Motoristas',
      adminRequestsTitle: 'Solicitações',
      adminRequestsHint: 'Contas Google pendentes. Ao ativar começa o trial de 15 dias.',
      adminLogsTitle: 'Logs de acesso',
      adminRefreshLogs: 'Atualizar',
      adminLogsHint: 'Últimos acessos de motoristas (quem e quando).',
      adminChangelogTitle: 'Changelog',
      adminChangelogHint: 'Notas de versão internas. Só admin.',
      adminChangelogSave: 'Salvar entrada',
      logoutTitle: 'Sair da sessão?',
      logoutText: 'Você encerra a sessão do motorista. Precisará entrar de novo com Google e seu PIN.',
      logoutCancel: 'Cancelar',
      logoutOk: 'Sair',
      contactKicker: 'Vamos conversar',
      contactIntro: 'Informe destino, horário e número de passageiros. Resposta no WhatsApp.',
      driverRole: 'Motorista profissional. Montevidéu e a Costa',
      contactCoverage: 'Montevidéu, Costa de Oro e trajetos a PDE / Colonia',
      contactVehicle: 'Bestune NAT · 100% elétrico',
      qrLabel: 'Fale pelo WhatsApp',
      qrAction: 'Abrir WhatsApp',
      contactNote: 'Os preços são cotados conforme o trajeto. Sem tarifas fixas publicadas.',
      footer: 'Transfers · Bestune NAT elétrico · Montevidéu, Uruguai',
      updateTitle: 'Nova versão disponível',
      updateText: 'Há uma atualização do app. Atualize para ver o design mais recente.',
      updateAction: 'Atualizar agora'
    }
  };

  function detectLanguage() {
    var stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && T[stored]) return stored;
    var nav = (navigator.language || 'es').toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt';
    if (nav.indexOf('en') === 0) return 'en';
    return 'es';
  }

  function activePhone() {
    var driver = window.PeredaSession && PeredaSession.getDriver();
    if (driver && driver.phone) return String(driver.phone).replace(/\D/g, '');
    return WA_NUMBER;
  }

  function activeDriverName() {
    var driver = window.PeredaSession && PeredaSession.getDriver();
    if (driver && driver.name) {
      return (PeredaSession.firstName ? PeredaSession.firstName(driver.name) : driver.name.split(/\s+/)[0]) || driver.name;
    }
    return 'Adrián';
  }

  function asciiFold(text) {
    try {
      return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      return String(text || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  function driverWaUrl() {
    return 'https://wa.me/' + activePhone();
  }

  function drawCleanQr(container, text, size) {
    if (!container) return;
    container.innerHTML = '';
    if (typeof QRCode === 'undefined') {
      container.textContent = 'QR';
      return;
    }
    var holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;';
    document.body.appendChild(holder);
    try {
      var qr = new QRCode(holder, {
        text: String(text || ''),
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.M
      });
      var model = qr._oQRCode;
      if (!model) throw new Error('QR sin modelo');
      var n = model.getModuleCount();
      var canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.setAttribute('aria-hidden', 'true');
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = QR_LIGHT;
      ctx.fillRect(0, 0, size, size);
      var cell = size / n;
      ctx.fillStyle = QR_DARK;
      var r;
      var c;
      for (r = 0; r < n; r += 1) {
        for (c = 0; c < n; c += 1) {
          if (model.isDark(r, c)) {
            ctx.fillRect(
              Math.floor(c * cell),
              Math.floor(r * cell),
              Math.ceil(cell),
              Math.ceil(cell)
            );
          }
        }
      }
      container.appendChild(canvas);
    } catch (e) {
      console.warn('QR', e);
      container.textContent = 'QR';
    }
    if (holder.parentNode) holder.parentNode.removeChild(holder);
  }

  function updateDestQrs() {
    var url = driverWaUrl();
    document.querySelectorAll('.dest-qr .dest-qr-canvas').forEach(function (canvasHost) {
      drawCleanQr(canvasHost, url, QR_DEST);
    });
  }

  function updateContactQr() {
    var host = document.getElementById('contact-wa-qr-canvas');
    drawCleanQr(host, driverWaUrl(), QR_CONTACT);
  }

  function applyDriverLinks(driver) {
    var base = driverWaUrl();
    var contactQr = document.getElementById('contact-wa-qr');
    var contactBtn = document.getElementById('contact-wa-btn');
    if (contactQr) contactQr.href = base;
    if (contactBtn) contactBtn.href = base;
    updateContactQr();
    updateDestQrs();
    var t = T[activeLang] || T.es;
    if (t.waAria) {
      document.querySelectorAll('[data-i18n-aria="waAria"]').forEach(function (el) {
        el.setAttribute('aria-label', t.waAria.replace('Adrián Pereda', (driver && driver.name) || 'Adrián Pereda'));
      });
    }
  }
  window.PeredaApplyDriverLinks = applyDriverLinks;

  function applyLang(lang) {
    if (!T[lang]) return;
    var t = T[lang];
    activeLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && typeof t[key] === 'string') el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key && typeof t[key] === 'string') el.setAttribute('aria-label', t[key]);
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });

    applyDriverLinks(window.PeredaSession && PeredaSession.getDriver());
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
    var gate = document.getElementById('update-gate');
    var btn = document.getElementById('update-gate-btn');
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
    var imgs = Array.prototype.slice.call(document.querySelectorAll('#vehicle-rotator img'));
    var idx = 0;
    var timer = null;
    var ROTATE_MS = 7000;

    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      imgs.forEach(function (img, n) {
        img.classList.toggle('is-active', n === idx);
      });
    }

    function start() {
      stop();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = window.setInterval(function () { show(idx + 1); }, ROTATE_MS);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    var stage = document.querySelector('.vehicle-stage');
    if (stage) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', start);
      stage.addEventListener('focusin', stop);
      stage.addEventListener('focusout', start);
    }

    show(0);
    start();

    var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
    var openers = Array.prototype.slice.call(document.querySelectorAll('[data-open-screen]'));
    var closers = Array.prototype.slice.call(document.querySelectorAll('[data-close-screen]'));
    var activeScreen = null;

    var homeRoot = document.querySelector('main.home');
    var siteHeader = document.querySelector('.site-header');
    var siteFooter = document.querySelector('footer');

    function setHomeInert(on) {
      [homeRoot, siteHeader, siteFooter].forEach(function (el) {
        if (!el) return;
        if (on) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
        el.setAttribute('aria-hidden', on ? 'true' : 'false');
      });
    }

    function closeScreen() {
      screens.forEach(function (el) {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('inert', '');
        el.hidden = true;
        el.removeAttribute('aria-modal');
      });
      document.body.classList.remove('screen-open');
      setHomeInert(false);
      activeScreen = null;
      if (location.hash && /^#(paseos|traslados|contacto)$/.test(location.hash)) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      start();
    }

    function openScreen(id) {
      var target = document.querySelector('[data-screen="' + id + '"]');
      if (!target) return;
      screens.forEach(function (el) {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('inert', '');
        el.hidden = true;
        el.removeAttribute('aria-modal');
      });
      target.hidden = false;
      target.removeAttribute('inert');
      target.classList.add('is-open');
      target.setAttribute('aria-hidden', 'false');
      target.setAttribute('aria-modal', 'true');
      document.body.classList.add('screen-open');
      setHomeInert(true);
      activeScreen = id;
      stop();
      var body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
      var back = target.querySelector('[data-close-screen]');
      if (back) back.focus();
      if (location.hash !== '#' + id) {
        history.replaceState(null, '', '#' + id);
      }
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openScreen(btn.getAttribute('data-open-screen'));
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener('click', closeScreen);
    });

    var paseoDetails = Array.prototype.slice.call(document.querySelectorAll('[data-paseo]'));
    var paseoOpeners = Array.prototype.slice.call(document.querySelectorAll('[data-open-paseo]'));
    var paseoClosers = Array.prototype.slice.call(document.querySelectorAll('[data-close-paseo]'));
    var paseosMain = document.querySelector('.screen-paseos-main');
    var paseosOuterBar = document.querySelector('#screen-paseos > .screen-bar');
    var activePaseo = null;

    function closePaseoDetail() {
      paseoDetails.forEach(function (el) {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('inert', '');
        el.hidden = true;
      });
      if (paseosMain) {
        paseosMain.removeAttribute('aria-hidden');
        paseosMain.removeAttribute('inert');
      }
      if (paseosOuterBar) {
        paseosOuterBar.removeAttribute('aria-hidden');
        paseosOuterBar.removeAttribute('inert');
        paseosOuterBar.hidden = false;
      }
      activePaseo = null;
    }

    function openPaseoDetail(id) {
      var target = document.querySelector('[data-paseo="' + id + '"]');
      if (!target) return;
      if (activeScreen !== 'paseos') openScreen('paseos');
      paseoDetails.forEach(function (el) {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('inert', '');
        el.hidden = true;
      });
      if (paseosMain) {
        paseosMain.setAttribute('aria-hidden', 'true');
        paseosMain.setAttribute('inert', '');
      }
      if (paseosOuterBar) {
        paseosOuterBar.setAttribute('aria-hidden', 'true');
        paseosOuterBar.setAttribute('inert', '');
        paseosOuterBar.hidden = true;
      }
      target.hidden = false;
      target.removeAttribute('inert');
      target.classList.add('is-open');
      target.setAttribute('aria-hidden', 'false');
      activePaseo = id;
      var body = target.querySelector('.screen-body');
      if (body) body.scrollTop = 0;
      var back = target.querySelector('[data-close-paseo]');
      if (back) back.focus();
    }

    paseoOpeners.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openPaseoDetail(btn.getAttribute('data-open-paseo'));
      });
    });

    paseoClosers.forEach(function (btn) {
      btn.addEventListener('click', closePaseoDetail);
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

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (activePaseo) {
        closePaseoDetail();
        var backHome = document.querySelector('#screen-paseos > .screen-bar [data-close-screen]');
        if (backHome) backHome.focus();
        return;
      }
      if (activeScreen) closeScreen();
    });

    function syncFromHash() {
      var id = (location.hash || '').replace(/^#/, '');
      if (id === 'paseos' || id === 'traslados' || id === 'contacto') openScreen(id);
      else if (activeScreen) closeScreen();
    }

    window.addEventListener('hashchange', syncFromHash);
    syncFromHash();
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  applyLang(detectLanguage());
  if (window.PeredaSession) {
    PeredaSession.start(function () {
      applyDriverLinks(PeredaSession.getDriver());
    });
  }
  initUi();
  setupPwa();
})();
