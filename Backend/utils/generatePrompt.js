const axios = require("axios");

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

  const data = await response.data;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion generated";
}

module.exports = { generateFixPrompt };