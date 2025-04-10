const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const albumsDir = path.join(__dirname, "../public/data/albums");

// Fonction pour parcourir les dossiers
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

// Fonction pour analyser un fichier Excel
function parseExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const pages = {};

  workbook.SheetNames.forEach((sheetName) => {
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });
    pages[sheetName] = rows;
  });

  return pages;
}

// Fonction principale pour générer les fichiers JSON
function generateJsonFromExcels() {
  // Parcourir tous les fichiers Excel dans les albums
  walkDir(albumsDir, (file) => {
    if (file.endsWith(".xlsx") || file.endsWith(".xls")) {
      const json = parseExcelFile(file);

      // Générer le chemin du fichier JSON dans le même dossier que le fichier Excel
      const jsonPath = file.replace(/\.(xlsx|xls)$/i, ".json");

      // Enregistrer le fichier JSON à côté du fichier Excel
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), "utf-8");
      console.log(`✅ ${jsonPath} généré`);
    }
  });
}

// Appel de la fonction
generateJsonFromExcels();
