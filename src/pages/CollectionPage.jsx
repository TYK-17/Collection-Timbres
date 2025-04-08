import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const albums = [
  {
    id: 1,
    titre: "Colonies Françaises",
    image: "/images/Albums/colonies.jpg",
    catégorie: "Colonies Françaises",
  },
  {
    id: 2,
    titre: "Afrique - A à G",
    image: "/images/Albums/afrique-a-g.jpg",
    catégorie: "Pays d'Afrique",
  },
  {
    id: 3,
    titre: "DOM/TOM Pacifique",
    image: "/images/Albums/domtom.jpg",
    catégorie: "DOM/TOM",
  },
  {
    id: 4,
    titre: "Indépendants Asie",
    image: "/images/Albums/indep-avant-80.jpg",
    catégorie: "Indépendants avant 1980",
  },
  {
    id: 5,
    titre: "Afrique - H à Z",
    image: "/images/Albums/afrique-h-z.jpg",
    catégorie: "Indépendants après 1980",
  },
];

const categories = [
  "Tous",
  "Colonies Françaises",
  "Pays d'Afrique",
  "DOM/TOM",
  "Indépendants avant 1980",
  "Indépendants après 1980",
];

export default function CollectionPage() {
  const [filtre, setFiltre] = useState("Tous");
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const albumsFiltres =
    filtre === "Tous" ? albums : albums.filter((a) => a.catégorie === filtre);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % albums.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentAlbum = albums[index];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        🎠 <span>Albums de la Collection</span>
      </h1>

      {/* Carrousel */}
      <div className="w-full max-w-4xl mx-auto mb-10 overflow-hidden rounded-lg shadow-lg">
        <img
          src={currentAlbum.image}
          alt={currentAlbum.titre}
          className="w-full h-64 object-cover transition duration-500"
        />
        <div className="text-center bg-white py-4">
          <h2 className="text-xl font-semibold">{currentAlbum.titre}</h2>
          <p className="text-gray-500 text-sm">{currentAlbum.catégorie}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltre(cat)}
            className={`px-4 py-1 rounded-full border text-sm font-medium transition duration-200 ${
              filtre === cat
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {albumsFiltres.map((album) => (
          <div
            key={album.id}
            onClick={() => navigate("/app")}
            className="cursor-pointer bg-white shadow rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
          >
            <img
              src={album.image}
              alt={album.titre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {album.titre}
              </h3>
              <p className="text-sm text-gray-500">{album.catégorie}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
