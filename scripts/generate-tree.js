const fs = require("fs");
const path = require("path");

// Dossier de base des albums
const albumsDir = path.join(__dirname, "..", "public", "data", "albums");

// Dossier de sortie pour albums-tree.json
const outputDir = path.join(__dirname, "..", "public", "albums-tree.json");

// Fonction pour trouver le fichier JSON dans un dossier donné
function findJsonFile(folderPath) {
  const candidates = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith(".json"));
  return candidates.length > 0 ? candidates[0] : null; // Retourne le premier fichier JSON trouvé
}

// Fonction récursive pour parcourir les dossiers et sous-dossiers
function walk(dir, relativePath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const children = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue; // Ignorer les fichiers/dossiers cachés

    const fullPath = path.join(dir, entry.name);
    const entryRelPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      // Appel récursif si c'est un dossier
      children.push(walk(fullPath, entryRelPath));
    } else if (entry.name.endsWith(".json")) {
      // Si c'est un fichier JSON, l'ajouter
      children.push({
        type: "json",
        name: entry.name,
        path: entryRelPath.replace(/\\/g, "/"), // Utilisation de '/' au lieu de '\'
      });
    }
  }

  // On retourne les informations du dossier actuel
  return {
    type: "folder",
    name: path.basename(dir),
    path: relativePath.replace(/\\/g, "/"),
    children: children.flat(),
    json: findJsonFile(dir), // Trouver un fichier JSON associé à ce dossier
  };
}

// Fonction principale pour générer l'arbre des albums
function generateAlbumsTree() {
  const tree = walk(albumsDir); // On commence à la racine des albums
  fs.writeFileSync(outputDir, JSON.stringify([tree], null, 2)); // On écrit l'arbre dans albums-tree.json
  console.log("✅ albums-tree.json généré avec succès !");
}

// Exécution de la fonction
generateAlbumsTree();
