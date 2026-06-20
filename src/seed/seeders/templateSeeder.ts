import type { IArchitectureTemplate } from '../../models/ArchitectureTemplate.model.js';
import * as templateRepo from '../../repositories/templateRepository.js';
import {
  buildGraph,
  createScalingStages,
  STANDARD_EDGES,
  STANDARD_PIPELINE,
} from '../helpers/templateBuilder.js';

const { nodes, edges } = buildGraph(STANDARD_PIPELINE, STANDARD_EDGES);
const scalingStages = createScalingStages(nodes, edges);

interface TemplateDef {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  trafficProfile: {
    defaultRps: number;
    peakRps: number;
    readWriteRatio: number;
    avgPayloadKb: number;
  };
}

const TEMPLATE_DEFS: TemplateDef[] = [
  {
    slug: 'twitter',
    name: 'Twitter',
    description: 'Real-time social media platform with timeline feeds, trending topics, and fan-out on write.',
    tagline: 'Timeline at scale',
    difficulty: 'advanced',
    tags: ['social', 'feed', 'real-time'],
    trafficProfile: { defaultRps: 50000, peakRps: 500000, readWriteRatio: 0.95, avgPayloadKb: 2 },
  },
  {
    slug: 'whatsapp',
    name: 'WhatsApp',
    description: 'Real-time messaging platform with end-to-end encryption and presence indicators.',
    tagline: 'Messages at global scale',
    difficulty: 'advanced',
    tags: ['messaging', 'real-time', 'mobile'],
    trafficProfile: { defaultRps: 100000, peakRps: 1000000, readWriteRatio: 0.5, avgPayloadKb: 1 },
  },
  {
    slug: 'netflix',
    name: 'Netflix',
    description: 'Video streaming platform with CDN-heavy architecture and recommendation engine.',
    tagline: 'Streaming billions of hours',
    difficulty: 'advanced',
    tags: ['streaming', 'cdn', 'recommendation'],
    trafficProfile: { defaultRps: 80000, peakRps: 800000, readWriteRatio: 0.99, avgPayloadKb: 500 },
  },
  {
    slug: 'youtube',
    name: 'YouTube',
    description: 'Video sharing platform with upload pipeline, transcoding, and global CDN delivery.',
    tagline: 'Upload, transcode, deliver',
    difficulty: 'advanced',
    tags: ['video', 'cdn', 'upload'],
    trafficProfile: { defaultRps: 100000, peakRps: 1000000, readWriteRatio: 0.98, avgPayloadKb: 800 },
  },
  {
    slug: 'instagram',
    name: 'Instagram',
    description: 'Photo and video sharing social network with feed generation and media storage.',
    tagline: 'Visual stories at scale',
    difficulty: 'intermediate',
    tags: ['social', 'media', 'feed'],
    trafficProfile: { defaultRps: 60000, peakRps: 600000, readWriteRatio: 0.9, avgPayloadKb: 50 },
  },
  {
    slug: 'uber',
    name: 'Uber',
    description: 'Ride-sharing platform with real-time location tracking and matching algorithms.',
    tagline: 'Real-time matching at scale',
    difficulty: 'advanced',
    tags: ['marketplace', 'real-time', 'geo'],
    trafficProfile: { defaultRps: 40000, peakRps: 400000, readWriteRatio: 0.6, avgPayloadKb: 3 },
  },
  {
    slug: 'url-shortener',
    name: 'URL Shortener',
    description: 'Simple URL shortening service with high read-to-write ratio and key generation.',
    tagline: 'Billions of redirects',
    difficulty: 'beginner',
    tags: ['utility', 'cache', 'simple'],
    trafficProfile: { defaultRps: 10000, peakRps: 100000, readWriteRatio: 0.99, avgPayloadKb: 0.5 },
  },
  {
    slug: 'google-drive',
    name: 'Google Drive',
    description: 'Cloud file storage and synchronization with conflict resolution and sharing.',
    tagline: 'Files everywhere',
    difficulty: 'intermediate',
    tags: ['storage', 'sync', 'collaboration'],
    trafficProfile: { defaultRps: 30000, peakRps: 300000, readWriteRatio: 0.7, avgPayloadKb: 100 },
  },
];

export async function seedTemplates(): Promise<void> {
  console.log('Seeding architecture templates...');

  for (const def of TEMPLATE_DEFS) {
    const template: Partial<IArchitectureTemplate> = {
      ...def,
      nodes,
      edges,
      scalingStages,
      isPublished: true,
    };
    await templateRepo.upsertTemplate(template);
  }

  console.log(`  ✓ ${TEMPLATE_DEFS.length} templates seeded`);
}
