/**
 * Contenido semilla. Se usa para:
 *  1. Poblar D1 en local/preview (`pnpm --filter @kreatya/db seed:sql`).
 *  2. Construir la web sin API (fallback de `apps/web/src/lib/snapshot.ts`).
 * Los casos con `confidential: true` muestran «Cliente del sector X».
 */
import type {
  AiUseCase,
  Author,
  Block,
  ContentSnapshot,
  Faq,
  Post,
  PricingTier,
  Project,
  Sector,
  Solution,
  Technology,
  Testimonial,
} from '@kreatya/shared';
import { siteConfig } from '@kreatya/shared';

const p = (text: string): Block => ({ type: 'p', text });
const h2 = (text: string): Block => ({ type: 'h2', text });
const answer = (text: string): Block => ({ type: 'answer', text });
const list = (...items: string[]): Block => ({ type: 'list', ordered: false, items });

export const sectors: Sector[] = [
  {
    slug: 'industria',
    name: 'Industria',
    tagline: 'Del parte en papel al dato en planta, en tiempo real.',
    pain: 'Órdenes de fabricación en Excel, partes de trabajo en papel y un ERP genérico que nadie en planta quiere usar.',
    modules: [
      'Órdenes de fabricación',
      'Partes de trabajo en tablet',
      'Trazabilidad de lotes',
      'Mantenimiento preventivo',
      'Cuadro de mando OEE',
    ],
    integrations: [
      'ERP existente (SAP Business One, Sage, A3)',
      'Lectores de código de barras',
      'PLC vía OPC-UA',
      'Power BI',
    ],
    blocks: [
      answer(
        'Un software a medida para industria conecta la oficina técnica con la planta: órdenes, partes, lotes y mantenimiento en una sola herramienta que se adapta a tu proceso. Un primer módulo útil suele estar en uso en 4–6 semanas y cuesta entre 15.000 y 40.000 €.',
      ),
      h2('Por qué el software estándar se queda corto en planta'),
      p(
        'Cada taller tiene su forma de lanzar órdenes, de agrupar operaciones y de controlar la calidad. Los ERP generalistas obligan a adaptar el proceso al programa, y el resultado suele ser una doble contabilidad: lo que dice el sistema y lo que de verdad pasa en planta, apuntado en hojas de cálculo.',
      ),
      p(
        'Nosotros empezamos al revés: recorremos la planta, dibujamos el plano del proceso real y construimos solo lo que aporta. Si ya tienes un ERP para la parte contable, lo integramos en lugar de sustituirlo.',
      ),
      h2('Qué solemos construir'),
      list(
        'Lanzamiento y seguimiento de órdenes de fabricación con prioridades visuales.',
        'Partes de trabajo en tablet con fichaje por operación y foto de incidencias.',
        'Trazabilidad de lotes de materia prima a producto terminado.',
        'Mantenimiento preventivo con avisos y histórico por máquina.',
        'Indicadores OEE calculados automáticamente.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'La IA lee albaranes de proveedor y certificados de calidad para dar de alta lotes sin teclear, resume las incidencias del turno para el jefe de producción y detecta patrones en paradas de máquina.',
      ),
    ],
    seo: {
      title: 'Software para industria a medida | Kreatya Labs',
      description:
        'Software a medida para empresas industriales: órdenes de fabricación, partes en tablet, trazabilidad y OEE. Primer módulo en uso en 4–6 semanas.',
    },
  },
  {
    slug: 'logistica',
    name: 'Logística',
    tagline: 'Cada envío localizado, cada albarán digitalizado.',
    pain: 'Rutas planificadas a mano, albaranes que se pierden y clientes que llaman para saber dónde está su pedido.',
    modules: [
      'Planificación de rutas',
      'App de conductor con firma digital',
      'Portal de seguimiento para clientes',
      'Gestión de almacén',
      'Facturación automática por servicio',
    ],
    integrations: [
      'Transportistas (API de agencias)',
      'Telemetría de flota',
      'ERP contable',
      'Google Maps Platform',
    ],
    blocks: [
      answer(
        'El software a medida para logística une planificación, conductores y clientes: rutas optimizadas, albarán digital con firma y un portal donde el cliente consulta su envío. Las empresas con las que trabajamos reducen entre un 50 y un 70 % el tiempo de facturación.',
      ),
      h2('El problema: información que llega tarde'),
      p(
        'En logística el dato llega cuando el camión vuelve. Los albaranes firmados se escanean días después, la facturación se retrasa y el equipo de tráfico pasa horas al teléfono respondiendo a clientes.',
      ),
      h2('Qué solemos construir'),
      list(
        'Planificador de rutas con arrastrar y soltar y restricciones de horario.',
        'App de conductor que funciona sin cobertura y sincroniza al recuperar señal.',
        'Portal de clientes con seguimiento, documentos y incidencias.',
        'Facturación generada automáticamente a partir de servicios cerrados.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'Extracción automática de datos de albaranes y CMR, clasificación de incidencias y respuestas sugeridas a las consultas de clientes a partir del estado real del envío.',
      ),
    ],
    seo: {
      title: 'Software para logística y transporte | Kreatya Labs',
      description:
        'Software a medida para empresas de logística: rutas, app de conductor, albarán digital y portal de seguimiento. Factura hasta un 70 % más rápido.',
    },
  },
  {
    slug: 'retail',
    name: 'Retail',
    tagline: 'Stock único entre tienda física y online.',
    pain: 'Stock descuadrado entre tiendas y web, pedidos que se venden dos veces y promociones que se configuran en cinco sitios.',
    modules: [
      'Stock unificado multialmacén',
      'Gestión de pedidos omnicanal',
      'Programa de fidelización',
      'Reposición sugerida',
      'Panel de ventas por tienda',
    ],
    integrations: ['Shopify, WooCommerce, PrestaShop', 'TPV', 'Marketplaces', 'Pasarelas de pago'],
    blocks: [
      answer(
        'Un sistema a medida para retail mantiene un único stock para tiendas, web y marketplaces, centraliza pedidos y sugiere reposiciones. Lo integramos con tu TPV y tu tienda online actuales, sin cambiarlos, y el primer módulo suele estar en uso en 5–6 semanas.',
      ),
      h2('Omnicanal sin hojas de cálculo'),
      p(
        'Cuando cada canal tiene su propio stock, el equipo pasa el día cuadrando inventarios. Un middleware a medida sincroniza existencias en tiempo real y reparte los pedidos al almacén o tienda más adecuado.',
      ),
      h2('Qué solemos construir'),
      list(
        'Sincronización de stock entre TPV, e-commerce y marketplaces.',
        'Orquestador de pedidos con reglas de asignación.',
        'Fidelización con monedero y cupones personalizados.',
        'Reposición sugerida a partir de ventas y estacionalidad.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'Previsión de demanda por tienda, descripciones de producto generadas y revisadas por tu equipo, y un asistente para atención al cliente que consulta el estado real del pedido.',
      ),
    ],
    seo: {
      title: 'Software para retail y comercio | Kreatya Labs',
      description:
        'Software a medida para retail: stock unificado entre tienda y online, pedidos omnicanal, fidelización y previsión de demanda con IA.',
    },
  },
  {
    slug: 'salud',
    name: 'Salud',
    tagline: 'Menos papeleo, más tiempo con el paciente.',
    pain: 'Citas por teléfono, consentimientos en papel y profesionales que dedican una hora al día a tareas administrativas.',
    modules: [
      'Agenda y cita online',
      'Consentimientos con firma digital',
      'Historia clínica estructurada',
      'Recordatorios automáticos',
      'Facturación a mutuas',
    ],
    integrations: [
      'Software clínico existente',
      'Mutuas y aseguradoras',
      'Pasarela de pagos',
      'WhatsApp Business',
    ],
    blocks: [
      answer(
        'Desarrollamos software a medida para clínicas y centros de salud: cita online, consentimientos digitales, recordatorios y facturación a mutuas, cumpliendo el RGPD para datos de salud. Las clínicas reducen un 40 % las ausencias con recordatorios automáticos.',
      ),
      h2('Datos de salud con las máximas garantías'),
      p(
        'Los datos de salud son una categoría especial según el RGPD. Diseñamos con cifrado, registro de accesos y alojamiento en la UE desde el primer día, y te acompañamos en la evaluación de impacto.',
      ),
      h2('Qué solemos construir'),
      list(
        'Cita online conectada a la agenda real de cada profesional.',
        'Consentimientos informados firmados en tablet.',
        'Recordatorios por SMS o WhatsApp con confirmación.',
        'Facturación agrupada a mutuas.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'Transcripción y resumen de la consulta para que el profesional solo revise, clasificación de documentos entrantes y respuesta a preguntas frecuentes de pacientes.',
      ),
    ],
    seo: {
      title: 'Software para clínicas y salud | Kreatya Labs',
      description:
        'Software a medida para clínicas: cita online, consentimientos digitales, recordatorios y facturación a mutuas. RGPD para datos de salud.',
    },
  },
  {
    slug: 'agroalimentario',
    name: 'Agroalimentario',
    tagline: 'Trazabilidad del campo al lineal.',
    pain: 'Cuadernos de campo en papel, auditorías de calidad que paralizan la semana y trazabilidad imposible de reconstruir.',
    modules: [
      'Cuaderno de campo digital',
      'Trazabilidad de partidas',
      'Control de calidad y APPCC',
      'Liquidación a socios',
      'Etiquetado',
    ],
    integrations: ['Básculas y etiquetadoras', 'SIEX', 'ERP contable', 'Sensores IoT'],
    blocks: [
      answer(
        'El software a medida agroalimentario digitaliza el cuaderno de campo, la trazabilidad de partidas y el APPCC, y conecta básculas y etiquetadoras. Preparar una auditoría pasa de días a minutos porque toda la trazabilidad se reconstruye con un clic.',
      ),
      h2('La trazabilidad como ventaja comercial'),
      p(
        'Las grandes cadenas exigen trazabilidad completa y rápida. Con un sistema a medida, cada partida sabe de qué parcela viene, qué tratamientos recibió y a qué cliente se envió.',
      ),
      h2('Qué solemos construir'),
      list(
        'Cuaderno de campo en móvil, también sin cobertura.',
        'Trazabilidad lote a lote con códigos QR.',
        'Registros APPCC con alertas.',
        'Liquidaciones a socios de cooperativa.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'Lectura automática de análisis de laboratorio, alertas de desviaciones en registros de calidad e informes de auditoría redactados a partir de los datos.',
      ),
    ],
    seo: {
      title: 'Software agroalimentario a medida | Kreatya Labs',
      description:
        'Software a medida para el sector agroalimentario: cuaderno de campo, trazabilidad, APPCC y liquidación a socios. Auditorías en minutos.',
    },
  },
  {
    slug: 'servicios',
    name: 'Servicios profesionales',
    tagline: 'Cada hora registrada, cada proyecto rentable.',
    pain: 'Horas que no se imputan, presupuestos que se desvían sin que nadie lo vea y facturación que depende de una persona.',
    modules: [
      'Imputación de horas',
      'Control de rentabilidad por proyecto',
      'Portal de cliente',
      'Propuestas y presupuestos',
      'Facturación recurrente',
    ],
    integrations: [
      'Google Workspace y Microsoft 365',
      'Holded, A3, Sage',
      'Calendarios',
      'Firma electrónica',
    ],
    blocks: [
      answer(
        'Para despachos, consultoras y agencias desarrollamos herramientas a medida de imputación de horas, rentabilidad por proyecto y portal de cliente. Ver la desviación de cada proyecto en tiempo real suele recuperar entre un 8 y un 15 % de horas no facturadas.',
      ),
      h2('El margen se pierde en lo que no se mide'),
      p(
        'En servicios profesionales el producto es el tiempo. Si las horas no se registran o se registran tarde, nadie sabe qué proyectos ganan dinero hasta que es demasiado tarde.',
      ),
      h2('Qué solemos construir'),
      list(
        'Imputación de horas desde el calendario en dos clics.',
        'Rentabilidad por proyecto, cliente y persona.',
        'Portal de cliente con documentos y aprobaciones.',
        'Propuestas generadas a partir de plantillas y tarifas.',
      ),
      h2('Dónde aporta la IA'),
      p(
        'Propuestas redactadas a partir de las notas de la reunión, resúmenes de llamadas para el CRM y clasificación automática de documentos de clientes.',
      ),
    ],
    seo: {
      title: 'Software para despachos y consultoras | Kreatya Labs',
      description:
        'Software a medida para servicios profesionales: imputación de horas, rentabilidad por proyecto, portal de cliente y propuestas con IA.',
    },
  },
];

