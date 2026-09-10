const { initializeApp, cert } = require("firebase-admin/app");
const fs = require("fs");
const path = require("path");

let serviceAccount;

// Check if credentials are provided via Environment Variable (for Coolify/Production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable.");
  }
} 
// Fallback to local file for development
else {
  const localKeyPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(localKeyPath)) {
    serviceAccount = require(localKeyPath);
  } else {
    console.warn("⚠️ Firebase serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var is missing! Push notifications will fail.");
  }
}

let app;
if (serviceAccount) {
  app = initializeApp({
    credential: cert(serviceAccount)
  });
}

module.exports = app;
