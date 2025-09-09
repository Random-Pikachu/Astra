const { spawn } = require("child_process");

function runGeminiPrompt(repoPath, prompt, model = "gemini-2.5-pro") {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const geminiCmd = isWin ? "gemini.cmd" : "gemini";

    const child = spawn(
      geminiCmd,
      ["-m", model, "-y", "-p", prompt],
      {
        shell: true,
        env: process.env,
        cwd: repoPath,   // 👈 change directory before running
      }
    );

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

    // child.stdin.write(prompt);
    // child.stdin.end();
  });
}

exports.runGeminiPrompt = runGeminiPrompt;
