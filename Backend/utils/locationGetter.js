const fs = require("fs");
const path = require("path");
const { Parser, Language} = require("web-tree-sitter");

let JS_LANG, PY_LANG;

async function initParsers() {
  try {
    await Parser.init();
    console.log("Tree-sitter Parser.init() completed");

    // Resolve absolute paths to .wasm grammar files
    const jsPath = path.resolve(__dirname, "..", "grammar", "tree-sitter-javascript.wasm");
    const pyPath = path.resolve(__dirname, "..", "grammar", "tree-sitter-python.wasm");

    console.log("Checking grammar files...");
    console.log("JS Path:", jsPath, fs.existsSync(jsPath));
    console.log("PY Path:", pyPath, fs.existsSync(pyPath));

    JS_LANG = await Language.load(jsPath);
    console.log("JavaScript parser loaded successfully");

    PY_LANG = await Language.load(pyPath);
    console.log("Python parser loaded successfully");
  } catch (error) {
    console.error("Error during parser initialization:", error);
    throw error;
  }
}

/**
 * Skip certain directories or files
 */
function shouldSkip(filePath) {
  const excludedDirs = ["node_modules", ".git", "__pycache__"];
  const excludedFiles = [".env"];

  if (excludedDirs.some(dir => filePath.includes(`${path.sep}${dir}${path.sep}`))) return true;
  if (excludedFiles.some(f => filePath.endsWith(f))) return true;

  return false;
}


function findImportsInFile(filePath, lang, depName, language) {
  const parser = new Parser();
  parser.setLanguage(lang);

  const code = fs.readFileSync(filePath, "utf8");
  const tree = parser.parse(code);
  const root = tree.rootNode;

  let found = false;

  function walk(node) {
    if (language === "javascript") {
      if (node.type === "import_statement" || node.type === "call_expression") {
        const text = node.text;
        if (text.includes(`"${depName}"`) || text.includes(`'${depName}'`)) {
          found = true;
        }
      }
    } else if (language === "python") {
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

// /**
//  * Walk through repo files and collect imports
//  */
function getImports(rootPath, language, depName) {
  const results = [];

  const lang = language === "javascript" ? JS_LANG : PY_LANG;
  // if (!lang) {
  //   console.warn(`Parser not initialized for ${language}, using simple text search`);
  //   return simpleTextSearch(rootPath, language, depName);
  // }

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
            if (findImportsInFile(full, lang, depName, language)) {
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

/**
 * Fallback simple text search (if parser fails)
//  */
// function simpleTextSearch(rootPath, language, depName) {
//   const results = [];

//   function walkDir(dir) {
//     try {
//       for (const file of fs.readdirSync(dir)) {
//         const full = path.join(dir, file);
//         if (shouldSkip(full)) continue;

//         const stat = fs.statSync(full);
//         if (stat.isDirectory()) {
//           walkDir(full);
//         } else {
//           if (
//             (language === "javascript" && /\.(js|mjs|cjs|ts)$/.test(file)) ||
//             (language === "python" && file.endsWith(".py"))
//           ) {
//             try {
//               const content = fs.readFileSync(full, "utf8");
//               const lines = content.split("\n");

//               if (language === "javascript") {
//                 if (content.includes(`'${depName}'`) || content.includes(`"${depName}"`)) {
//                   for (const line of lines) {
//                     if (
//                       (line.includes("import") || line.includes("require")) &&
//                       (line.includes(`'${depName}'`) || line.includes(`"${depName}"`))
//                     ) {
//                       results.push(full);
//                       break;
//                     }
//                   }
//                 }
//               } else if (language === "python") {
//                 for (const line of lines) {
//                   if (line.trim().startsWith(`import ${depName}`) || line.trim().startsWith(`from ${depName}`)) {
//                     results.push(full);
//                     break;
//                   }
//                 }
//               }
//             } catch (readError) {
//               console.warn(`Error reading file ${full}:`, readError.message);
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.warn(`Error walking directory ${dir}:`, error.message);
//     }
//   }

//   walkDir(rootPath);
//   return results;
// }

module.exports = { initParsers, getImports };
