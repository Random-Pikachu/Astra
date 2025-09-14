const { spawn } = require("child_process");
const { extractEvents } = require('./progressParser');

function runGeminiPrompt(repoPath, prompt, opts = {}) {
  const { io, channelId = 'fix', model: modelOverride } = opts;
  const model = modelOverride || "gemini-2.5-flash";
  const emit = (type, message, meta) => {
    try {
      if (io) {
        io.to(channelId).emit('fix-progress', {
          channelId,
          type,           // 'start' | 'info' | 'command' | 'error' | 'complete'
          message,
          meta: meta || null,
          ts: Date.now(),
        });
      }
    } catch (_) {}
  };
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const geminiCmd = isWin ? "gemini.cmd" : "gemini";

    // 👇 Use --apply to allow edits directly
    const args = ["-m", model, "-y"];

    emit('start', `Starting fixes in ${repoPath}`);

    const child = spawn(geminiCmd, args, {
      shell: true,
      env: process.env,
      cwd: repoPath, // run in repo folder
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (d) => {
      const text = d.toString();
      out += text;
      const events = extractEvents(text);
      events.forEach((evt) => emit(evt.type, evt.message, evt.meta));
    });
    child.stderr.on("data", (d) => {
      const text = d.toString();
      err += text;
      const events = extractEvents(text);
      if (events.length > 0) {
        events.forEach((evt) => emit(evt.type, evt.message, evt.meta));
      } else {
        text.split(/\r?\n/).forEach((line) => {
          const msg = line.trim();
          if (msg) emit('error', msg);
        });
      }
    });

    child.on("error", (e) => {
      emit('error', `Spawn error: ${e.message}`);
      reject(e);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        const msg = `Gemini exited ${code}: ${err}`;
        emit('error', msg, { code });
        return reject(new Error(msg));
      }
      const final = out.trim();
      emit('complete', 'Gemini finished successfully');
      resolve(final);
    });

    // 👇 Pass the prompt via stdin so Gemini treats it as instructions for edits
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

exports.runGeminiPrompt = runGeminiPrompt;
