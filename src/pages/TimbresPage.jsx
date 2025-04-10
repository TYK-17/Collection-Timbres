import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((tree) => {
        const flat = flattenTree(tree);
        const fullPath = `albums/${decodedPath}`;
        const album = flat.find((a) => a.dossier === fullPath);

        if (!album || !album.json) return;

        const url = `/data/${album.dossier}/${album.json}`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const pagesArray = Object.keys(data).map((key) => ({
              nom: key,
              timbres: data[key],
            }));
            setExcelPages(pagesArray);
          });
      });
  }, [decodedPath]);

  const filteredRows =
    excelPages[pageCourante]?.timbres?.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )
    ) || [];

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

      {excelPages.length > 0 && (
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
              📄 Timbres depuis Excel (page {pageCourante + 1})
            </span>
            <button
              onClick={() =>
                setPageCourante((p) => Math.min(p + 1, excelPages.length - 1))
              }
              disabled={pageCourante === excelPages.length - 1}
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
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-4 py-2">
                      {typeof val === "boolean" ? (val ? "✅" : "") : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            setPageCourante((p) => Math.min(p + 1, excelPages.length - 1))
          }
          disabled={pageCourante === excelPages.length - 1}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Suivant ➡
        </button>
      </div>
    </div>
  );
}
