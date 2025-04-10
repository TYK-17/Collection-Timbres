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
  console.log(
    `findJsonFile - dossier: ${folderPath}, fichiers JSON trouvés: ${candidates}`
  );
  return candidates.length > 0 ? candidates[0] : null; // Retourne le premier fichier JSON trouvé
}

// Fonction récursive pour parcourir les dossiers et sous-dossiers
function walk(dir, relativePath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const children = [];

  console.log(`walk - Dossier: ${dir}, Chemin relatif: ${relativePath}`);

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue; // Ignorer les fichiers/dossiers cachés

    const fullPath = path.join(dir, entry.name);
    const entryRelPath = path.join(relativePath, entry.name);

    console.log(`walk - Vérification de l'entrée: ${entry.name}`);
    console.log(
      `walk - Chemin complet: ${fullPath}, Chemin relatif: ${entryRelPath}`
    );

    if (entry.isDirectory()) {
      // Appel récursif si c'est un dossier
      children.push(walk(fullPath, entryRelPath));
    } else if (entry.name.endsWith(".json")) {
      // Si c'est un fichier JSON, l'ajouter
      children.push({
        type: "json",
        name: entry.name,
        path: entryRelPath.replace(/\\/g, "/"), // Remplacer les barres inverses par des barres obliques
      });
    }
  }

  // On retourne les informations du dossier actuel
  const folderData = {
    type: "folder",
    name: path.basename(dir),
    path: relativePath.replace(/\\/g, "/"), // Remplacer les barres inverses par des barres obliques
    continent: getContinent(relativePath), // Utilisation de la fonction pour extraire le continent
    children: children.flat(),
    json: findJsonFile(dir), // Trouver un fichier JSON associé, s'il existe
  };

  console.log(
    `walk - Dossier traité: ${folderData.name}, continent: ${folderData.continent}`
  );

  return folderData;
}

// Fonction pour extraire le continent
function getContinent(path) {
  console.log(`getContinent - Path reçu: ${path}`);

  // Découpe le chemin par les barres obliques inversées
  const parts = path.split("\\"); // Utilisation des barres obliques inversées (Windows)
  console.log(`getContinent - Chemin découpé: ${JSON.stringify(parts)}`);

  // On prend seulement le premier élément du tableau comme continent
  const continent = parts.length > 0 ? parts[0] : "";
  console.log(`getContinent - Continent extrait: ${continent}`);

  return continent; // Le continent est le premier élément du chemin
}

// Fonction principale pour générer l'arbre des albums
function generateAlbumsTree() {
  console.log(`generateAlbumsTree - Démarrage de la génération de l'arbre`);
  const tree = walk(albumsDir); // On commence à la racine des albums
  fs.writeFileSync(outputDir, JSON.stringify([tree], null, 2)); // On écrit l'arbre dans albums-tree.json
  console.log("✅ albums-tree.json généré avec succès !");
}

// Exécution de la fonction
generateAlbumsTree();
