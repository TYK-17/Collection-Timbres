import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
  const [timbres, setTimbres] = useState([]);
  const [excelPages, setExcelPages] = useState([]);
  const [pageCourante, setPageCourante] = useState(0);
  const [form, setForm] = useState({
    nom: "",
    pays: "",
    annee: "",
    statut: "",
    classement: "",
    cote: "",
    oblitération: "",
    notes: "",
    data: "",
    ME: false,
  });
  const [search, setSearch] = useState("");

  // 🔄 Charger les timbres locaux
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("collection-timbres")) || [];
    const filtered = all.filter((t) => t.album === albumId);
    setTimbres(filtered);
  }, [albumId]);

  // ✅ Charger albums-tree pour trouver le bon fichier JSON
  // ✅ Charger albums-tree pour trouver le bon fichier JSON
  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((tree) => {
        const flat = flattenTree(tree);

        // Trouver l'album avec son chemin
        const album = flat.find(
          (a) => a.dossier.replace(/\//g, "_") === albumId
        );
        console.log("📁 albumId =", albumId);
        console.log("🔍 Album trouvé :", album);

        if (!album || !album.json) {
          console.warn("❌ Aucun fichier JSON associé à ce dossier");
          return;
        }

        const filename = album.json;

        // ✅ Génération de l'URL pour charger le fichier JSON
        const basePath = "/data /"; // Chemin de base

        // Vérifiez si 'album.dossier' commence déjà par 'albums' pour éviter la duplication
        const urlPath = album.dossier.startsWith("albums/")
          ? album.dossier // Si "albums/" est déjà inclus, ne pas le rajouter
          : `albums/${album.dossier}`; // Sinon, ajoutez "albums/"

        const url = `${basePath}/${urlPath}/${filename}`; // Construisez l'URL finale
        console.log("Chargement du fichier JSON depuis : ", url);

        // Charger le fichier JSON depuis l'URL générée
        fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(
                `Erreur de chargement du fichier JSON: ${res.statusText}`
              );
            }
            return res.json(); // Assurez-vous que la réponse est bien du JSON
          })
          .then((data) => {
            const pagesArray = Object.keys(data).map((key) => ({
              nom: key,
              timbres: data[key],
            }));
            setExcelPages(pagesArray);
          })
          .catch((err) => {
            console.error("❌ Erreur de chargement du fichier JSON :", err);
            setExcelPages([]); // Gestion propre de l'erreur
          });
      });
  }, [albumId]);

  const saveToLocal = (newList) => {
    const all = JSON.parse(localStorage.getItem("collection-timbres")) || [];
    const others = all.filter((t) => t.album !== albumId);
    const updated = [...others, ...newList];
    localStorage.setItem("collection-timbres", JSON.stringify(updated));
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handledata = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, data: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const addTimbre = () => {
    const newTimbre = { ...form, id: uuidv4(), album: albumId };
    const updated = [...timbres, newTimbre];
    setTimbres(updated);
    saveToLocal(updated);
    setForm({
      nom: "",
      pays: "",
      annee: "",
      statut: "",
      classement: "",
      cote: "",
      oblitération: "",
      notes: "",
      data: "",
      ME: false,
    });
  };

  const deleteTimbre = (id) => {
    const updated = timbres.filter((t) => t.id !== id);
    setTimbres(updated);
    saveToLocal(updated);
  };

  const filtered = timbres.filter(
    (t) =>
      t.nom.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ On place cette déclaration AVANT le return
  const cheminLisible = albumId
    .split("/")
    .map((segment) => decodeURIComponent(segment).replace(/_/g, " "))
    .join(" / ");

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">📘 Album : {cheminLisible}</h1>

      <input
        className="border px-3 py-2 mb-4 w-full"
        placeholder="🔍 Rechercher un timbre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input
          className="border p-2"
          placeholder="Nom"
          name="nom"
          value={form.nom}
          onChange={handleInput}
        />
        <input
          className="border p-2"
          placeholder="Pays"
          name="pays"
          value={form.pays}
          onChange={handleInput}
        />
        <input
          className="border p-2"
          placeholder="Année"
          name="annee"
          value={form.annee}
          onChange={handleInput}
        />
        <input
          className="border p-2"
          placeholder="Classement"
          name="classement"
          value={form.classement}
          onChange={handleInput}
        />
        <input
          className="border p-2"
          placeholder="Cote (€)"
          name="cote"
          value={form.cote}
          onChange={handleInput}
        />
        <input
          className="border p-2"
          placeholder="Oblitération"
          name="oblitération"
          value={form.oblitération}
          onChange={handleInput}
        />
        <textarea
          className="border p-2 col-span-2"
          placeholder="Notes"
          name="notes"
          value={form.notes}
          onChange={handleInput}
        ></textarea>
        <input type="file" accept="data/*" onChange={handledata} />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="ME"
            checked={form.ME}
            onChange={handleInput}
          />
          Mauvais état ?
        </label>
        <button
          onClick={addTimbre}
          className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
        >
          Ajouter
        </button>
      </div>
      {/* Timbres locaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white border rounded shadow p-4">
            {t.data && (
              <img
                src={t.data}
                alt="timbre"
                className="w-full h-48 object-cover mb-2"
              />
            )}
            <h3 className="font-bold text-lg">{t.nom}</h3>
            <p className="text-sm text-gray-600">
              {t.pays} - {t.annee}
            </p>
            <p className="text-sm italic">Statut : {t.statut}</p>
            <p className="text-sm">Classement : {t.classement}</p>
            <p className="text-sm">Cote : {t.cote} €</p>
            <p className="text-sm">Oblitération : {t.oblitération}</p>
            <p className="text-sm">Notes : {t.notes}</p>
            {t.ME && <p className="text-red-600 font-bold">⚠️ Mauvais état</p>}
            <button
              onClick={() => deleteTimbre(t.id)}
              className="mt-2 text-sm bg-red-500 text-white px-2 py-1 rounded"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
      {/* Excel JSON affichage */}
      {excelPages.length > 0 && (
        <div className="overflow-x-auto mt-16">
          <h2 className="text-xl font-bold mb-4">
            📄 Timbres depuis Excel (page {pageCourante + 1})
          </h2>
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Pays</th>
                <th className="border px-4 py-2">Année</th>
                <th className="border px-4 py-2">Statut</th>
                <th className="border px-4 py-2">Classement</th>
                <th className="border px-4 py-2">Cote (€)</th>
                <th className="border px-4 py-2">Oblitération</th>
                <th className="border px-4 py-2">Notes</th>
                <th className="border px-4 py-2">M.E.</th>
              </tr>
            </thead>
            <tbody>
              {excelPages[pageCourante].timbres.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{t.nom}</td>
                  <td className="border px-4 py-2">{t.pays}</td>
                  <td className="border px-4 py-2">{t.annee}</td>
                  <td className="border px-4 py-2">{t.statut}</td>
                  <td className="border px-4 py-2">{t.classement}</td>
                  <td className="border px-4 py-2">{t.cote}</td>
                  <td className="border px-4 py-2">{t.oblitération}</td>
                  <td className="border px-4 py-2">{t.notes}</td>
                  <td className="border px-4 py-2">{t.ME ? "✅" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPageCourante((p) => Math.max(p - 1, 0))}
              disabled={pageCourante === 0}
              className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              ⬅ Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {pageCourante + 1} / {excelPages.length}
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
        </div>
      )}
    </div>
  );
}
