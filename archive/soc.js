export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head><title>ACIE — SOC Command</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#010409] text-white p-12"><h1 class="text-4xl font-black mb-4">Security Operations Center (SOC)</h1><p class="text-gray-500">System initialization in progress...</p><br><a href="/dashboard" class="text-indigo-400 font-bold">← Back to Dashboard</a></body></html>`);
}
