import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { seedComponents } from './seeders/componentSeeder.js';
import { seedTemplates } from './seeders/templateSeeder.js';
import { seedChallenges } from './seeders/challengeSeeder.js';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    await connectDatabase();
    console.log('✓ Connected to MongoDB\n');

    await seedComponents();
    await seedTemplates();
    await seedChallenges();

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seed();
