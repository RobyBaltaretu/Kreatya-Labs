import type { Block } from './blocks';
import type { CompanySize, DemoType, Device, FaqScope, SolutionKind } from './enums';
import type { Metric, Seo } from './schemas';

/**
 * Instantánea de contenido publicada que consume la web en build.
 * La genera la API (`GET /internal/snapshot`) a partir de D1, o el seed en local.
 */
export interface Sector {
  slug: string;
  name: string;
  tagline: string;
  pain: string;
  modules: string[];
  integrations: string[];
  blocks: Block[];
  seo: Seo;
}

export interface Solution {
  slug: string;
  name: string;
  kind: SolutionKind;
  tagline: string;
  modules: string[];
  integrations: string[];
  blocks: Block[];
  seo: Seo;
}

export interface Technology {
  slug: string;
  name: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  device: Device;
  width: number;
  height: number;
}

export interface ProcessStep {
  label: string;
  detail?: string;
}

export interface Project {
  slug: string;
  title: string;
  clientName: string | null;
  confidential: boolean;
  companySize: CompanySize;
  durationWeeks: number;
  summary: string;
  challenge: string;
  solution: string;
  aiRole: string | null;
  processBefore: ProcessStep[];
  processAfter: ProcessStep[];
  metrics: Metric[];
  mainVideo: {
    provider: 'youtube' | 'r2';
    ref: string;
    poster: string;
    durationSeconds: number;
    transcript?: string;
  } | null;
  cardVideo: string | null;
  cover: string;
  gallery: GalleryItem[];
  demoType: DemoType;
  demoUrl: string | null;
  demoTour: { image: string; title: string; text: string; hotspot: { x: number; y: number } }[];
  testimonialId: string | null;
  sectors: string[];
  solutions: string[];
  technologies: string[];
  related: string[];
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  seo: Seo;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  videoUrl?: string;
  poster?: string;
}

export interface Faq {
  question: string;
  answer: string;
  scope: FaqScope;
  scopeSlug?: string;
}

export interface AiUseCase {
  slug: string;
  department: string;
  title: string;
  description: string;
  hoursSaved: number;
  demoKey?: string;
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  avatar?: string;
  links: string[];
}

export interface Post {
  kind: 'blog' | 'guia';
  slug: string;
  title: string;
  excerpt: string;
  blocks: Block[];
  authorSlug: string;
  pillar: 'software-a-medida' | 'ia-para-empresas' | 'software-por-sector';
  solutionSlug?: string;
  sectorSlug?: string;
  projectSlug?: string;
  publishedAt: string;
  updatedAt: string;
  seo: Seo;
}

export interface PricingTier {
  slug: string;
  name: string;
  priceFrom: number;
  priceTo: number | null;
  unit: string;
  description: string;
  includes: string[];
}

export interface Redirect {
  from: string;
  to: string;
  code: 301 | 410;
}

export interface ContentSnapshot {
  generatedAt: string;
  siteConfig: Record<string, unknown>;
  sectors: Sector[];
  solutions: Solution[];
  technologies: Technology[];
  projects: Project[];
  testimonials: Testimonial[];
  faqs: Faq[];
  aiUseCases: AiUseCase[];
  authors: Author[];
  posts: Post[];
  pricingTiers: PricingTier[];
  redirects: Redirect[];
  stats: { projectsDelivered: number; averageRating: number; reviews: number; yearsActive: number };
}
