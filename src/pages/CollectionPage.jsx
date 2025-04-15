import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import WorldMap from "../components/WorldMap";

function parsePath(pathname) {
  const parts = pathname
    .replace(/^\/collection\/?/, "")
    .split("/")
    .filter(Boolean);
  return parts;
}

function findNode(tree, pathParts) {
  let current = tree[0];
  for (const part of pathParts) {
    if (!current.children) return null;

    const decodedPart = decodeURIComponent(part);

    current = current.children.find(
      (child) => child.type === "folder" && child.name === decodedPart
    );
    if (!current) return null;
  }
  return current;
}

export default function CollectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = parsePath(location.pathname);

  const [tree, setTree] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [search, setSearch] = useState("");
  const [synthese, setSynthese] = useState(null);
  const [hoveredContinent, setHoveredContinent] = useState(null);

  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((data) => {
        setTree(data);
      });
  }, []);

  useEffect(() => {
    if (tree.length === 0) return;
    const node = findNode(tree, pathParts);
    setCurrentNode(node);
  }, [tree, location.pathname, pathParts]);

  useEffect(() => {
    fetch("http://localhost:5000/synthese")
      .then((res) => res.json())
      .then(setSynthese)
      .catch((err) => console.error("Erreur chargement synthèse:", err));
  }, []);

  const subFolders =
    currentNode?.children?.filter((child) => child.type === "folder") || [];
  const filteredSubFolders = subFolders.filter((child) =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentPath = pathParts.join("/");
  const parentPath = pathParts.slice(0, -1).join("/");

  // ➕ détecter le continent actif pour mise en surbrillance + popup info
  const continentActif = currentNode?.continent || pathParts[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start mb-4">
        <Link
          to="/"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          🏠 Retour à l'accueil
        </Link>

        {/* ✅ Afficher stats globales seulement à la racine */}
        {synthese && pathParts.length === 0 && (
          <div className="text-right text-sm leading-6">
            <p>
              📦 <strong>Total albums :</strong> {synthese.total.albums}
            </p>
            <p>
              📬 <strong>Total timbres :</strong> {synthese.total.timbres}
            </p>
            <p>
              💶 <strong>Cotation totale :</strong> {synthese.total.cote} €
            </p>
          </div>
        )}
      </div>

      {synthese && (
        <WorldMap
          hoveredContinent={hoveredContinent || continentActif}
          continentStats={synthese.continents}
        />
      )}

      <input
        className="border px-3 py-2 mb-4 w-full"
        placeholder="🔍 Rechercher un classeur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {pathParts.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => navigate(`/collection/${parentPath}`)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            ⬅ Retour
          </button>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600">
        {pathParts.length > 0 && (
          <Link to="/collection" className="text-blue-600 underline">
            Racine
          </Link>
        )}
        {pathParts.map((part, idx) => {
          const subPath = pathParts.slice(0, idx + 1).join("/");
          return (
            <span key={idx}>
              {" / "}
              <Link
                to={`/collection/${subPath}`}
                className="text-blue-600 underline"
              >
                {decodeURIComponent(part).replace(/_/g, " ")}
              </Link>
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSubFolders.map((child, idx) => {
          const childPath = [...pathParts, child.name].join("/");
          const continent = child.continent;
          const stats = synthese?.continents?.[continent];

          return (
            <Link
              key={idx}
              to={`/collection/${childPath}`}
              onMouseEnter={() => setHoveredContinent(continent)}
              onMouseLeave={() => setHoveredContinent(null)}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-2">
                {child.name.replace(/_/g, " ")}
              </h2>
              {stats && (
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>📁 Albums : {stats.albums}</li>
                  <li>📬 Timbres : {stats.timbres}</li>
                  <li>💶 Cote : {stats.cote.toFixed(2)} €</li>
                </ul>
              )}
            </Link>
          );
        })}
      </div>

      {currentNode?.json && (
        <div className="mt-10 p-4 border bg-yellow-50 rounded">
          <h3 className="font-semibold">📄 Données JSON disponibles</h3>
          <Link
            to={`/album/${encodeURIComponent(currentPath)}`}
            className="text-blue-700 underline"
          >
            👉 Voir les timbres de cet album
          </Link>
        </div>
      )}
    </div>
  );
}
