/**
 * ACIE - GitHub Webhook Handler
 * Vercel Serverless Function — receives GitHub App webhook events
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Read headers sent by GitHub
  const githubEvent = req.headers["x-github-event"] || "unknown";
  const deliveryId = req.headers["x-github-delivery"] || "unknown";
  const signature = req.headers["x-hub-signature-256"] || "";

  console.log("Webhook received");
  console.log(`Event: ${githubEvent}`);
  console.log(`Delivery ID: ${deliveryId}`);
  console.log(`Signature present: ${signature ? "yes" : "no"}`);

  // Log the raw body payload
  const body = req.body;
  if (body) {
    console.log("Payload:", JSON.stringify(body, null, 2));
  }

  return res.status(200).json({ status: "ok" });
}
