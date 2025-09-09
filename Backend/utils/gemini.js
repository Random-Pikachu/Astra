const { spawn } = require("child_process");

function runGeminiPrompt(repoPath, prompt, model = "gemini-2.5-pro") {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const geminiCmd = isWin ? "gemini.cmd" : "gemini";

    // 👇 Use --apply to allow edits directly
    const args = ["-m", model, "-y"];

    const child = spawn(geminiCmd, args, {
      shell: true,
      env: process.env,
      cwd: repoPath, // run in repo folder
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

    // 👇 Pass the prompt via stdin so Gemini treats it as instructions for edits
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

exports.runGeminiPrompt = runGeminiPrompt;
