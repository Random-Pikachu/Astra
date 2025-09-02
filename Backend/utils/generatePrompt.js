import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateFixPrompt(vulnerabilities) {
  const prompt = `
You are given the following vulnerabilities from OSV:

${JSON.stringify(vulnerabilities, null, 2)}

Generate a detailed and actionable prompt that can be used with the Gemini CLI
to automatically fix these issues in the codebase. 
Make sure to include:
- Which dependencies should be updated.
- Example commands or code changes.
- Safety checks before applying.
`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion generated";
}

// // Example usage
// (async () => {
//   const vulnerabilities = [
//     { name: "lodash", version: "4.17.20", issue: "Prototype pollution CVE-2021-23337" }
//   ];
//   const fixPrompt = await generateFixPrompt(vulnerabilities);
//   console.log("Generated Prompt:\n", fixPrompt);
// })();

module.exports = { generateFixPrompt };