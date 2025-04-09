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
function flattenTree(tree, cheminBase = "") {
  let result = [];

  for (const item of tree) {
    const chemin = cheminBase ? `${cheminBase}/${item.name}` : item.name;

    if (item.type === "folder") {
      const enfants = flattenTree(item.children || [], chemin);
      const images = (item.children || []).filter((c) => c.type === "image");

      // ✅ inclure tous les dossiers, même sans image, s’ils ont des enfants ou pas
      result.push({
        id: chemin.replace(/\//g, "_"),
        titre: item.name,
        dossier: chemin,
        continent: chemin.split("/")[0],
        pages:
          images.length > 0
            ? [
                {
                  nom: "page 1",
                  images: images.map((img) => img.name),
                },
              ]
            : [],
      });

      result = [...result, ...enfants];
    }
  }

  return result;
}

export default function CollectionPage() {
  const [filtre, setFiltre] = useState("Tous");
  const [albums, setAlbums] = useState([]);
  const [index, setIndex] = useState(0);
  const [chemin, setChemin] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((data) => {
        const flat = flattenTree(data);
        setAlbums(flat);
      })
      .catch((err) => console.error("Erreur chargement albums-tree.json", err));
  }, []);

  useEffect(() => {
    if (albums.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % albums.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [albums]);

  const currentAlbum = albums.length > 0 ? albums[index] : null;

  const getCover = (album) => {
    try {
      if (album.pages?.[0]?.images?.[0]) {
        const image = album.pages[0].images[0];
        return `/images/albums/${album.dossier}/${album.pages[0].nom}/${image}`;
      }
    } catch {
      return "/placeholder.jpg";
    }
    return "/placeholder.jpg";
  };

  const cheminsDisponibles = albums
    .filter((a) => filtre === "Tous" || a.continent?.toUpperCase() === filtre)

    .map((a) => a.dossier);

  const niveauActuel = chemin ? chemin.split("/").length : 0;

  const sousDossiers = Array.from(
    new Set(
      cheminsDisponibles
        .filter((c) => c.startsWith(chemin))
        .map((c) => {
          const parts = c.split("/");
          if (parts.length <= niveauActuel) return null;
          return parts.slice(0, niveauActuel + 1).join("/");
        })
        .filter(Boolean)
    )
  ).sort();

  const affichage = sousDossiers.map((dossierPath) => {
    const album = albums.find((a) => a.dossier === dossierPath);
    const contientAlbums = albums.some((a) =>
      a.dossier.startsWith(`${dossierPath}/`)
    );

    return {
      chemin: dossierPath,
      titre: dossierPath.split("/").pop(),
      continent: album?.continent || dossierPath.split("/")[0],
      image: album ? getCover(album) : "/placeholder.jpg",
      estFeuille: !!album, // vrai album avec images
      contientSousAlbums: contientAlbums,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        📚 <span>Albums de la Collection</span>
      </h1>

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

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFiltre(cat);
              setChemin("");
            }}
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

      {chemin && (
        <button
          onClick={() => setChemin(chemin.split("/").slice(0, -1).join("/"))}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ⬅ Retour à {chemin.split("/").slice(-2, -1)[0] || "racine"}
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {affichage.map((item) => (
          <div
            key={item.chemin}
            onClick={() => {
              if (item.estFeuille && !item.contientSousAlbums) {
                const album = albums.find((a) => a.dossier === item.chemin);
                if (album) navigate(`/album/${album.id}`);
              } else {
                setChemin(item.chemin);
              }
            }}
            className="cursor-pointer bg-white shadow rounded-lg overflow-hidden hover:scale-105 hover:shadow-xl transition duration-300"
          >
            <img
              src={item.image}
              alt={item.titre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.titre}
              </h3>
              <p className="text-sm text-gray-500">{item.continent || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
