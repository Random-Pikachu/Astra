const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateFixPrompt(vulnerabilities) {
  const prompt = `
You are given the following vulnerabilities from OSV:

${JSON.stringify(vulnerabilities, null, 2)}

Generate a **Gemini CLI prompt** that will:
1. Identify which dependencies are vulnerable and update them to safe versions.
2. Search through the codebase for any usages of the vulnerable libraries ...
3. Directly modify all source files in the repository to replace unsafe or deprecated usages 
  (e.g., replace allowPrototypes: true with lainObjects: true, add safe depth limits, 
  secure options for tar extraction, safe lodash merge, etc.).
  The changes must be applied automatically to the actual source code files, 
  not just suggested in text.
4. Provide example \`gemini\` CLI commands to perform upgrades and code refactoring.
5. Include **safety checks before applying fixes**, such as:
   - Performing manual verification after fixes.
6. Keep the entire generated prompt **clear, actionable, and within 700 words**.

The output should be a developer-friendly prompt that can be copy-pasted into Gemini CLI to **both upgrade dependencies and refactor unsafe code** automatically.
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const data = response.data;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion generated";
}

module.exports = { generateFixPrompt };
