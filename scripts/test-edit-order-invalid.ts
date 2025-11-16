const API_KEY = "sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU";

async function testInvalidOrderEdit() {
  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const url = `${testUrl}/orders/edit`;
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };

  // Providing invalid order ID to trigger error response
  const payload = {
    "order_id": "invalid_order_id", // Invalid order ID
    "status": "completed"
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log("Response Status Code:", response.status);
    const responseText = await response.text();
    console.log("Response Body:", responseText);

    // Check if response status code indicates an error (not 200)
    if (response.status !== 200) {
      console.log(`✅ PASSED: Got error status code ${response.status} as expected`);
      
      // Try to parse JSON
      try {
        const json = JSON.parse(responseText);
        console.log("Parsed JSON:", JSON.stringify(json, null, 2));
        
        if (json.error) {
          console.log(`✅ Error message: ${json.error}`);
        }
        if (json.message) {
          console.log(`✅ Message: ${json.message}`);
        }
      } catch (e) {
        console.log("Response is not JSON");
      }
    } else {
      console.error(`❌ FAILED: Expected an error response, but got status code: ${response.status}`);
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

testInvalidOrderEdit();

