const API_KEY = "sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU";

async function testCreateServiceWithInvalidData() {
  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const url = `${testUrl}/service`;
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };

  // Providing invalid service data to trigger validation errors
  const invalidServiceData = {
    "name": "", // Invalid: empty name
    "price": -100 // Invalid: negative price
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(invalidServiceData)
    });

    console.log("Response Status Code:", response.status);
    const responseText = await response.text();
    console.log("Response Body:", responseText);

    // Check if response status code indicates failure (4xx)
    if (response.status >= 400 && response.status < 500) {
      console.log(`✅ PASSED: Got failure status code ${response.status} as expected`);
      
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
    } else {
      console.error(`❌ FAILED: Expected failure status code (4xx), but got ${response.status}`);
      process.exit(1);
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

testCreateServiceWithInvalidData();

