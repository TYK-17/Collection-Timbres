import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

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
  }, [tree, location.pathname]);

  const subFolders =
    currentNode?.children?.filter((child) => child.type === "folder") || [];
  const currentPath = pathParts.join("/");
  const parentPath = pathParts.slice(0, -1).join("/");

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Bouton vers la LandingPage */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          🏠 Retour à l'accueil
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        📁{" "}
        {currentPath
          ? decodeURIComponent(currentPath).replace(/_/g, " / ")
          : "Tous les continents"}
      </h1>

      {/* Bouton retour */}
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

      {/* Fil d’Ariane */}
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

      {/* Sous-dossiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {subFolders.map((child, idx) => {
          const childPath = [...pathParts, child.name].join("/");
          return (
            <Link
              key={idx}
              to={`/collection/${childPath}`}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">
                {child.name.replace(/_/g, " ")}
              </h2>
            </Link>
          );
        })}
      </div>

      {/* Fichier JSON s'il existe */}
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
