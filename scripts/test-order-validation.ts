const API_KEY = "sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU";

async function testOrderSubmissionValidation() {
  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const url = `${testUrl}/orders`;
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };

  // Providing an invalid order submission to trigger validation errors
  const invalidOrderData = {
    "customer_id": "",
    "service_id": "",
    "pickup_date": "invalid-date-format",
    "items": []
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(invalidOrderData)
    });

    console.log("Response Status Code:", response.status);
    const responseText = await response.text();
    console.log("Response Body:", responseText);

    // Check if response status code indicates an error
    if (response.status === 200) {
      console.error("❌ FAILED: Expected an error status code, but got 200");
      process.exit(1);
    } else {
      console.log(`✅ PASSED: Got error status code ${response.status} as expected`);
      
      // Try to parse JSON
      try {
        const json = JSON.parse(responseText);
        console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        
        if (json.errors && Array.isArray(json.errors)) {
          console.log(`✅ Found ${json.errors.length} validation error(s):`);
          json.errors.forEach((error: string, index: number) => {
            console.log(`  ${index + 1}. ${error}`);
          });
        }
      } catch (e) {
        console.log("Response is not JSON");
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
    console.error("\n⚠️  Make sure the dev server is running with: npm run dev");
    process.exit(1);
  }
}

testOrderSubmissionValidation();

