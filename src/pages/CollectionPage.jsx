import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const continents = [
  "TOUS",
  "AFRIQUE",
  "AMERIQUE",
  "ASIE",
  "EUROPE",
  "MONDE",
  "OCEANIE",
];

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

export default function CollectionPage() {
  const [albums, setAlbums] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState("TOUS");

  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((tree) => {
        const flat = flattenTree(tree);
        const albumsAvecJson = flat.filter((item) => item.json);
        setAlbums(albumsAvecJson);
      });
  }, []);

  const albumsFiltres =
    selectedContinent === "TOUS"
      ? albums
      : albums.filter((a) => a.continent === selectedContinent);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📚 Collection de Timbres</h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {continents.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedContinent(c)}
            className={`px-4 py-2 rounded ${
              selectedContinent === c
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {albumsFiltres.map((album, idx) => {
          const cheminLisible = album.dossier
            .split("/")
            .slice(1)
            .join(" / ")
            .replace(/_/g, " ");
          const urlId = album.dossier.replace(/\//g, "_");

          return (
            <Link
              key={idx}
              to={`/album/${urlId}`}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{cheminLisible}</h2>
              <p className="text-sm text-gray-600">🌍 {album.continent}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
