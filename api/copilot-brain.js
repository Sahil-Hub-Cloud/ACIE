import axios from 'axios';

export default async function handler(req, res) {
  const { q } = req.query;
  const query = q ? q.toLowerCase() : "";
  
  // Internal fetch to the telemetry layer to keep JSONBin keys isolated
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const telemetryUrl = `${protocol}://${host}/api/telemetry`;

  try {
    const telemetryRes = await axios.get(telemetryUrl);
    const records = telemetryRes.data.records || [];
    const latest = records[0];

    if (!latest) {
      return res.status(200).json({
        steps: ["Searching telemetry logs..."],
        finalAnswer: "No telemetry records available. Please open a Pull Request to initialize analysis."
      });
    }

    let response = {
      steps: ["Connecting to neural mesh...", "Searching telemetry logs...", "Analyzing PR context..."],
      finalAnswer: "I have analyzed the current repository state. Systems appear to be within nominal parameters."
    };

    // INTEL 1: Failure Investigation
    if (query.includes("fail") || query.includes("deploy") || query.includes("error")) {
      response.steps.push("Isolating failure vectors...", "Comparing branch states...");
      const severity = latest.severity || "UNKNOWN";
      const cause = latest.rootCause || "No specific breaking change detected";
      const fix = latest.suggestedFix || "Standard code review required";
      
      response.finalAnswer = `<b>Analysis Result:</b> Severity is <b>${severity}</b>. The primary root cause identified is: <u>${cause}</u>. <br/><br/><b>Recommendation:</b> ${fix}.`;
    } 
    // INTEL 2: Impact Assessment
    else if (query.includes("impact") || query.includes("break") || query.includes("blast")) {
      response.steps.push("Mapping dependency propagation...", "Calculating blast radius...");
      const systems = (latest.impactedSystems && latest.impactedSystems.length > 0) ? latest.impactedSystems.join(", ") : "General Systems";
      const risk = latest.dependencyRisk || "LOW";
      const count = latest.dependencyCount || 0;

      response.finalAnswer = `<b>Impact Report:</b> This change propagates to <b>${systems}</b>. Architectural risk is <b>${risk}</b> with <b>${count}</b> downstream file dependencies affected.`;
    }
    // INTEL 3: Prioritization
    else if (query.includes("fix") || query.includes("first") || query.includes("priority")) {
      response.steps.push("Evaluating risk weights...", "Generating action plan...");
      
      let p1 = latest.rootCause !== "None Detected" ? `Restore logic related to: ${latest.rootCause}` : "General security audit";
      let p2 = latest.severity === "CRITICAL" ? "Redact potential hardcoded secrets" : "Verify test coverage for impacted files";
      let p3 = `Refactor downstream dependencies (${latest.dependencyCount || 0} files)`;

      response.finalAnswer = `<b>Executive Action Plan:</b><br/>1. <b>Priority 1:</b> ${p1}<br/>2. <b>Priority 2:</b> ${p2}<br/>3. <b>Priority 3:</b> ${p3}`;
    }

    return res.status(200).json(response);
  } catch (err) {
    return res.status(200).json({
      steps: ["Establishing connection..."],
      finalAnswer: "ACIE telemetry currently unavailable. Please verify API status."
    });
  }
}
