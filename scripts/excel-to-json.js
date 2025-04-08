const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const albumsDir = path.join(__dirname, "../public/images/albums");
const outputDir = path.join(__dirname, "../public/data");

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

function generateJsonFromExcels() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  walkDir(albumsDir, (file) => {
    if (file.endsWith(".xlsx")) {
      const json = parseExcelFile(file);
      const baseName = path.basename(file, path.extname(file));
      const jsonPath = path.join(outputDir, `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), "utf-8");
      console.log(`✅ ${jsonPath} généré`);
    }
  });
}

generateJsonFromExcels();
