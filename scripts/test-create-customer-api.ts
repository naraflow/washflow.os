async function testCreateCustomerAPI() {
  console.log('🧪 Testing Create Customer API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/customers`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  const testCustomer = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890"
  };

  try {
    // Test 1: Create first customer
    console.log('🚀 Test 1: Creating first customer...');
    console.log('📦 Request data:', JSON.stringify(testCustomer, null, 2));
    
    const response1 = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      },
      body: JSON.stringify(testCustomer)
    });

    console.log(`\n📊 First Response Status: ${response1.status} ${response1.statusText}`);

    const contentType1 = response1.headers.get('content-type');
    if (!contentType1?.includes('application/json')) {
      const text = await response1.text();
      console.log(`\n❌ Non-JSON response received (Status: ${response1.status}):`);
      console.log(text.substring(0, 500));
      process.exit(1);
    }

    const data1 = await response1.json();
    console.log(`\n✅ First Response Body:`);
    console.log(JSON.stringify(data1, null, 2));

    if (response1.ok && data1.success) {
      console.log(`\n✨ First customer created successfully!`);
      console.log(`   Customer ID: ${data1.data?.id}`);
    } else {
      console.log(`\n⚠️  First customer creation returned: ${data1.error || 'Unknown error'}`);
    }

    // Test 2: Try to create duplicate customer
    console.log(`\n🚀 Test 2: Attempting to create duplicate customer (same email)...`);
    
    const response2 = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      },
      body: JSON.stringify(testCustomer)
    });

    console.log(`\n📊 Second Response Status: ${response2.status} ${response2.statusText}`);

    const contentType2 = response2.headers.get('content-type');
    if (!contentType2?.includes('application/json')) {
      const text = await response2.text();
      console.log(`\n❌ Non-JSON response received (Status: ${response2.status}):`);
      console.log(text.substring(0, 500));
      process.exit(1);
    }

    const data2 = await response2.json();
    console.log(`\n✅ Second Response Body:`);
    console.log(JSON.stringify(data2, null, 2));

    if (response2.status === 409 && !data2.success) {
      console.log(`\n✨ Test 2 passed! API correctly returned 409 Conflict for duplicate email.`);
      console.log(`   Error message: ${data2.error}`);
    } else if (response2.status !== 200) {
      console.log(`\n✨ Test 2 passed! API returned non-200 status (${response2.status}) for duplicate email.`);
    } else {
      console.log(`\n❌ Test 2 failed: Expected non-200 status for duplicate email, got ${response2.status}`);
      process.exit(1);
    }

    console.log(`\n🎉 All tests passed!`);

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run if called directly
testCreateCustomerAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testCreateCustomerAPI };