export const solutions: Solution[] = [
  {
    slug: 'software-a-medida',
    name: 'Software a medida',
    kind: 'portal',
    tagline: 'Hecho para tu negocio, no al revés.',
    modules: [
      'Descubrimiento y plano del proceso',
      'MVP en 4–6 semanas',
      'Sprints de 2 semanas',
      'Evolución continua',
    ],
    integrations: ['Cualquier sistema con API', 'Bases de datos existentes', 'Ficheros y FTP'],
    blocks: [
      answer(
        'El software a medida es una aplicación diseñada para el proceso concreto de tu empresa, en lugar de adaptar tu empresa a un programa genérico. Con nosotros, un primer módulo útil está en uso en 4–6 semanas, y el código y los datos son tuyos.',
      ),
      h2('Cuándo tiene sentido'),
      list(
        'Tu proceso es una ventaja competitiva y el software estándar te obliga a cambiarlo.',
        'Pagas licencias de varias herramientas que no se hablan entre sí.',
        'Tu equipo mantiene hojas de cálculo paralelas al sistema oficial.',
      ),
      h2('Cómo trabajamos'),
      p(
        'Diagnóstico gratuito, plano del proceso con presupuesto cerrado por fase, construcción en sprints de dos semanas con entregas que se usan desde el primer sprint, y evolución con bolsa de horas.',
      ),
    ],
    seo: {
      title: 'Desarrollo de software a medida | Kreatya Labs',
      description:
        'Desarrollo de software a medida para pymes: MVP en uso en 4–6 semanas, presupuesto cerrado por fase y el código es tuyo.',
    },
  },
  {
    slug: 'erp-a-medida',
    name: 'ERP a medida',
    kind: 'erp',
    tagline: 'Tu operativa entera, en un solo sistema que se adapta a ti.',
    modules: [
      'Compras y ventas',
      'Inventario y almacén',
      'Producción',
      'Facturación',
      'Cuadros de mando',
    ],
    integrations: ['Contabilidad (A3, Sage, Holded)', 'Bancos', 'E-commerce', 'Verifactu'],
    blocks: [
      answer(
        'Un ERP a medida cubre compras, ventas, inventario, producción y facturación siguiendo exactamente tu forma de trabajar, e integra tu contabilidad actual. Construimos primero el módulo que más duele y lo ponemos en uso en 4–6 semanas.',
      ),
      h2('ERP a medida frente a ERP estándar'),
      p(
        'Un ERP estándar es más barato al principio, pero las adaptaciones, licencias por usuario y consultoría lo encarecen rápido. Uno a medida cuesta más al inicio y menos a medio plazo, y no tiene coste por usuario.',
      ),
      h2('Módulos habituales'),
      list(
        'Compras, proveedores y recepción de mercancía.',
        'Ventas, presupuestos y pedidos.',
        'Inventario multialmacén con trazabilidad.',
        'Facturación compatible con Verifactu.',
      ),
    ],
    seo: {
      title: 'ERP a medida para pymes | Kreatya Labs',
      description:
        'ERP a medida para pymes: compras, ventas, inventario, producción y facturación adaptados a tu proceso. Sin coste por usuario.',
    },
  },
  {
    slug: 'crm-a-medida',
    name: 'CRM a medida',
    kind: 'crm',
    tagline: 'Un CRM que tu equipo comercial sí quiere usar.',
    modules: [
      'Pipeline comercial',
      'Ficha 360º de cliente',
      'Propuestas',
      'Automatizaciones',
      'Previsión de ventas',
    ],
    integrations: ['Correo y calendario', 'Telefonía', 'ERP', 'Formularios web'],
    blocks: [
      answer(
        'Un CRM a medida refleja tu ciclo de venta real, se conecta con tu ERP y tu correo y elimina los campos que nadie rellena. Con IA, resume llamadas y propone el siguiente paso de cada oportunidad.',
      ),
      h2('Por qué los CRM genéricos se abandonan'),
      p(
        'Demasiados campos, etapas que no corresponden a tu venta y cero integración con el resto de sistemas. El comercial vuelve a su libreta.',
      ),
      h2('Qué incluye'),
      list(
        'Pipeline con tus etapas reales.',
        'Ficha de cliente con pedidos, facturas e incidencias del ERP.',
        'Propuestas generadas desde plantillas.',
        'Resúmenes de llamadas con IA.',
      ),
    ],
    seo: {
      title: 'CRM a medida | Kreatya Labs',
      description:
        'CRM a medida integrado con tu ERP y tu correo: pipeline real, ficha 360º, propuestas y resúmenes de llamadas con IA.',
    },
  },
  {
    slug: 'apps-moviles',
    name: 'Apps móviles a medida',
    kind: 'app',
    tagline: 'Apps para tu equipo de campo y tus clientes.',
    modules: [
      'App de técnicos y conductores',
      'App de clientes',
      'Modo sin conexión',
      'Firma y fotos',
      'Notificaciones',
    ],
    integrations: ['Tu ERP o CRM', 'Mapas', 'Pagos', 'Sensores y escáneres'],
    blocks: [
      answer(
        'Desarrollamos aplicaciones a medida para iOS y Android con una sola base de código: apps para equipos de campo que funcionan sin cobertura y apps para clientes conectadas a tus sistemas. Una primera versión publicada suele estar lista en 6–8 semanas.',
      ),
      h2('Apps de campo'),
      p(
        'Partes de trabajo, inspecciones, entregas con firma y fotos. Funcionan sin conexión y sincronizan al recuperar cobertura.',
      ),
      h2('Apps de cliente'),
      p(
        'Pedidos, seguimiento, citas, fidelización. Siempre conectadas a tus datos reales, sin duplicar información.',
      ),
    ],
    seo: {
      title: 'Desarrollo de apps a medida | Kreatya Labs',
      description:
        'Apps móviles a medida para iOS y Android: apps de campo sin conexión y apps de cliente integradas con tu ERP o CRM.',
    },
  },
  {
    slug: 'portales-clientes',
    name: 'Portales de cliente y proveedor',
    kind: 'portal',
    tagline: 'Que tus clientes se sirvan solos.',
    modules: ['Área privada', 'Pedidos y documentos', 'Incidencias', 'Aprobaciones', 'Pagos'],
    integrations: ['ERP', 'Firma electrónica', 'Pasarelas de pago', 'SSO'],
    blocks: [
      answer(
        'Un portal de cliente a medida permite consultar pedidos, descargar documentos, abrir incidencias y aprobar presupuestos sin llamar ni enviar correos. Reduce las consultas repetitivas al equipo y mejora la experiencia del cliente.',
      ),
      h2('Qué resuelve'),
      list(
        'Llamadas para preguntar por el estado de un pedido.',
        'Correos para pedir duplicados de facturas.',
        'Aprobaciones que se pierden en la bandeja de entrada.',
      ),
    ],
    seo: {
      title: 'Portal de clientes a medida | Kreatya Labs',
      description:
        'Portales de cliente y proveedor a medida: pedidos, documentos, incidencias y aprobaciones conectados a tu ERP.',
    },
  },
  {
    slug: 'integraciones',
    name: 'Integraciones entre sistemas',
    kind: 'integracion',
    tagline: 'Que tus programas por fin se hablen.',
    modules: [
      'Conectores a medida',
      'Sincronización de datos',
      'Monitorización',
      'Alertas de errores',
    ],
    integrations: [
      'ERP, CRM, e-commerce',
      'APIs de terceros',
      'Ficheros EDI y FTP',
      'Bases de datos',
    ],
    blocks: [
      answer(
        'Conectamos los programas que ya usas (ERP, CRM, tienda online, contabilidad) para que los datos fluyan solos y nadie tenga que copiarlos a mano. Cada integración incluye monitorización y alertas si algo falla.',
      ),
      h2('Señales de que necesitas integrar'),
      list(
        'Alguien copia pedidos de la web al ERP.',
        'El stock no coincide entre sistemas.',
        'Los informes se montan exportando a Excel desde tres sitios.',
      ),
    ],
    seo: {
      title: 'Integración de sistemas y APIs | Kreatya Labs',
      description:
        'Integramos ERP, CRM, e-commerce y contabilidad para que los datos fluyan solos. Monitorización y alertas incluidas.',
    },
  },
];

