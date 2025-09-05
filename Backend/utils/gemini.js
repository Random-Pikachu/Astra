const { spawn } = require("child_process");

function runGeminiPrompt(prompt, model = "gemini-2.5-pro") {
  return new Promise((resolve, reject) => {
    const child = spawn("gemini", ["-m", model], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env, 
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (d) => (out += d.toString()));


    child.stderr.on("data", (d) => {
      console.error("ERR:", d.toString());
      err += d.toString();
    });

    child.on("error", (err) => {
      console.error("Spawn error:", err);
      reject(err);
    });

    child.on("close", (code) => {
       if (code !== 0) return reject(new Error(`Gemini exited ${code}: ${err}`));
        console.log("FINAL:", out.trim());
        resolve(out.trim());
    });

    // write prompt to stdin
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

runGeminiPrompt("oye how r u");
