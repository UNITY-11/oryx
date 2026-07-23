import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function migrate() {
  console.log('Fetching services with addons...');
  const services = await client.fetch(`*[_type == "service" && defined(addons)]`);
  
  if (services.length === 0) {
    console.log('No services to migrate.');
    return;
  }

  console.log(`Found ${services.length} services to migrate.`);
  
  const transaction = client.transaction();
  
  services.forEach(service => {
    console.log(`Migrating service: ${service.name}`);
    transaction.patch(service._id, p => p.set({ options: service.addons }).unset(['addons']));
  });

  await transaction.commit();
  console.log('Migration completed successfully!');
}

migrate().catch(console.error);