export const technologies: Technology[] = [
  { slug: 'typescript', name: 'TypeScript' },
  { slug: 'react', name: 'React' },
  { slug: 'react-native', name: 'React Native' },
  { slug: 'nodejs', name: 'Node.js' },
  { slug: 'python', name: 'Python' },
  { slug: 'postgresql', name: 'PostgreSQL' },
  { slug: 'cloudflare', name: 'Cloudflare' },
  { slug: 'llm', name: 'Modelos de lenguaje (IA)' },
  { slug: 'power-bi', name: 'Power BI' },
];

export const testimonials: Testimonial[] = [
  {
    id: 't-transportes',
    name: 'Marta Gil',
    role: 'Directora de operaciones',
    company: 'Transportes Levante',
    quote:
      'En seis semanas los conductores ya firmaban albaranes en la app. Facturamos el mismo día del servicio, no a final de mes.',
    rating: 5,
  },
  {
    id: 't-metal',
    name: 'Jordi Puig',
    role: 'Gerente',
    company: 'Cliente del sector industrial',
    quote:
      'Por fin el sistema dice lo mismo que la planta. Hemos dejado de imprimir órdenes de trabajo.',
    rating: 5,
  },
  {
    id: 't-clinica',
    name: 'Dra. Lucía Moreno',
    role: 'Directora médica',
    company: 'Clínica Dental Sonrisa',
    quote:
      'Los recordatorios automáticos han reducido las ausencias casi a la mitad. Y el equipo de recepción respira.',
    rating: 5,
  },
  {
    id: 't-coop',
    name: 'Antonio Ruiz',
    role: 'Responsable de calidad',
    company: 'Cooperativa del Valle',
    quote: 'La última auditoría la preparamos en una mañana. Antes era una semana entera.',
    rating: 5,
  },
];

