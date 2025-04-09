const fs = require("fs");
const path = require("path");

// Corrigé : on remonte d'un dossier car __dirname === scripts/
const baseDir = path.join(__dirname, "..", "public", "images", "albums");

function walk(dir, relativePath = "") {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const entryRelPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      result.push({
        type: "folder",
        name: entry.name,
        path: entryRelPath.replace(/\\/g, "/"),
        children: walk(fullPath, entryRelPath),
      });
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      result.push({
        type: "image",
        name: entry.name,
        path: entryRelPath.replace(/\\/g, "/"),
      });
    }
  }

  return result;
}

const tree = walk(baseDir);
const outputPath = path.join(__dirname, "..", "public", "albums-tree.json");

fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2));
console.log("✅ albums-tree.json généré avec succès !");
