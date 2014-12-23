/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,

  office365ClientId: process.env.OUTLOOK_API_ID,
  office365ClientSecret: process.env.OUTLOOK_API_SECRET,

  providerUrl: process.env.PROVIDER_URL,

  appId: process.env.ANYFETCH_API_ID,
  appSecret: process.env.ANYFETCH_API_SECRET,

  testRefreshToken: process.env.OUTLOOK_TEST_REFRESH_TOKEN,

  opbeat: {
    organization_id: process.env.OPBEAT_ORGANIZATION_ID,
    app_id: process.env.OPBEAT_APP_ID,
    secret_token: process.env.OPBEAT_SECRET_TOKEN,
    silent: true
  }
};
