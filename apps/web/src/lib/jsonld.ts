import type { Faq, Post, PricingTier, Project, Testimonial } from '@kreatya/shared';
import { siteConfig } from '@kreatya/shared/site.config';

const abs = (path: string) => new URL(path, siteConfig.url).toString();
const orgId = `${siteConfig.url}/#organization`;

export function organization() {
  const { address } = siteConfig.contact;
  return [
    {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'ProfessionalService'],
      '@id': orgId,
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.url,
      logo: abs('/favicon.svg'),
      description: siteConfig.description,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.street,
        addressLocality: address.city,
        postalCode: address.postalCode,
        addressRegion: address.region,
        addressCountry: address.country,
      },
      areaServed: 'ES',
      sameAs: Object.values(siteConfig.social),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: 'es-ES',
      publisher: { '@id': orgId },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/proyectos?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.href),
  })),
});

export const faqPage = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

export const service = (name: string, description: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url: abs(path),
  provider: { '@id': orgId },
  areaServed: 'ES',
});

export function projectSchema(p: Project, client: string, testimonial?: Testimonial) {
  const out: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: p.title,
      headline: p.title,
      abstract: p.summary,
      url: abs(`/proyectos/${p.slug}`),
      image: p.gallery.map((g) => ({
        '@type': 'ImageObject',
        contentUrl: abs(g.src),
        caption: g.alt,
        width: g.width,
        height: g.height,
      })),
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      creator: { '@id': orgId },
      about: client,
      ...(testimonial
        ? {
            review: {
              '@type': 'Review',
              reviewBody: testimonial.quote,
              author: { '@type': 'Person', name: testimonial.name, jobTitle: testimonial.role },
              reviewRating: { '@type': 'Rating', ratingValue: testimonial.rating, bestRating: 5 },
            },
          }
        : {}),
    },
  ];
  if (p.mainVideo) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `Recorrido: ${p.title}`,
      description: p.mainVideo.transcript ?? p.summary,
      thumbnailUrl: abs(p.mainVideo.poster),
      uploadDate: p.publishedAt,
      duration: `PT${Math.floor(p.mainVideo.durationSeconds / 60)}M${p.mainVideo.durationSeconds % 60}S`,
      ...(p.mainVideo.provider === 'youtube'
        ? { embedUrl: `https://www.youtube-nocookie.com/embed/${p.mainVideo.ref}` }
        : { contentUrl: abs(p.mainVideo.ref) }),
    });
  }
  return out;
}

export const blogPosting = (post: Post, author: { name: string; role: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  url: abs(`/${post.kind === 'guia' ? 'guias' : 'blog'}/${post.slug}`),
  inLanguage: 'es-ES',
  author: { '@type': 'Person', name: author.name, jobTitle: author.role },
  publisher: { '@id': orgId },
});

export const offers = (tiers: PricingTier[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Desarrollo de software a medida',
  provider: { '@id': orgId },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: Math.min(...tiers.map((t) => t.priceFrom)),
    highPrice: Math.max(...tiers.map((t) => t.priceTo ?? t.priceFrom)),
    offerCount: tiers.length,
    offers: tiers.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      description: t.description,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        minPrice: t.priceFrom,
        ...(t.priceTo ? { maxPrice: t.priceTo } : {}),
      },
    })),
  },
});
