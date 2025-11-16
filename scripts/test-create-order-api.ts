import { testSpriteClient } from '../src/lib/testsprite';

async function testCreateOrderAPI() {
  console.log('🧪 Testing Create Order API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/create_order`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  const testData = {
    customer_id: 1,
    service_type: "Washing",
    pickup_date: "2023-10-25",
    delivery_date: "2023-10-27",
    items: [
      { name: "Shirt", quantity: 2, price: 5.0 },
      { name: "Pants", quantity: 1, price: 10.0 }
    ]
  };

  try {
    console.log('🚀 Sending POST request to create_order...');
    console.log('📦 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      },
      body: JSON.stringify(testData)
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    console.log(`📄 Content-Type: ${contentType}`);

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.log(`\n❌ Non-JSON response received (Status: ${response.status}):`);
      console.log(text.substring(0, 500)); // Limit output
      if (response.status === 500) {
        console.log(`\n⚠️  Server error. Make sure the dev server is running with: npm run dev`);
      }
      process.exit(1);
    }

    const data = await response.json();
    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log(`\n✨ Test passed! Order created successfully.`);
      console.log(`   Order ID: ${data.data?.id}`);
    } else {
      console.log(`\n❌ Test failed: API returned error`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run if called directly
testCreateOrderAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testCreateOrderAPI };

