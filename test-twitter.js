const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

// Initialize Twitter API client with Bearer Token (OAuth2.0)
const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);  // Use Bearer Token for API v2

// Function to check if the API is working
async function checkTwitterAuth() {
  try {
    // Fetch the authenticated user's details using API v2
    const user = await client.v2.me();  
    console.log("✅ Twitter API is working! Logged in as:", user.data);
  } catch (error) {
    console.error("❌ Twitter API authentication failed.");
    if (error.response) {
      // If the error has a response, log the status code and error details
      console.error("Status Code:", error.response.status);
      console.error("Error Message:", error.response.data?.detail || error.response.statusText);
    } else {
      // If there's no response (network issues or something else), log it
      console.error("Error Message:", error.message);
      console.error("Stack Trace:", error.stack);
    }

    // Additional check for specific 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.error("🔑 The Bearer Token might be incorrect or missing.");
    }
  }
}

// Run the test
checkTwitterAuth();
