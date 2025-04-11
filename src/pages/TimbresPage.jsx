import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// Fonction pour aplatir l'arborescence des dossiers
function flattenTree(tree, cheminBase = "") {
  let result = [];

  for (const item of tree) {
    const chemin = cheminBase ? `${cheminBase}/${item.name}` : item.name;

    if (item.type === "folder") {
      const enfants = flattenTree(item.children || [], chemin);
      result.push({
        ...item,
        dossier: chemin,
      });
      result = [...result, ...enfants];
    }
  }

  return result;
}

export default function TimbresPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const decodedPath = decodeURIComponent(albumId);

  const cheminLisible = decodedPath
    .split("/")
    .map((segment) => segment.replace(/_/g, " "))
    .join(" / ");

  const [excelPages, setExcelPages] = useState([]);
  const [pageCourante, setPageCourante] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [nomFichierJson, setNomFichierJson] = useState("");
  const [dateDerniereMaj, setDateDerniereMaj] = useState(null);

  useEffect(() => {
    setIsLoading(true); // Start loading
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((tree) => {
        const flat = flattenTree(tree);
        const fullPath = `albums/${decodedPath}`;
        const album = flat.find((a) => a.dossier === fullPath);

        if (!album || !album.json) return;

        const url = `/data/${album.dossier}/${album.json}`;
        setNomFichierJson(album.json);
        // Récupérer la date de dernière mise à jour du fichier JSON
        fetch(
          `http://localhost:5000/file-date?albumPath=${decodedPath}&fileName=${album.json}`
        )
          .then((res) => res.json())
          .then((data) => setDateDerniereMaj(data.lastModified))
          .catch((err) => console.error("Erreur récupération date:", err));

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const pagesArray = Object.keys(data).map((key) => ({
              nom: key,
              timbres: data[key],
            }));
            setExcelPages(pagesArray);
            setIsLoading(false); // Stop loading
          })
          .catch(() => {
            setIsLoading(false); // Stop loading on error
            alert("Erreur lors du chargement des données.");
          });
      });
  }, [decodedPath]);

  const filteredRows =
    excelPages[pageCourante]?.timbres?.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )
    ) || [];

  const totalPages = excelPages.length; // Nombre total de pages

  // Fonction pour gérer le téléchargement et la conversion de l'Excel en JSON
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("excel", file);
    formData.append("albumPath", decodedPath); // comme "Europe/France"

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("✅ Données mises à jour !");
        window.location.reload(); // recharge pour re-fetch les données
      } else {
        alert("❌ Erreur lors de l'import.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  // Trouver l'index de la dernière ligne contenant "TOTAL Côte" dans la colonne 'obs'
  const lastTotalCoteIndex = [...filteredRows]
    .map((row, idx) => ({
      idx,
      isTotal: row["obs"]?.toString().trim().toLowerCase() === "total côte",
    }))
    .filter((row) => row.isTotal)
    .map((row) => row.idx)
    .pop(); // On prend la dernière occurrence

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          ⬅ Retour
        </button>
        <h1 className="text-2xl font-bold">📘 Album : {cheminLisible}</h1>
      </div>

      <input
        className="border px-3 py-2 mb-4 w-full"
        placeholder="🔍 Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Ajout du bouton de téléchargement de fichier Excel */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelUpload}
          className="border px-3 py-2"
        />
      </div>

      {isLoading ? (
        <div className="text-center">Chargement des données...</div>
      ) : (
        excelPages.length > 0 && (
          <div className="overflow-x-auto mt-8">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setPageCourante((p) => Math.max(p - 1, 0))}
                disabled={pageCourante === 0}
                className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ⬅ Précédent
              </button>
              <span className="text-lg font-semibold">
                📄 Timbres depuis <strong>{nomFichierJson}</strong> (page{" "}
                {pageCourante + 1}/{totalPages})
              </span>
              {dateDerniereMaj && (
                <p className="text-sm text-gray-600">
                  🕓 Dernière mise à jour :{" "}
                  {new Date(dateDerniereMaj).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <button
                onClick={() =>
                  setPageCourante((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={pageCourante === totalPages - 1}
                className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Suivant ➡
              </button>
            </div>

            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  {Object.keys(excelPages[pageCourante].timbres[0] || {}).map(
                    (col) => (
                      <th key={col} className="border px-4 py-2">
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.entries(row).map(([col, val], j) => {
                      let style = "";

                      // Mise en forme conditionnelle classique pour valeurs numériques
                      if (col.includes("Côte") && typeof val === "number") {
                        if (val > 99.99) {
                          style = "text-white bg-red-600";
                        } else if (val > 9.99) {
                          style = "text-red-600";
                        } else if (val > 2.99) {
                          style = "text-blue-800";
                        } else if (val > 0.99) {
                          style = "text-black";
                        }
                      }

                      // ✅ Cas spécial : uniquement la dernière cellule contenant "TOTAL Côte" dans obs
                      const isLastTotalCoteCell =
                        i === lastTotalCoteIndex &&
                        col === "obs" &&
                        typeof val === "string" &&
                        val.trim().toLowerCase() === "total côte";

                      const isTotalGeneralCell =
                        col === "obs" &&
                        typeof val === "string" &&
                        val.trim().toLowerCase() === "total général";

                      const affichage =
                        typeof val === "boolean"
                          ? val
                            ? "✅"
                            : ""
                          : typeof val === "number"
                          ? val.toFixed(2).replace(/\.00$/, "")
                          : val;

                      return (
                        <td
                          key={j}
                          className={`border px-4 py-2 ${
                            isLastTotalCoteCell
                              ? "text-red-600 text-right"
                              : isTotalGeneralCell
                              ? "text-red-600 text-center align-middle"
                              : style
                          }`}
                        >
                          {affichage}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPageCourante((p) => Math.max(p - 1, 0))}
          disabled={pageCourante === 0}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ⬅ Précédent
        </button>
        <button
          onClick={() =>
            setPageCourante((p) => Math.min(p + 1, totalPages - 1))
          }
          disabled={pageCourante === totalPages - 1}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Suivant ➡
        </button>
      </div>
    </div>
  );
}