const iso = (d: string) => `${d}T09:00:00.000Z`;

export const projects: Project[] = [
  {
    slug: 'albaran-digital-transportes-levante',
    title: 'Albarán digital y facturación el mismo día',
    clientName: 'Transportes Levante',
    confidential: false,
    companySize: 'mediana',
    durationWeeks: 6,
    summary:
      'App de conductor con firma digital y facturación automática para una flota de 60 camiones.',
    challenge:
      'Los albaranes firmados volvían en la cabina del camión y se escaneaban días después. La facturación se cerraba a final de mes, con errores y retrasos de cobro.',
    solution:
      'App de conductor que funciona sin cobertura, con firma y fotos de entrega; panel de tráfico con estado en tiempo real; facturación generada automáticamente al cerrar cada servicio.',
    aiRole:
      'La IA lee los CMR y albaranes de terceros fotografiados por el conductor y rellena los datos del servicio sin teclear.',
    processBefore: [
      { label: 'Entrega' },
      { label: 'Albarán en papel' },
      { label: 'Vuelta a base' },
      { label: 'Escaneo manual' },
      { label: 'Factura a fin de mes' },
    ],
    processAfter: [
      { label: 'Entrega' },
      { label: 'Firma en la app' },
      { label: 'Factura automática' },
    ],
    metrics: [
      { value: 70, unit: '%', description: 'menos tiempo de facturación', prefix: '−' },
      { value: 12, unit: 'h/sem', description: 'ahorradas en administración' },
      { value: 18, unit: 'días', description: 'menos de periodo medio de cobro', prefix: '−' },
      { value: 6, unit: 'semanas', description: 'hasta la primera versión en uso' },
    ],
    mainVideo: {
      provider: 'youtube',
      ref: 'pendiente',
      poster: '/media/proyectos/albaran-digital-transportes-levante/cover.svg',
      durationSeconds: 94,
      transcript:
        'Recorrido por la app de conductor: lista de servicios del día, navegación, entrega con firma y foto, y cómo el panel de tráfico recibe el albarán al instante y genera la factura.',
    },
    cardVideo: null,
    cover: '/media/proyectos/albaran-digital-transportes-levante/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/albaran-digital-transportes-levante/panel.svg',
        alt: 'Panel de tráfico con los servicios del día y su estado en el mapa',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
      {
        src: '/media/proyectos/albaran-digital-transportes-levante/app.svg',
        alt: 'App de conductor mostrando la pantalla de firma del albarán',
        device: 'mobile',
        width: 390,
        height: 844,
      },
      {
        src: '/media/proyectos/albaran-digital-transportes-levante/facturas.svg',
        alt: 'Listado de facturas generadas automáticamente al cerrar servicios',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'tour',
    demoUrl: null,
    demoTour: [
      {
        image: '/media/proyectos/albaran-digital-transportes-levante/panel.svg',
        title: 'Panel de tráfico',
        text: 'Tráfico ve todos los servicios del día y su estado en tiempo real.',
        hotspot: { x: 30, y: 35 },
      },
      {
        image: '/media/proyectos/albaran-digital-transportes-levante/app.svg',
        title: 'Firma en destino',
        text: 'El conductor recoge la firma y una foto. Funciona sin cobertura.',
        hotspot: { x: 50, y: 70 },
      },
      {
        image: '/media/proyectos/albaran-digital-transportes-levante/facturas.svg',
        title: 'Factura automática',
        text: 'Al cerrar el servicio se genera la factura. Sin teclear.',
        hotspot: { x: 70, y: 30 },
      },
    ],
    testimonialId: 't-transportes',
    sectors: ['logistica'],
    solutions: ['apps-moviles', 'integraciones'],
    technologies: ['react-native', 'typescript', 'cloudflare', 'llm'],
    related: ['portal-seguimiento-envios', 'erp-fabricacion-metal'],
    featured: true,
    publishedAt: iso('2026-06-10'),
    updatedAt: iso('2026-09-01'),
    seo: {
      title: 'Caso: albarán digital en logística | Kreatya Labs',
      description:
        'App de conductor con firma digital y facturación automática: −70 % de tiempo de facturación en una flota de 60 camiones.',
    },
  },
  {
    slug: 'erp-fabricacion-metal',
    title: 'ERP de fabricación para un taller de calderería',
    clientName: null,
    confidential: true,
    companySize: 'pequena',
    durationWeeks: 10,
    summary:
      'Órdenes de fabricación, partes en tablet y trazabilidad de lotes integrados con su contabilidad.',
    challenge:
      'Las órdenes de trabajo se imprimían y los partes volvían a mano. Nadie sabía el coste real de cada pedido hasta semanas después.',
    solution:
      'ERP de producción a medida con lanzamiento de órdenes, partes por operación en tablet, consumo de material por lote y coste real por pedido, integrado con su software contable.',
    aiRole:
      'Lectura automática de certificados de materiales y resumen diario de incidencias para el jefe de producción.',
    processBefore: [
      { label: 'Pedido' },
      { label: 'Orden impresa' },
      { label: 'Parte a mano' },
      { label: 'Transcripción' },
      { label: 'Coste estimado' },
    ],
    processAfter: [
      { label: 'Pedido' },
      { label: 'Orden en tablet' },
      { label: 'Coste real al instante' },
    ],
    metrics: [
      { value: 100, unit: '%', description: 'de órdenes sin papel' },
      { value: 9, unit: 'h/sem', description: 'ahorradas en transcripción' },
      { value: 22, unit: '%', description: 'mejor precisión en presupuestos', prefix: '+' },
    ],
    mainVideo: null,
    cardVideo: null,
    cover: '/media/proyectos/erp-fabricacion-metal/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/erp-fabricacion-metal/ordenes.svg',
        alt: 'Tablero de órdenes de fabricación con su prioridad y estado',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
      {
        src: '/media/proyectos/erp-fabricacion-metal/parte.svg',
        alt: 'Parte de trabajo en tablet con fichaje por operación',
        device: 'tablet',
        width: 1024,
        height: 768,
      },
    ],
    demoType: 'on_request',
    demoUrl: null,
    demoTour: [],
    testimonialId: 't-metal',
    sectors: ['industria'],
    solutions: ['erp-a-medida'],
    technologies: ['typescript', 'react', 'postgresql', 'llm'],
    related: ['trazabilidad-cooperativa', 'albaran-digital-transportes-levante'],
    featured: true,
    publishedAt: iso('2026-05-02'),
    updatedAt: iso('2026-08-20'),
    seo: {
      title: 'Caso: ERP de fabricación a medida | Kreatya Labs',
      description:
        'ERP de producción para un taller de calderería: órdenes sin papel, partes en tablet y coste real por pedido.',
    },
  },
  {
    slug: 'citas-clinica-dental',
    title: 'Cita online y recordatorios para una red de clínicas',
    clientName: 'Clínica Dental Sonrisa',
    confidential: false,
    companySize: 'pequena',
    durationWeeks: 5,
    summary: 'Cita online, consentimientos digitales y recordatorios por WhatsApp para 4 clínicas.',
    challenge:
      'Recepción pasaba la mañana al teléfono, los consentimientos se archivaban en papel y las ausencias rondaban el 15 %.',
    solution:
      'Cita online conectada a su software clínico, consentimientos firmados en tablet y recordatorios con confirmación por WhatsApp.',
    aiRole: 'Asistente que responde preguntas frecuentes de pacientes y propone huecos de agenda.',
    processBefore: [
      { label: 'Llamada' },
      { label: 'Agenda en papel' },
      { label: 'Consentimiento impreso' },
      { label: 'Archivo' },
    ],
    processAfter: [
      { label: 'Cita online' },
      { label: 'Recordatorio' },
      { label: 'Firma en tablet' },
    ],
    metrics: [
      { value: 45, unit: '%', description: 'menos ausencias', prefix: '−' },
      { value: 15, unit: 'h/sem', description: 'liberadas en recepción' },
      { value: 62, unit: '%', description: 'de citas reservadas online' },
    ],
    mainVideo: {
      provider: 'youtube',
      ref: 'pendiente',
      poster: '/media/proyectos/citas-clinica-dental/cover.svg',
      durationSeconds: 71,
    },
    cardVideo: null,
    cover: '/media/proyectos/citas-clinica-dental/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/citas-clinica-dental/reserva.svg',
        alt: 'Pantalla de reserva de cita con huecos disponibles por profesional',
        device: 'mobile',
        width: 390,
        height: 844,
      },
      {
        src: '/media/proyectos/citas-clinica-dental/agenda.svg',
        alt: 'Agenda semanal de la clínica con citas confirmadas',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'tour',
    demoUrl: null,
    demoTour: [
      {
        image: '/media/proyectos/citas-clinica-dental/reserva.svg',
        title: 'Reserva en 3 toques',
        text: 'El paciente elige tratamiento, profesional y hora.',
        hotspot: { x: 50, y: 55 },
      },
      {
        image: '/media/proyectos/citas-clinica-dental/agenda.svg',
        title: 'Agenda sincronizada',
        text: 'La cita aparece al instante en la agenda de la clínica.',
        hotspot: { x: 40, y: 40 },
      },
    ],
    testimonialId: 't-clinica',
    sectors: ['salud'],
    solutions: ['portales-clientes', 'integraciones'],
    technologies: ['typescript', 'react', 'cloudflare', 'llm'],
    related: ['portal-clientes-asesoria'],
    featured: true,
    publishedAt: iso('2026-04-15'),
    updatedAt: iso('2026-07-11'),
    seo: {
      title: 'Caso: cita online para clínicas | Kreatya Labs',
      description:
        'Cita online, consentimientos digitales y recordatorios por WhatsApp: −45 % de ausencias en una red de clínicas dentales.',
    },
  },
  {
    slug: 'trazabilidad-cooperativa',
    title: 'Trazabilidad y cuaderno de campo para una cooperativa',
    clientName: 'Cooperativa del Valle',
    confidential: false,
    companySize: 'mediana',
    durationWeeks: 8,
    summary: 'Cuaderno de campo móvil y trazabilidad lote a lote para 300 socios.',
    challenge:
      'Cada auditoría de calidad exigía reconstruir a mano el origen de cada partida a partir de cuadernos en papel.',
    solution:
      'App de cuaderno de campo sin conexión para los socios, trazabilidad con QR desde la báscula hasta el palé y registros APPCC con alertas.',
    aiRole: 'Lectura automática de análisis de laboratorio y borrador del informe de auditoría.',
    processBefore: [
      { label: 'Cuaderno en papel' },
      { label: 'Entrada en báscula' },
      { label: 'Etiqueta manual' },
      { label: 'Reconstrucción en auditoría' },
    ],
    processAfter: [
      { label: 'App de campo' },
      { label: 'QR en báscula' },
      { label: 'Trazabilidad en 1 clic' },
    ],
    metrics: [
      { value: 90, unit: '%', description: 'menos tiempo en auditorías', prefix: '−' },
      { value: 300, unit: 'socios', description: 'usando la app' },
      { value: 0, unit: 'incidencias', description: 'de trazabilidad en la última auditoría' },
    ],
    mainVideo: null,
    cardVideo: null,
    cover: '/media/proyectos/trazabilidad-cooperativa/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/trazabilidad-cooperativa/cuaderno.svg',
        alt: 'Cuaderno de campo en el móvil con tratamientos por parcela',
        device: 'mobile',
        width: 390,
        height: 844,
      },
      {
        src: '/media/proyectos/trazabilidad-cooperativa/traza.svg',
        alt: 'Árbol de trazabilidad de una partida desde la parcela al cliente',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'none',
    demoUrl: null,
    demoTour: [],
    testimonialId: 't-coop',
    sectors: ['agroalimentario'],
    solutions: ['software-a-medida', 'apps-moviles'],
    technologies: ['react-native', 'typescript', 'postgresql', 'llm'],
    related: ['erp-fabricacion-metal'],
    featured: true,
    publishedAt: iso('2026-03-20'),
    updatedAt: iso('2026-06-30'),
    seo: {
      title: 'Caso: trazabilidad agroalimentaria | Kreatya Labs',
      description:
        'Cuaderno de campo y trazabilidad lote a lote para 300 socios: auditorías un 90 % más rápidas.',
    },
  },
  {
    slug: 'stock-omnicanal-moda',
    title: 'Stock único entre 12 tiendas y la web',
    clientName: null,
    confidential: true,
    companySize: 'mediana',
    durationWeeks: 7,
    summary: 'Middleware de stock y pedidos omnicanal entre TPV, Shopify y dos marketplaces.',
    challenge:
      'Se vendían prendas sin stock en la web y el equipo pasaba dos días por semana cuadrando inventarios.',
    solution:
      'Middleware que sincroniza el stock en tiempo real y asigna cada pedido online a la tienda o almacén óptimo.',
    aiRole: 'Previsión de demanda por tienda para sugerir traspasos antes de la rotura de stock.',
    processBefore: [
      { label: 'Venta web' },
      { label: 'Comprobación manual' },
      { label: 'Llamada a tienda' },
      { label: 'Envío' },
    ],
    processAfter: [{ label: 'Venta web' }, { label: 'Asignación automática' }, { label: 'Envío' }],
    metrics: [
      { value: 96, unit: '%', description: 'menos ventas sin stock', prefix: '−' },
      { value: 16, unit: 'h/sem', description: 'ahorradas en cuadres' },
      { value: 8, unit: '%', description: 'más ventas online', prefix: '+' },
    ],
    mainVideo: null,
    cardVideo: null,
    cover: '/media/proyectos/stock-omnicanal-moda/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/stock-omnicanal-moda/stock.svg',
        alt: 'Panel de stock por tienda con alertas de rotura',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'tour',
    demoUrl: null,
    demoTour: [
      {
        image: '/media/proyectos/stock-omnicanal-moda/stock.svg',
        title: 'Stock en tiempo real',
        text: 'Cada tienda, almacén y canal en una sola vista.',
        hotspot: { x: 45, y: 45 },
      },
    ],
    testimonialId: null,
    sectors: ['retail'],
    solutions: ['integraciones'],
    technologies: ['typescript', 'nodejs', 'cloudflare', 'python'],
    related: ['albaran-digital-transportes-levante'],
    featured: false,
    publishedAt: iso('2026-02-11'),
    updatedAt: iso('2026-05-02'),
    seo: {
      title: 'Caso: stock omnicanal en retail | Kreatya Labs',
      description:
        'Stock único entre 12 tiendas, Shopify y marketplaces: −96 % de ventas sin stock y 16 h semanales ahorradas.',
    },
  },
  {
    slug: 'portal-clientes-asesoria',
    title: 'Portal de clientes para una asesoría',
    clientName: 'Asesoría Martín & Asociados',
    confidential: false,
    companySize: 'pequena',
    durationWeeks: 5,
    summary: 'Portal donde 400 clientes suben facturas y la IA las clasifica para contabilidad.',
    challenge:
      'Los clientes enviaban facturas por correo, WhatsApp y en mano. Clasificarlas consumía la primera semana de cada trimestre.',
    solution:
      'Portal de cliente con subida de documentos, avisos de plazos fiscales y bandeja de revisión para el equipo.',
    aiRole:
      'La IA extrae emisor, fecha, base e IVA de cada factura y la clasifica; el equipo solo revisa las dudosas.',
    processBefore: [
      { label: 'Correo / WhatsApp' },
      { label: 'Descarga' },
      { label: 'Tecleo manual' },
      { label: 'Contabilidad' },
    ],
    processAfter: [
      { label: 'Portal' },
      { label: 'Extracción con IA' },
      { label: 'Revisión' },
      { label: 'Contabilidad' },
    ],
    metrics: [
      { value: 80, unit: '%', description: 'de facturas sin teclear' },
      { value: 25, unit: 'h/sem', description: 'ahorradas en cierre trimestral' },
      { value: 400, unit: 'clientes', description: 'usando el portal' },
    ],
    mainVideo: null,
    cardVideo: null,
    cover: '/media/proyectos/portal-clientes-asesoria/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/portal-clientes-asesoria/portal.svg',
        alt: 'Portal de cliente con documentos pendientes y plazos fiscales',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
      {
        src: '/media/proyectos/portal-clientes-asesoria/revision.svg',
        alt: 'Bandeja de revisión con datos extraídos de una factura por la IA',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'tour',
    demoUrl: null,
    demoTour: [
      {
        image: '/media/proyectos/portal-clientes-asesoria/portal.svg',
        title: 'Subida en un clic',
        text: 'El cliente arrastra sus facturas o las fotografía con el móvil.',
        hotspot: { x: 35, y: 50 },
      },
      {
        image: '/media/proyectos/portal-clientes-asesoria/revision.svg',
        title: 'La IA hace el trabajo pesado',
        text: 'Emisor, fecha, base e IVA extraídos. Solo revisas lo dudoso.',
        hotspot: { x: 65, y: 40 },
      },
    ],
    testimonialId: null,
    sectors: ['servicios'],
    solutions: ['portales-clientes'],
    technologies: ['typescript', 'react', 'cloudflare', 'llm'],
    related: ['citas-clinica-dental'],
    featured: true,
    publishedAt: iso('2026-07-22'),
    updatedAt: iso('2026-09-15'),
    seo: {
      title: 'Caso: portal de clientes con IA | Kreatya Labs',
      description:
        'Portal de clientes para una asesoría: la IA clasifica el 80 % de las facturas y ahorra 25 horas semanales en el cierre.',
    },
  },
  {
    slug: 'portal-seguimiento-envios',
    title: 'Portal de seguimiento de envíos B2B',
    clientName: null,
    confidential: true,
    companySize: 'grande',
    durationWeeks: 9,
    summary:
      'Portal con seguimiento, documentos e incidencias para los clientes de un operador logístico.',
    challenge:
      'El 40 % de las llamadas a atención al cliente eran para preguntar dónde estaba un envío.',
    solution:
      'Portal B2B con seguimiento en tiempo real, descarga de documentación y apertura de incidencias, integrado con su TMS.',
    aiRole:
      'Asistente que responde consultas sobre envíos con datos reales del TMS y escala al equipo si no puede resolver.',
    processBefore: [
      { label: 'Llamada' },
      { label: 'Consulta en TMS' },
      { label: 'Respuesta por correo' },
    ],
    processAfter: [{ label: 'Portal o asistente' }, { label: 'Respuesta inmediata' }],
    metrics: [
      { value: 58, unit: '%', description: 'menos llamadas de seguimiento', prefix: '−' },
      { value: 1200, unit: 'usuarios', description: 'activos al mes' },
    ],
    mainVideo: null,
    cardVideo: null,
    cover: '/media/proyectos/portal-seguimiento-envios/cover.svg',
    gallery: [
      {
        src: '/media/proyectos/portal-seguimiento-envios/seguimiento.svg',
        alt: 'Seguimiento de un envío con sus hitos en el mapa',
        device: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
    demoType: 'on_request',
    demoUrl: null,
    demoTour: [],
    testimonialId: null,
    sectors: ['logistica'],
    solutions: ['portales-clientes', 'integraciones'],
    technologies: ['typescript', 'react', 'nodejs', 'llm'],
    related: ['albaran-digital-transportes-levante'],
    featured: false,
    publishedAt: iso('2026-01-18'),
    updatedAt: iso('2026-04-04'),
    seo: {
      title: 'Caso: portal de seguimiento logístico | Kreatya Labs',
      description:
        'Portal B2B de seguimiento de envíos con asistente de IA: −58 % de llamadas a atención al cliente.',
    },
  },
];

export const faqs: Faq[] = [
  {
    scope: 'home',
    question: '¿Cuánto cuesta un software a medida?',
    answer:
      'Un MVP útil parte de unos 12.000 € y un sistema completo suele estar entre 25.000 y 80.000 €, según módulos e integraciones. Publicamos rangos orientativos y cerramos presupuesto por fase, sin sorpresas.',
  },
  {
    scope: 'home',
    question: '¿En cuánto tiempo tendré algo funcionando?',
    answer:
      'El primer módulo útil está en uso en 4–6 semanas. Trabajamos en sprints de dos semanas y en cada uno entregamos algo que tu equipo puede usar.',
  },
  {
    scope: 'home',
    question: '¿De quién es el código?',
    answer:
      'Tuyo. El código fuente, los datos y la documentación son propiedad del cliente desde el primer día.',
  },
  {
    scope: 'home',
    question: '¿Podéis integraros con el software que ya usamos?',
    answer:
      'Sí. Trabajamos con ERP, CRM, contabilidad y e-commerce habituales en España. Si tiene API o base de datos accesible, lo conectamos.',
  },
  {
    scope: 'home',
    question: '¿Cómo usáis la IA con nuestros datos?',
    answer:
      'Solo donde ahorra tiempo medible, con proveedores que procesan los datos en la UE y sin entrenar modelos con tu información. Cumplimos RGPD y el Reglamento europeo de IA.',
  },
  {
    scope: 'pricing',
    question: '¿El diagnóstico es realmente gratuito?',
    answer:
      'Sí. Es una sesión de 45 minutos en la que analizamos tu proceso y te damos una estimación orientativa, sin compromiso.',
  },
  {
    scope: 'pricing',
    question: '¿Qué incluye la evolución mensual?',
    answer:
      'Una bolsa de horas para mejoras, soporte y mantenimiento. Las horas no consumidas se acumulan al mes siguiente.',
  },
  {
    scope: 'pricing',
    question: '¿Hay coste por usuario?',
    answer:
      'No. El software es tuyo y no pagas licencias por usuario. Solo el alojamiento, que suele ser muy bajo.',
  },
  {
    scope: 'ai',
    question: '¿La IA sustituye a mi equipo?',
    answer:
      'No. La IA se encarga de tareas repetitivas (leer documentos, resumir, clasificar) y tu equipo revisa y decide. Es un compañero, no un sustituto.',
  },
  {
    scope: 'ai',
    question: '¿Dónde se procesan los datos?',
    answer:
      'En infraestructura europea siempre que es posible. Te informamos de cada proveedor y firmamos los acuerdos de encargo de tratamiento necesarios.',
  },
];

export const aiUseCases: AiUseCase[] = [
  {
    slug: 'facturas',
    department: 'Administración',
    title: 'Lectura automática de facturas',
    description:
      'Extrae emisor, fecha, base, IVA y conceptos de facturas en PDF o foto y los prepara para contabilidad.',
    hoursSaved: 6,
    demoKey: 'invoice',
  },
  {
    slug: 'conciliacion',
    department: 'Administración',
    title: 'Conciliación bancaria asistida',
    description:
      'Propone el emparejamiento entre movimientos bancarios y facturas; tú solo confirmas.',
    hoursSaved: 4,
  },
  {
    slug: 'resumen-llamadas',
    department: 'Comercial',
    title: 'Resumen de llamadas y reuniones',
    description:
      'Convierte la transcripción en un resumen con próximos pasos y lo guarda en el CRM.',
    hoursSaved: 3,
    demoKey: 'summary',
  },
  {
    slug: 'propuestas',
    department: 'Comercial',
    title: 'Propuestas en minutos',
    description: 'Redacta un borrador de propuesta a partir de tus notas, plantillas y tarifas.',
    hoursSaved: 4,
  },
  {
    slug: 'asistente-clientes',
    department: 'Atención al cliente',
    title: 'Asistente con tu base de conocimiento',
    description:
      'Responde dudas de clientes con tu documentación y datos reales, y deriva a una persona cuando hace falta.',
    hoursSaved: 8,
  },
  {
    slug: 'cribado',
    department: 'RR. HH.',
    title: 'Cribado y onboarding',
    description:
      'Ordena candidaturas según tus criterios y genera el plan de acogida de cada nueva incorporación.',
    hoursSaved: 3,
  },
  {
    slug: 'informes',
    department: 'Dirección',
    title: 'Informes en lenguaje natural',
    description:
      'Pregunta «¿qué clientes han bajado sus pedidos este trimestre?» y obtén la respuesta con datos.',
    hoursSaved: 2,
  },
];

export const authors: Author[] = [
  {
    slug: 'equipo-kreatya',
    name: 'Equipo Kreatya Labs',
    role: 'Arquitectura de software e IA',
    bio: 'Equipo de ingenieros y consultores de procesos especializados en software a medida e IA aplicada para pymes.',
    credentials: ['Más de 40 proyectos entregados', 'Ingeniería informática'],
    links: [siteConfig.social.linkedin],
  },
];

export const posts = [
  {
    kind: 'guia' as const,
    slug: 'cuanto-cuesta-un-software-a-medida',
    title: '¿Cuánto cuesta un software a medida en 2026?',
    excerpt: 'Rangos reales de precio, qué los encarece y cómo pedir un presupuesto comparable.',
    authorSlug: 'equipo-kreatya',
    pillar: 'software-a-medida' as const,
    solutionSlug: 'software-a-medida',
    projectSlug: 'erp-fabricacion-metal',
    publishedAt: iso('2026-09-01'),
    updatedAt: iso('2026-10-01'),
    seo: {
      title: '¿Cuánto cuesta un software a medida? (2026)',
      description:
        'Rangos de precio reales de un software a medida para pymes, qué factores lo encarecen y cómo comparar presupuestos.',
    },
    blocks: [
      answer(
        'Un software a medida para una pyme cuesta entre 12.000 € (un MVP con un módulo) y 80.000 € (un sistema completo con varias integraciones). El precio depende sobre todo del número de módulos, de las integraciones y de la complejidad de los permisos y flujos.',
      ),
      h2('Qué determina el precio'),
      list(
        'Número de módulos o pantallas principales.',
        'Integraciones con otros sistemas.',
        'Apps móviles y modo sin conexión.',
        'Uso de IA y volumen de documentos.',
        'Requisitos de seguridad y normativa.',
      ),
      h2('Cómo comparar presupuestos'),
      p(
        'Pide presupuestos cerrados por fase, con entregables concretos y propiedad del código. Desconfía de precios por hora sin límite y de presupuestos que no detallan qué incluye cada fase.',
      ),
    ],
  },
  {
    kind: 'blog' as const,
    slug: 'como-implantar-ia-en-una-pyme',
    title: 'Cómo implantar IA en una pyme sin perder el control',
    excerpt: 'Una guía práctica en cinco pasos para empezar por lo que ahorra horas de verdad.',
    authorSlug: 'equipo-kreatya',
    pillar: 'ia-para-empresas' as const,
    projectSlug: 'portal-clientes-asesoria',
    publishedAt: iso('2026-09-20'),
    updatedAt: iso('2026-09-20'),
    seo: {
      title: 'Cómo implantar IA en una pyme paso a paso',
      description:
        'Guía práctica para implantar inteligencia artificial en una pyme: casos de uso, privacidad, Reglamento de IA y medición del ahorro.',
    },
    blocks: [
      answer(
        'Para implantar IA en una pyme, empieza por una tarea repetitiva y medible (leer facturas, resumir llamadas), mide las horas que consume hoy, prueba con datos reales durante dos semanas y despliega solo si el ahorro es claro. La IA debe proponer y tu equipo, decidir.',
      ),
      h2('1. Elige una tarea, no una tecnología'),
      p(
        'El error más común es empezar por la herramienta. Empieza por la tarea que más horas consume y que sigue reglas claras.',
      ),
      h2('2. Mide antes de empezar'),
      p(
        'Sin una línea base no podrás demostrar el ahorro. Cuenta horas por semana y errores por mes.',
      ),
      h2('3. Cuida la privacidad'),
      p(
        'Elige proveedores con procesamiento en la UE, firma acuerdos de encargo y revisa qué obligaciones te aplican del Reglamento europeo de IA.',
      ),
    ],
  },
] satisfies Post[];

export const pricingTiers: PricingTier[] = [
  {
    slug: 'mvp',
    name: 'MVP',
    priceFrom: 12000,
    priceTo: 25000,
    unit: 'EUR',
    description: 'Un primer módulo en uso en 4–6 semanas para validar con tu equipo.',
    includes: [
      'Diagnóstico y plano del proceso',
      '1–2 módulos principales',
      '1 integración',
      'Formación y puesta en marcha',
    ],
  },
  {
    slug: 'sistema-completo',
    name: 'Sistema completo',
    priceFrom: 25000,
    priceTo: 80000,
    unit: 'EUR',
    description: 'ERP, CRM o plataforma completa por fases, con presupuesto cerrado por fase.',
    includes: [
      'Todo lo del MVP',
      'Varios módulos e integraciones',
      'Apps móviles si se necesitan',
      'IA aplicada a tareas clave',
    ],
  },
  {
    slug: 'evolucion',
    name: 'Evolución mensual',
    priceFrom: 900,
    priceTo: null,
    unit: 'EUR/mes',
    description: 'Bolsa de horas para mejoras, soporte y mantenimiento.',
    includes: [
      'Horas acumulables',
      'Soporte prioritario',
      'Actualizaciones de seguridad',
      'Informe mensual',
    ],
  },
];

export const contentSnapshot: ContentSnapshot = {
  generatedAt: new Date('2026-10-16T00:00:00Z').toISOString(),
  siteConfig: { ...siteConfig },
  sectors,
  solutions,
  technologies,
  projects,
  testimonials,
  faqs,
  aiUseCases,
  authors,
  posts,
  pricingTiers,
  redirects: [{ from: '/casos', to: '/proyectos', code: 301 }],
  stats: { projectsDelivered: 42, averageRating: 4.9, reviews: 31, yearsActive: 6 },
};
