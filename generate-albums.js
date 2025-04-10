// generate-albums.js
const fs = require("fs");
const path = require("path");

// Racine où sont stockés tous les albums
const BASE_DIR = path.join(__dirname, "public/data /albums");
const OUTPUT_FILE = path.join(__dirname, "public/albums.json");

function isImage(filename) {
  return /\.(jpg|jpeg|png)$/i.test(filename);
}

function scanAlbums(baseDir) {
  const albums = [];
  const albumMap = new Map();

  const walk = (dir, callback) => {
    fs.readdirSync(dir).forEach((item) => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        callback(fullPath);
        walk(fullPath, callback);
      }
    });
  };

  walk(baseDir, (imageDir) => {
    const data = fs.readdirSync(imageDir).filter(isImage);
    if (!data.length) return;

    const pageName = path.basename(imageDir);
    const albumFolder = path.dirname(imageDir);
    const albumName = path.basename(albumFolder);
    const relativeAlbumPath = path.relative(BASE_DIR, albumFolder);

    const continent = relativeAlbumPath.split(path.sep)[0] || "Inconnu";
    const pays = relativeAlbumPath.split(path.sep)[1] || "Inconnu";

    if (!albumMap.has(relativeAlbumPath)) {
      albumMap.set(relativeAlbumPath, {
        id: relativeAlbumPath.replace(/[\/\\\s]/g, "-").toLowerCase(),
        titre: albumName,
        dossier: relativeAlbumPath,
        continent,
        pays,
        pages: [],
      });
    }

    albumMap.get(relativeAlbumPath).pages.push({
      nom: pageName,
      data: data.sort(),
    });
  });

  return Array.from(albumMap.values());
}

const albums = scanAlbums(BASE_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(albums, null, 2), "utf-8");
console.log(`✅ albums.json généré avec ${albums.length} albums !`);
