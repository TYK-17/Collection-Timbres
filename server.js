const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const cors = require("cors");

// Tu peux adapter ces chemins si ton projet est structuré autrement
const albumsDir = path.join(__dirname, "public/data/albums");
const albumsTreePath = path.join(__dirname, "public/albums-tree.json");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Fonction pour générer l’arbre (copié de generate-tree.js)
function generateAlbumsTree() {
  function getContinent(relPath) {
    const parts = relPath.split(path.sep);
    return parts.length > 0 ? parts[0] : "";
  }

  function findJsonFile(folderPath) {
    const files = fs.readdirSync(folderPath);
    const candidates = files.filter((f) => f.endsWith(".json"));
    return candidates.length > 0 ? candidates[0] : null;
  }

  function walk(dir, relPath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const children = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const entryRelPath = path.join(relPath, entry.name);

      if (entry.isDirectory()) {
        children.push(walk(fullPath, entryRelPath));
      }
    }

    const folderData = {
      type: "folder",
      name: path.basename(dir),
      path: relPath.replace(/\\/g, "/"),
      continent: getContinent(relPath),
      children: children.flat(),
      json: findJsonFile(dir),
    };

    return folderData;
  }

  const tree = walk(albumsDir);
  fs.writeFileSync(albumsTreePath, JSON.stringify([tree], null, 2), "utf-8");
  console.log("✅ albums-tree.json mis à jour !");
}

// Route POST pour upload Excel et conversion
app.post("/upload", (req, res) => {
  const { albumPath } = req.body;
  const file = req.files?.excel;

  if (!file || !albumPath) {
    return res.status(400).send("Fichier ou chemin manquant");
  }

  try {
    const workbook = xlsx.read(file.data, { type: "buffer" });
    const pages = {};

    workbook.SheetNames.forEach((sheetName) => {
      pages[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });
    });

    const outputJson = JSON.stringify(pages, null, 2);

    const albumDir = path.join(albumsDir, albumPath);

    // Supprimer tous les fichiers JSON existants dans le dossier
    const existingFiles = fs.readdirSync(albumDir);
    existingFiles.forEach((f) => {
      if (f.endsWith(".json")) {
        fs.unlinkSync(path.join(albumDir, f));
      }
    });

    // 🛠 Corriger le nom du fichier avec encodage UTF-8
    const originalName = file.name;
    const utf8Name = Buffer.from(originalName, "latin1").toString("utf8");
    const jsonFileName = utf8Name.replace(/\.(xlsx|xls)$/i, ".json");
    const jsonPath = path.join(albumDir, jsonFileName);

    fs.writeFileSync(jsonPath, outputJson, "utf-8");

    generateAlbumsTree();

    res.send("✅ Fichier JSON mis à jour avec succès !");
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).send("Erreur lors du traitement du fichier");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend en écoute sur http://localhost:${PORT}`);
});
app.get("/file-date", (req, res) => {
  const { albumPath, fileName } = req.query;
  const filePath = path.join(albumsDir, albumPath, fileName);

  try {
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.toISOString();
    res.json({ lastModified });
  } catch (err) {
    console.error("Erreur lors de la lecture de la date du fichier :", err);
    res.status(500).send("Erreur lors de la récupération de la date");
  }
});
app.get("/synthese", (req, res) => {
  const relativePath = req.query.path || ""; // ← récupère le path demandé
  const targetPath = path.join(albumsDir, relativePath);

  const parContinent = {};
  let totalTimbres = 0;
  let totalCote = 0;
  let totalAlbums = 0;

  function walk(dir, continent = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const hasJson = entries.some(
      (entry) => entry.isFile() && entry.name.endsWith(".json")
    );

    if (hasJson) {
      const c = continent || "Inconnu";
      if (!parContinent[c]) {
        parContinent[c] = { albums: 0, timbres: 0, cote: 0 };
      }

      parContinent[c].albums++;
      totalAlbums++;

      const jsonFiles = entries.filter(
        (entry) => entry.isFile() && entry.name.endsWith(".json")
      );

      for (const file of jsonFiles) {
        const filePath = path.join(dir, file.name);
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          const json = JSON.parse(content);

          Object.entries(json).forEach(([pageName, page]) => {
            const nom = pageName.trim().toLowerCase();
            const estIgnoree = ["total", "page type"].some((mot) =>
              nom.includes(mot)
            );
            if (estIgnoree) return;

            parContinent[c].timbres += page.length;
            totalTimbres += page.length;

            page.forEach((timbre) => {
              const key = Object.keys(timbre).find((k) =>
                k.toLowerCase().includes("côte")
              );
              const val = parseFloat(timbre[key]);
              if (!isNaN(val)) {
                parContinent[c].cote += val;
                totalCote += val;
              }
            });
          });
        } catch (err) {
          console.error(`Erreur lecture ${filePath}`, err);
        }
      }
    }

    // Sous-dossiers
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subdir = path.join(dir, entry.name);
        walk(subdir, continent || entry.name);
      }
    }
  }

  // Lance la collecte sur le chemin demandé
  walk(targetPath);

  const continents = Object.keys(parContinent).length
    ? parContinent
    : {
        Inconnu: {
          albums: totalAlbums,
          timbres: totalTimbres,
          cote: totalCote,
        },
      };

  res.json({
    continents,
    total: {
      albums: totalAlbums,
      timbres: totalTimbres,
      cote: totalCote.toFixed(2),
    },
  });
});
