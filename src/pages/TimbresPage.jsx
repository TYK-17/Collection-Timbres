import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  const decodedPath = decodeURIComponent(albumId);

  const cheminLisible = decodedPath
    .split("/")
    .map((segment) => segment.replace(/_/g, " "))
    .join(" / ");

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

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("collection-timbres")) || [];
    const filtered = all.filter((t) => t.album === decodedPath);
    setTimbres(filtered);
  }, [decodedPath]);

  useEffect(() => {
    fetch("/albums-tree.json")
      .then((res) => res.json())
      .then((tree) => {
        const flat = flattenTree(tree);

        // 👇 Debug pour afficher les dossiers dispos
        console.log("📦 Tous les dossiers disponibles :");
        flat.forEach((a) => console.log(a.dossier));

        const fullPath = `albums/${decodedPath}`;
        const album = flat.find((a) => a.dossier === fullPath);

        console.log("📁 albumId =", decodedPath);
        console.log("🔍 Album trouvé :", album);

        if (!album || !album.json) {
          console.warn("❌ Aucun fichier JSON associé à ce dossier");
          return;
        }

        const filename = album.json;
        const url = `/data/${album.dossier}/${filename}`;
        console.log("🔽 Chargement JSON :", url);

        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`Erreur: ${res.statusText}`);
            return res.json();
          })
          .then((data) => {
            const pagesArray = Object.keys(data).map((key) => ({
              nom: key,
              timbres: data[key],
            }));
            setExcelPages(pagesArray);
          })
          .catch((err) => {
            console.error("❌ Erreur de chargement :", err);
            setExcelPages([]);
          });
      });
  }, [decodedPath]);

  const saveToLocal = (newList) => {
    const all = JSON.parse(localStorage.getItem("collection-timbres")) || [];
    const others = all.filter((t) => t.album !== decodedPath);
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
    const newTimbre = { ...form, id: uuidv4(), album: decodedPath };
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

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      {/* Bouton retour */}
      <div className="mb-4">
        <Link
          to="/collection"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ⬅ Retour à la collection
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">📘 Album : {cheminLisible}</h1>

      {/* Barre de recherche */}
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
