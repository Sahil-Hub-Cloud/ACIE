require("dotenv").config();

/**
 * ACIE - AI Change Impact Engine
 * Main entry point for the Probot GitHub App
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  console.log("ACIE is running!");

  // Listen for pull_request.opened events
  app.on("pull_request.opened", async (context) => {
    const prTitle = context.payload.pull_request.title;
    console.log(`PR opened: ${prTitle}`);
  });
};
