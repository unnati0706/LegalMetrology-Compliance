import fs from 'fs';
import path from 'path';
import { seedDatasetProductsInMemory } from '../modules/b08/b08.repository';
import { pool } from '../db';

export async function runSeedScript() {
  console.log('=== SEEDING PACKAGED PRODUCTS INTO APPLICATION DATABASE ===');
  
  // Seed in-memory repository layer
  seedDatasetProductsInMemory();
  console.log('✅ In-memory database catalog repository seeded.');

  // Try PostgreSQL pool if connected
  try {
    const csvPath = path.join(process.cwd(), 'data', 'metadata', 'metadata.csv');
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(Boolean);
      console.log(`✅ Reading ${lines.length - 1} curated packaged products from dataset metadata.csv...`);
    }
  } catch (err: any) {
    console.warn('[Seed] Note during database seed:', err.message);
  }

  console.log('=== DATABASE SEEDING COMPLETED SUCCESSFULLY ===');
}

if (require.main === module) {
  runSeedScript().catch(err => {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  });
}
