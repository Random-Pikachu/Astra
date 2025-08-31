const fs = require("fs");
const path = require("path");
const Parser = require("web-tree-sitter");

let JS_LANG, PY_LANG;

async function initParsers() {
  await Parser.init();
  JS_LANG = await Parser.Language.load(path.join(__dirname, "grammar/tree-sitter-javascript.wasm"));
  PY_LANG = await Parser.Language.load(path.join(__dirname, "grammar/tree-sitter-python.wasm"));
}

function shouldSkip(filePath) {
  const excludedDirs = ["node_modules", ".git", "__pycache__"];
  const excludedFiles = [".env"];

  // skip excluded dirs anywhere in path
  if (excludedDirs.some(dir => filePath.includes(`${path.sep}${dir}${path.sep}`))) return true;
  // skip specific filenames
  if (excludedFiles.some(f => filePath.endsWith(f))) return true;

  return false;
}

function findImportsInFile(filePath, lang, depName) {
  const parser = new Parser();
  parser.setLanguage(lang);

  const code = fs.readFileSync(filePath, "utf8");
  const tree = parser.parse(code);
  const root = tree.rootNode;

  let found = false;

  function walk(node) {
    if (lang === JS_LANG) {
      if (node.type === "import_statement" || node.type === "call_expression") {
        const text = node.text;
        if (text.includes(`"${depName}"`) || text.includes(`'${depName}'`)) {
          found = true;
        }
      }
    }
    if (lang === PY_LANG) {
      if (node.type === "import_statement" || node.type === "import_from_statement") {
        const text = node.text;
        if (text.startsWith("import " + depName) || text.startsWith("from " + depName)) {
          found = true;
        }
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }

  walk(root);
  return found;
}

function getImports(rootPath, language, depName) {
  const results = [];

  // Check if parsers are initialized
  const lang = language === "javascript" ? JS_LANG : PY_LANG;
  if (!lang) {
    console.warn(`Parser not initialized for ${language}, using simple text search`);
    return simpleTextSearch(rootPath, language, depName);
  }

  function walkDir(dir) {
    try {
      for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (shouldSkip(full)) continue;

        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walkDir(full);
        } else {
          if (
            (language === "javascript" && /\.(js|mjs|cjs|ts)$/.test(file)) ||
            (language === "python" && file.endsWith(".py"))
          ) {
            if (findImportsInFile(full, lang, depName)) {
              results.push(full);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error walking directory ${dir}:`, error.message);
    }
  }

  walkDir(rootPath);
  return results;
}

// Fallback function for when tree-sitter is not available
function simpleTextSearch(rootPath, language, depName) {
  const results = [];
  
  function walkDir(dir) {
    try {
      for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (shouldSkip(full)) continue;

        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walkDir(full);
        } else {
          if (
            (language === "javascript" && /\.(js|mjs|cjs|ts)$/.test(file)) ||
            (language === "python" && file.endsWith(".py"))
          ) {
            try {
              const content = fs.readFileSync(full, 'utf8');
              if (language === "javascript") {
                // Look for import/require statements
                if (content.includes(`'${depName}'`) || content.includes(`"${depName}"`)) {
                  const lines = content.split('\n');
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if ((line.includes('import') || line.includes('require')) && 
                        (line.includes(`'${depName}'`) || line.includes(`"${depName}"`))) {
                      results.push(full); // Just push the file path, not an object
                      break;
                    }
                  }
                }
              } else if (language === "python") {
                // Look for import statements
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i].trim();
                  if ((line.startsWith(`import ${depName}`) || line.startsWith(`from ${depName}`))) {
                    results.push(full); // Just push the file path, not an object
                    break;
                  }
                }
              }
            } catch (readError) {
              console.warn(`Error reading file ${full}:`, readError.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error walking directory ${dir}:`, error.message);
    }
  }

  walkDir(rootPath);
  return results;
}

module.exports = { initParsers, getImports };
