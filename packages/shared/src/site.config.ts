/**
 * Fuente única de verdad de la marca. Estos valores son los predeterminados:
 * la fila `site_config` de D1 (editable desde el panel) los sobrescribe en el build.
 */
export const siteConfig = {
  name: 'Kreatya Labs',
  legalName: 'Kreatya Labs S.L.',
  claim: 'Software que entiende tu negocio. IA que trabaja con tu equipo.',
  claimVariants: [
    'Software que entiende tu negocio. IA que trabaja con tu equipo.',
    'A medida. Desde el día uno.',
    'Tu negocio, programado.',
  ],
  description:
    'Software a medida e IA aplicada para pymes: ERP, CRM, apps y automatización. Prueba nuestras demos y calcula cuánto ahorras.',
  url: 'https://kreatya.es',
  domains: {
    web: 'kreatya.es',
    admin: 'admin.kreatya.es',
    api: 'api.kreatya.es',
    demo: 'demo.kreatya.es',
  },
  locale: 'es-ES',
  contact: {
    email: 'hola@kreatya.es',
    phone: '+34 900 000 000',
    address: {
      street: 'Calle Ejemplo 1',
      city: 'Madrid',
      postalCode: '28001',
      region: 'Comunidad de Madrid',
      country: 'ES',
    },
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/kreatya-labs',
    youtube: 'https://www.youtube.com/@kreatyalabs',
    github: 'https://github.com/kreatya-labs',
  },
  calLink: 'kreatya-labs/diagnostico',
  primaryCta: { label: 'Diagnóstico gratuito', href: '/diagnostico' },
} as const;

export type SiteConfig = typeof siteConfig;
