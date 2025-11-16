import { testSpriteClient } from '../src/lib/testsprite';

async function listErrors() {
  console.log('📋 Fetching errors from TestSprite...\n');

  if (!testSpriteClient.isConfigured()) {
    console.error('❌ TestSprite API key not configured!');
    console.log('Please add VITE_TESTSPRITE_API_KEY to your .env file');
    process.exit(1);
  }

  try {
    const errors = await testSpriteClient.listErrors({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
    });

    if (errors.length === 0) {
      console.log('✨ No errors found in the last 7 days!');
      return;
    }

    console.log(`Found ${errors.length} errors:\n`);
    
    errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type || 'unknown'}] ${error.message || 'No message'}`);
      console.log(`   Time: ${error.timestamp}`);
      if (error.url) {
        console.log(`   URL: ${error.url}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to fetch errors:', error);
    process.exit(1);
  }
}

listErrors().catch(console.error);

export { listErrors };

