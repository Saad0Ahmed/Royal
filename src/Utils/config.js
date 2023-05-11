const fs = require("fs");
const path = require("path");

function loadConfig() {
  const configFile = path.join(__dirname, "config.json");
  try {
    const config = JSON.parse(fs.readFileSync(configFile));
    validateConfig(config);
    return config;
  } catch (err) {
    console.error(`Failed to load config file: ${err.message}`);
    process.exit(1);
  }
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Invalid config file: config must be an object");
  }

  if (!config.token || typeof config.token !== "string") {
    throw new Error("Invalid config file: token must be a string");
  }

  if (!config.mongodb || typeof config.mongodb !== "string") {
    throw new Error("Invalid config file: mongodb must be a string");
  }

  if (!config.API_KEY || typeof config.API_KEY !== "string") {
    throw new Error("Invalid config file: API_KEY must be a string");
  }

  // Add more validations here as needed
}

module.exports = loadConfig();
