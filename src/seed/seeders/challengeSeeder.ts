import type { IChallenge } from '../../models/Challenge.model.js';
import * as challengeRepo from '../../repositories/challengeRepository.js';

const CHALLENGES: Partial<IChallenge>[] = [
  {
    slug: 'design-instagram',
    title: 'Design Instagram',
    description: 'Design a photo and video sharing platform like Instagram supporting feeds, stories, and media uploads.',
    difficulty: 'senior',
    requirements: [
      { id: 'r1', text: 'Users can upload photos and videos', priority: 'must' },
      { id: 'r2', text: 'Users can follow others and see a personalized feed', priority: 'must' },
      { id: 'r3', text: 'Support 500M daily active users', priority: 'must' },
      { id: 'r4', text: 'Low latency feed loading (< 200ms)', priority: 'should' },
    ],
    traffic: { dailyActiveUsers: '500M', requestsPerSecond: '100K', readWriteRatio: '90:10', peakMultiplier: 3 },
    scale: { storageEstimate: '100+ PB media', growthRate: '20% YoY', geographicScope: 'Global' },
    constraints: ['Must handle viral posts', 'Media-heavy workload', 'Mobile-first'],
    requiredComponents: [
      { componentSlug: 'load-balancer', weight: 12, reason: 'Required for horizontal scaling' },
      { componentSlug: 'application-server', weight: 12, reason: 'Core business logic processing' },
      { componentSlug: 'redis', weight: 12, reason: 'Cache feed data and sessions' },
      { componentSlug: 'database', weight: 12, reason: 'Persistent user and metadata storage' },
      { componentSlug: 'cdn', weight: 12, reason: 'Required for media delivery at scale' },
      { componentSlug: 'object-storage', weight: 12, reason: 'Required for photo/video storage' },
      { componentSlug: 'queue', weight: 8, reason: 'Async feed fan-out and notifications' },
    ],
    optionalComponents: [
      { componentSlug: 'search-service', weight: 5, reason: 'User and hashtag search' },
      { componentSlug: 'notification-service', weight: 5, reason: 'Push notifications for engagement' },
      { componentSlug: 'read-replica', weight: 5, reason: 'Offload read-heavy feed queries' },
      { componentSlug: 'kafka', weight: 5, reason: 'Event streaming for analytics pipeline' },
    ],
    antiPatterns: [
      { id: 'ap1', description: 'Single database without cache at scale', penalty: 10, detect: { type: 'missing_with_scale', condition: { componentSlug: 'redis' } } },
      { id: 'ap2', description: 'Single load balancer SPOF', penalty: 5, detect: { type: 'single_point_of_failure', condition: { componentSlug: 'load-balancer' } } },
    ],
    starterNodes: [
      { id: 'user', type: 'userNode', position: { x: 0, y: 200 }, data: { componentId: 'user', label: 'User' } },
    ],
    starterEdges: [],
    maxScore: 100,
    timeLimitMinutes: 45,
    isPublished: true,
  },
  {
    slug: 'design-whatsapp',
    title: 'Design WhatsApp',
    description: 'Design a real-time messaging platform supporting 1:1 and group chats with delivery receipts.',
    difficulty: 'senior',
    requirements: [
      { id: 'r1', text: 'Real-time message delivery', priority: 'must' },
      { id: 'r2', text: 'Support group chats up to 256 members', priority: 'must' },
      { id: 'r3', text: '2B+ users globally', priority: 'must' },
      { id: 'r4', text: 'End-to-end encryption', priority: 'should' },
    ],
    traffic: { dailyActiveUsers: '2B', requestsPerSecond: '500K', readWriteRatio: '50:50', peakMultiplier: 2 },
    scale: { storageEstimate: '10+ PB messages', growthRate: '15% YoY', geographicScope: 'Global' },
    constraints: ['Low latency (< 100ms)', 'Offline message delivery', 'Mobile-first'],
    requiredComponents: [
      { componentSlug: 'load-balancer', weight: 12, reason: 'Distribute WebSocket connections' },
      { componentSlug: 'application-server', weight: 12, reason: 'Message routing and delivery' },
      { componentSlug: 'database', weight: 12, reason: 'Message persistence' },
      { componentSlug: 'redis', weight: 12, reason: 'Online presence and session state' },
      { componentSlug: 'queue', weight: 10, reason: 'Offline message queue' },
      { componentSlug: 'notification-service', weight: 10, reason: 'Push notifications for offline users' },
    ],
    optionalComponents: [
      { componentSlug: 'kafka', weight: 5, reason: 'Message event streaming' },
      { componentSlug: 'object-storage', weight: 5, reason: 'Media message storage' },
      { componentSlug: 'cdn', weight: 5, reason: 'Media delivery optimization' },
    ],
    antiPatterns: [
      { id: 'ap1', description: 'No message queue for offline delivery', penalty: 10, detect: { type: 'missing_with_scale', condition: { componentSlug: 'queue' } } },
    ],
    starterNodes: [
      { id: 'user', type: 'userNode', position: { x: 0, y: 200 }, data: { componentId: 'user', label: 'User' } },
    ],
    starterEdges: [],
    maxScore: 100,
    timeLimitMinutes: 45,
    isPublished: true,
  },
  {
    slug: 'design-youtube',
    title: 'Design YouTube',
    description: 'Design a video sharing platform supporting uploads, transcoding, and global streaming.',
    difficulty: 'staff',
    requirements: [
      { id: 'r1', text: 'Upload and stream videos globally', priority: 'must' },
      { id: 'r2', text: 'Support 2B+ logged-in users', priority: 'must' },
      { id: 'r3', text: '500 hours of video uploaded per minute', priority: 'must' },
    ],
    traffic: { dailyActiveUsers: '2B', requestsPerSecond: '200K', readWriteRatio: '95:5', peakMultiplier: 4 },
    scale: { storageEstimate: '500+ PB video', growthRate: '30% YoY', geographicScope: 'Global' },
    constraints: ['Video transcoding pipeline', 'Adaptive bitrate streaming'],
    requiredComponents: [
      { componentSlug: 'cdn', weight: 15, reason: 'Critical for video delivery' },
      { componentSlug: 'object-storage', weight: 15, reason: 'Store raw and transcoded video' },
      { componentSlug: 'load-balancer', weight: 10, reason: 'Scale upload and API servers' },
      { componentSlug: 'application-server', weight: 10, reason: 'Upload and metadata processing' },
      { componentSlug: 'database', weight: 10, reason: 'Video metadata and user data' },
      { componentSlug: 'queue', weight: 10, reason: 'Async transcoding pipeline' },
      { componentSlug: 'search-service', weight: 10, reason: 'Video search and discovery' },
    ],
    optionalComponents: [
      { componentSlug: 'redis', weight: 5, reason: 'Cache popular video metadata' },
      { componentSlug: 'kafka', weight: 5, reason: 'View count and analytics events' },
      { componentSlug: 'read-replica', weight: 5, reason: 'Offload metadata reads' },
    ],
    antiPatterns: [],
    starterNodes: [
      { id: 'user', type: 'userNode', position: { x: 0, y: 200 }, data: { componentId: 'user', label: 'User' } },
    ],
    starterEdges: [],
    maxScore: 100,
    timeLimitMinutes: 60,
    isPublished: true,
  },
  {
    slug: 'design-uber',
    title: 'Design Uber',
    description: 'Design a ride-sharing platform with real-time matching, pricing, and location tracking.',
    difficulty: 'senior',
    requirements: [
      { id: 'r1', text: 'Match riders with nearby drivers in real-time', priority: 'must' },
      { id: 'r2', text: 'Track driver location every few seconds', priority: 'must' },
      { id: 'r3', text: 'Handle surge pricing during peak demand', priority: 'should' },
    ],
    traffic: { dailyActiveUsers: '100M', requestsPerSecond: '50K', readWriteRatio: '60:40', peakMultiplier: 5 },
    scale: { storageEstimate: '10 TB trip data/day', growthRate: '25% YoY', geographicScope: '700+ cities' },
    constraints: ['Sub-second matching', 'Geo-spatial queries', 'Payment processing'],
    requiredComponents: [
      { componentSlug: 'load-balancer', weight: 12, reason: 'Handle concurrent ride requests' },
      { componentSlug: 'application-server', weight: 12, reason: 'Matching algorithm and trip logic' },
      { componentSlug: 'database', weight: 12, reason: 'Trip and user data persistence' },
      { componentSlug: 'redis', weight: 12, reason: 'Real-time driver location cache' },
      { componentSlug: 'queue', weight: 10, reason: 'Async trip events and notifications' },
      { componentSlug: 'notification-service', weight: 10, reason: 'Driver/rider notifications' },
    ],
    optionalComponents: [
      { componentSlug: 'kafka', weight: 5, reason: 'Trip event streaming for analytics' },
      { componentSlug: 'search-service', weight: 5, reason: 'Geo-spatial driver search' },
      { componentSlug: 'api-gateway', weight: 5, reason: 'Rate limiting and auth' },
    ],
    antiPatterns: [
      { id: 'ap1', description: 'No cache for real-time location data', penalty: 10, detect: { type: 'missing_with_scale', condition: { componentSlug: 'redis' } } },
    ],
    starterNodes: [
      { id: 'user', type: 'userNode', position: { x: 0, y: 200 }, data: { componentId: 'user', label: 'Rider' } },
      { id: 'driver', type: 'userNode', position: { x: 0, y: 350 }, data: { componentId: 'user', label: 'Driver' } },
    ],
    starterEdges: [],
    maxScore: 100,
    timeLimitMinutes: 45,
    isPublished: true,
  },
  {
    slug: 'design-twitter',
    title: 'Design Twitter',
    description: 'Design a social media platform with real-time feeds, trending topics, and fan-out on write.',
    difficulty: 'staff',
    requirements: [
      { id: 'r1', text: 'Post and read tweets in real-time', priority: 'must' },
      { id: 'r2', text: 'Trending topics detection', priority: 'should' },
      { id: 'r3', text: '400M daily active users', priority: 'must' },
    ],
    traffic: { dailyActiveUsers: '400M', requestsPerSecond: '150K', readWriteRatio: '95:5', peakMultiplier: 3 },
    scale: { storageEstimate: '1+ PB tweet data', growthRate: '10% YoY', geographicScope: 'Global' },
    constraints: ['Celebrity user problem (millions of followers)', 'Real-time timeline'],
    requiredComponents: [
      { componentSlug: 'load-balancer', weight: 10, reason: 'Scale API servers' },
      { componentSlug: 'application-server', weight: 10, reason: 'Tweet creation and timeline generation' },
      { componentSlug: 'redis', weight: 12, reason: 'Timeline cache (fan-out on write)' },
      { componentSlug: 'database', weight: 10, reason: 'Tweet and user persistence' },
      { componentSlug: 'queue', weight: 10, reason: 'Async fan-out for celebrity users' },
      { componentSlug: 'search-service', weight: 10, reason: 'Tweet and user search' },
      { componentSlug: 'cdn', weight: 8, reason: 'Media attachment delivery' },
    ],
    optionalComponents: [
      { componentSlug: 'kafka', weight: 5, reason: 'Trending topic event pipeline' },
      { componentSlug: 'read-replica', weight: 5, reason: 'Offload timeline reads' },
      { componentSlug: 'notification-service', weight: 5, reason: 'Mention and follow notifications' },
      { componentSlug: 'object-storage', weight: 5, reason: 'Media storage' },
    ],
    antiPatterns: [
      { id: 'ap1', description: 'No cache for timeline reads', penalty: 15, detect: { type: 'missing_with_scale', condition: { componentSlug: 'redis' } } },
    ],
    starterNodes: [
      { id: 'user', type: 'userNode', position: { x: 0, y: 200 }, data: { componentId: 'user', label: 'User' } },
    ],
    starterEdges: [],
    maxScore: 100,
    timeLimitMinutes: 45,
    isPublished: true,
  },
];

export async function seedChallenges(): Promise<void> {
  console.log('Seeding challenges...');
  for (const challenge of CHALLENGES) {
    await challengeRepo.upsertChallenge(challenge);
  }
  console.log(`  ✓ ${CHALLENGES.length} challenges seeded`);
}
