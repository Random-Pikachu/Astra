// Progress parser: converts raw CLI output lines into concise, tagged UX events

function categorize(line) {
  const msg = (line || '').trim();
  if (!msg) return null;

  // Git branch creation
  let m = msg.match(/git\s+(?:checkout\s+-b|switch\s+-c)\s+([^\s]+)/i)
    || msg.match(/Switched to a new branch ['"]([^'"]+)['"]/i)
    || msg.match(/Created branch ['"]([^'"]+)['"]/i);
  if (m) return { type: 'git', message: `[git] creating new branch: ${m[1]}`, meta: { branch: m[1] } };

  // Git commit / push
  if (/git\s+commit\b/i.test(msg)) return { type: 'git', message: `[git] committing changes`, meta: null };
  m = msg.match(/git\s+push\b.*\s+([^\s]+)\s+([^\s]+)/i);
  if (m) return { type: 'git', message: `[git] pushing to ${m[1]} ${m[2]}`, meta: { remote: m[1], refspec: m[2] } };

  // NPM/Yarn/PNPM package installs
  m = msg.match(/(?:npm|pnpm|yarn)\s+(?:install|i|add)\s+([^@\s]+)@?([^\s]*)/i);
  if (m) {
    const pkg = m[1];
    const ver = m[2] || 'latest';
    return { type: 'package', message: `[package] updating ${pkg} -> ${ver}`, meta: { package: pkg, version: ver } };
  }

  // Python
  m = msg.match(/pip\s+install\s+([^\s=]+)==?([^\s]*)/i) || msg.match(/poetry\s+add\s+([^\s=]+)==?([^\s]*)/i);
  if (m) return { type: 'package', message: `[package] updating ${m[1]} -> ${m[2] || 'latest'}`, meta: { package: m[1], version: m[2] || 'latest' } };

  // Go modules
  m = msg.match(/go\s+get\s+([^\s@]+)@?([^\s]*)/i);
  if (m) return { type: 'package', message: `[package] updating ${m[1]} -> ${m[2] || 'latest'}`, meta: { package: m[1], version: m[2] || 'latest' } };

  // Cargo
  m = msg.match(/cargo\s+update\s+-p\s+([^\s]+)(?:\s+--precise\s+([^\s]+))?/i);
  if (m) return { type: 'package', message: `[package] updating ${m[1]}${m[2] ? ' -> ' + m[2] : ''}`, meta: { package: m[1], version: m[2] || null } };

  // File operations (support our explicit tagged format and common phrasings)
  // Tagged format we asked Gemini for
  m = msg.match(/^\[file\]\s+(Updating|Updated|Modified|Created|Deleted):\s+([^|]+)(?:\s*\|\s*fn:\s*([^|]+))?(?:\s*\|\s*change:\s*(.+))?$/i);
  if (m) {
    const phase = m[1];
    const file = (m[2] || '').trim();
    const fn = (m[3] || '').trim() || undefined;
    const change = (m[4] || '').trim() || undefined;
    return { type: 'file', message: `[file] ${phase}: ${file}${fn ? ' | fn: ' + fn : ''}${change ? ' | change: ' + change : ''}`, meta: { file, fn, change, phase } };
  }

  // Common CLI phrases
  m = msg.match(/(?:Writing|Updating|Updated|Modified|Created|Deleting|Deleted)\s+file:?\s+(.+)/i)
    || msg.match(/^(?:create|update|modify|delete):\s+(.+)/i);
  if (m) return { type: 'file', message: `[file] ${msg.replace(/\s+/g, ' ')}`, meta: { file: (m[1] || '').trim() } };

  // Generic commands
  if (/^(git|npm|pnpm|yarn|pip|poetry|uv|go|cargo)\b/i.test(msg)) {
    return { type: 'command', message: `[cmd] ${msg}`, meta: null };
  }

  // Known Gemini tool error mapping to structured warning/error
  if (/Error executing tool run_shell_command/i.test(msg)) {
    return { type: 'warning', message: `[warning] shell tool rejected a command; using fallback`, meta: { source: 'gemini' } };
  }
  if (/Command substitution using \$\(\), <\(\), or >\(\) is not allowed/i.test(msg)) {
    return { type: 'error', message: `[error] command substitution not allowed; avoid $(), <(), >()`, meta: { source: 'policy' } };
  }

  return null;
}

function extractEvents(text) {
  const events = [];
  if (!text) return events;

  // 1) Extract explicit tagged segments possibly concatenated in one line
  // Matches: [git] ...  [package] ...  [file] ...  [cmd] ...
  const tagRegex = /\[(git|package|file|cmd)\]([^\[]*)/gi;
  let m;
  while ((m = tagRegex.exec(text)) !== null) {
    const tag = m[1].toLowerCase();
    const body = (m[2] || '').trim();
    let evt = null;

    if (tag === 'file') {
      // Try the structured file format first
      const fm = body.match(/^(Updating|Updated|Modified|Created|Deleted):\s+([^|]+)(?:\s*\|\s*fn:\s*([^|]+))?(?:\s*\|\s*change:\s*(.+))?$/i);
      if (fm) {
        const phase = fm[1];
        const file = (fm[2] || '').trim();
        const fn = (fm[3] || '').trim() || undefined;
        const change = (fm[4] || '').trim() || undefined;
        evt = { type: 'file', message: `[file] ${phase}: ${file}${fn ? ' | fn: ' + fn : ''}${change ? ' | change: ' + change : ''}`, meta: { file, fn, change, phase } };
      } else {
        evt = { type: 'file', message: `[file] ${body}`, meta: null };
      }
    } else if (tag === 'git') {
      // Common git structured body examples
      const bm = body.match(/^creating\s+new\s+branch:\s+(.+)$/i);
      if (bm) {
        const branch = bm[1].trim();
        evt = { type: 'git', message: `[git] creating new branch: ${branch}`, meta: { branch } };
      } else if (/^committing\s+changes$/i.test(body)) {
        evt = { type: 'git', message: `[git] committing changes`, meta: null };
      } else if (/^pushing\s+to\s+([^\s]+)\s+([^\s]+)$/i.test(body)) {
        const pm = body.match(/^pushing\s+to\s+([^\s]+)\s+([^\s]+)$/i);
        evt = { type: 'git', message: `[git] pushing to ${pm[1]} ${pm[2]}`, meta: { remote: pm[1], refspec: pm[2] } };
      } else {
        evt = { type: 'git', message: `[git] ${body}`, meta: null };
      }
    } else if (tag === 'package') {
      const pm = body.match(/^updating\s+([^\s]+)\s*->\s*([^\s]+)$/i);
      if (pm) {
        evt = { type: 'package', message: `[package] updating ${pm[1]} -> ${pm[2]}`, meta: { package: pm[1], version: pm[2] } };
      } else {
        evt = { type: 'package', message: `[package] ${body}`, meta: null };
      }
    } else if (tag === 'cmd') {
      evt = { type: 'command', message: `[cmd] ${body}`, meta: null };
    }

    if (evt) events.push(evt);
  }

  // 2) Fallback: split by newline and categorize whole lines (captures raw commands, etc.)
  String(text).split(/\r?\n/).forEach((line) => {
    const trimmed = (line || '').trim();
    if (!trimmed) return;
    const evt = categorize(trimmed);
    if (evt) {
      events.push(evt);
    } else {
      // Emit untagged output as info so the UI mirrors CLI when tags are absent
      events.push({ type: 'info', message: trimmed, meta: null });
    }
  });

  return events;
}

module.exports = { categorize, extractEvents };


