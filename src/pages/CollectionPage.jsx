import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  "Tous",
  "AFRIQUE",
  "AMERIQUE",
  "ASIE",
  "EUROPE",
  "MONDE",
  "OCEANIE",
];

export default function CollectionPage() {
  const [filtre, setFiltre] = useState("Tous");
  const [albums, setAlbums] = useState([]);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/albums.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAlbums(data);
      })
      .catch((err) => console.error("Erreur de chargement albums.json", err));
  }, []);

  useEffect(() => {
    if (albums.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % albums.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [albums]);

  const albumsFiltres =
    filtre === "Tous" ? albums : albums.filter((a) => a.continent === filtre);

  const currentAlbum = albums.length > 0 ? albums[index] : null;

  const getCover = (album) => {
    try {
      if (album.pages.length > 0 && album.pages[0].images.length > 0) {
        const image = album.pages[0].images[0];
        return `/images/albums/${album.dossier}/${album.pages[0].nom}/${image}`;
      }
    } catch {
      return "/placeholder.jpg";
    }
    return "/placeholder.jpg";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        📚 <span>Albums de la Collection</span>
      </h1>

      {/* Carrousel */}
      {currentAlbum && (
        <div className="w-full max-w-4xl mx-auto mb-10 overflow-hidden rounded-lg shadow-lg">
          <img
            src={getCover(currentAlbum)}
            alt={currentAlbum.titre}
            className="w-full h-64 object-cover transition duration-500"
          />
          <div className="text-center bg-white py-4">
            <h2 className="text-xl font-semibold">{currentAlbum.titre}</h2>
            <p className="text-gray-500 text-sm">{currentAlbum.pays}</p>
          </div>
        </div>
      )}

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

      {/* Grille des albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {albumsFiltres.map((album) => (
          <div
            key={album.id}
            onClick={() => navigate(`/album/${album.id}`)}
            className="cursor-pointer bg-white shadow rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl transition duration-300"
          >
            <img
              src={getCover(album)}
              alt={album.titre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {album.titre}
              </h3>
              <p className="text-sm text-gray-500">{album.pays}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
