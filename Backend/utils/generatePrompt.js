const axios = require("axios");
const { generateRandomCode } = require("../utils/randomCode");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateFixPrompt(vulnerabilities) {
  const tempuuid = generateRandomCode({
    prefix: "fix-",
    length: 5,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSpecial: false,
  });

  const prompt = `You are given the following vulnerabilities from OSV:
${JSON.stringify(vulnerabilities, null, 2)}

**IMPORTANT: Each vulnerability object contains a 'locations' array showing exactly which files import the vulnerable dependency. Focus your analysis and fixes ONLY on these specific files.**

Generate a **comprehensive Gemini CLI prompt** that will:

**BRANCH MANAGEMENT:**
1. Create a new branch called "securityFixes/${tempuuid}-$(packageName)" from the main/master branch
2. Switch to this new branch for all security updates
3. DO NOT make any changes to the main/master branch directly

**DEPENDENCY UPGRADES (MANDATORY):**
4. Scan package.json, requirements.txt, Cargo.toml, go.mod, or other dependency files
5. **FORCE UPDATE** all vulnerable dependencies to their latest secure versions using:
   - \`npm install <package-name>@latest\`
   - \`pip install --upgrade <package-name>\`
   - \`cargo update <package-name>\`
   - Or equivalent commands for the detected package manager
6. Verify that the upgrades actually happened by checking version numbers in lock files

**CODE REFACTORING:**
7. For each vulnerability, use the 'locations' array to identify the exact files that import the vulnerable dependency
8. DO NOT search the entire codebase - only examine and modify the files listed in the locations array
9. For each file in the locations array:
   - Open and analyze the specific file
   - Look for imports/requires of the vulnerable dependency (e.g., dependencyName: "handlebars")
   - Identify how the dependency is used in that file
   - Apply security fixes specific to that dependency and usage pattern:
     * Replace allowPrototypes: true with plainObjects: true
     * Add safe depth limits for recursive operations
     * Implement secure options for tar extraction
     * Use safe lodash merge alternatives
     * Fix prototype pollution vulnerabilities
     * Apply other security-specific code changes
10. The changes MUST be applied automatically to actual source code files, not just suggested

**VALIDATION & SAFETY:**
11. Run security scans after upgrades to verify vulnerabilities are resolved
12. Run existing tests to ensure functionality isn't broken
13. Create a commit with message: "Security fixes: Updated vulnerable dependencies and code"
14. Provide a summary of all changes made

**EXAMPLE WORKFLOW:**
For a vulnerability like:
- dependencyName: "handlebars", dependencyVersion: "4.7.6"
- locations: ["/path/to/index.js"]
- ecosystem: "npm"

The prompt should generate commands like:
1. \`git checkout -b securityFixes/$(date +%Y%m%d)-$(git branch --show-current)\`
2. \`npm install handlebars@latest\`
3. Open and modify /path/to/index.js to fix handlebars usage patterns
4. \`npm test\` to verify functionality
5. \`git add . && git commit -m "Security fixes: Updated vulnerable dependencies and code"\`

**OUTPUT REQUIREMENTS:**
- Generate specific, executable commands for the detected package manager
- Include exact version numbers for upgrades where possible
- Keep the prompt actionable and under 800 words
- Ensure ALL vulnerable packages are addressed, not just some

The output should be a complete, copy-pasteable prompt for Gemini CLI that guarantees dependency upgrades happen and code is safely refactored on a new branch.`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = response.data;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion generated";
}

module.exports = { generateFixPrompt };
