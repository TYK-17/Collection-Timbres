// App complète avec formulaire en haut, navigation, stats, filtres, affichage galerie
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [timbres, setTimbres] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    pays: "",
    annee: "",
    statut: "",
    album: "",
    classement: "",
    cote: "",
    oblitération: "",
    notes: "",
    image: "",
    etatCodes: [],
    ME: false,
  });
  const [filters, setFilters] = useState({ pays: "", annee: "", statut: "", album: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("collection-timbres");
    if (saved) {
      setTimbres(JSON.parse(saved));
    } else {
      fetch("/timbres_france_1849_1899_all_pages.json")
        .then((res) => res.json())
        .then((data) => {
          const pages = Object.values(data).flat();
          setTimbres(pages);
          localStorage.setItem("collection-timbres", JSON.stringify(pages));
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("collection-timbres", JSON.stringify(timbres));
  }, [timbres]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, image: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const addTimbre = () => {
    const newTimbre = { ...form, id: uuidv4() };
    setTimbres([...timbres, newTimbre]);
    setForm({
      nom: "",
      pays: "",
      annee: "",
      statut: "",
      album: "",
      classement: "",
      cote: "",
      oblitération: "",
      notes: "",
      image: "",
      etatCodes: [],
      ME: false,
    });
  };

  const deleteTimbre = (id) => {
    setTimbres(timbres.filter((t) => t.id !== id));
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(timbres, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ma_collection_timbres.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = timbres.filter((t) => {
    return (
      (!filters.pays || t.pays?.toLowerCase().includes(filters.pays.toLowerCase())) &&
      (!filters.annee || String(t.annee).includes(filters.annee)) &&
      (!filters.statut || t.statut === filters.statut) &&
      (!filters.album || t.album?.toLowerCase().includes(filters.album.toLowerCase())) &&
      (!search || t.nom?.toLowerCase().includes(search.toLowerCase()) || t.notes?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const stats = {
    total: timbres.length,
    oblitérés: timbres.filter((t) => t.statut === "oblitéré").length,
    neufs: timbres.filter((t) => t.statut === "neuf").length,
    variétés: timbres.filter((t) => t.statut === "variété").length,
    auto: timbres.filter((t) => t.statut === "auto-adhésif").length,
    mauvaisEtat: timbres.filter((t) => t.ME).length,
  };

  const albumsDisponibles = [...new Set(timbres.map((t) => t.album).filter(Boolean))];

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">📚 Collection de Timbres</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <input className="border p-1" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="border p-1" placeholder="Pays" name="pays" value={filters.pays} onChange={handleFilter} />
        <input className="border p-1" placeholder="Année" name="annee" value={filters.annee} onChange={handleFilter} />
        <select className="border p-1" name="statut" value={filters.statut} onChange={handleFilter}>
          <option value="">-- Statut --</option>
          <option value="neuf">Neuf</option>
          <option value="oblitéré">Oblitéré</option>
          <option value="variété">Variété</option>
          <option value="auto-adhésif">Auto-adhésif</option>
        </select>
        <select className="border p-1" name="album" value={filters.album} onChange={handleFilter}>
          <option value="">-- Album --</option>
          {albumsDisponibles.map((album) => (
            <option key={album} value={album}>{album}</option>
          ))}
        </select>
        <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={exportJSON}>📤 Exporter JSON</button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">📊 Statistiques</h2>
        <ul className="text-sm">
          <li>Total : {stats.total}</li>
          <li>Oblitérés : {stats.oblitérés}</li>
          <li>Neufs : {stats.neufs}</li>
          <li>Variétés : {stats.variétés}</li>
          <li>Auto-adhésifs : {stats.auto}</li>
          <li>Mauvais état : {stats.mauvaisEtat}</li>
        </ul>
      </div>

      <div className="mb-10 bg-white p-6 rounded shadow border">
        <h2 className="text-xl font-bold mb-4">➕ Ajouter un nouveau timbre</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2" placeholder="Nom" name="nom" value={form.nom} onChange={handleInput} />
          <input className="border p-2" placeholder="Pays" name="pays" value={form.pays} onChange={handleInput} />
          <input className="border p-2" placeholder="Année" name="annee" value={form.annee} onChange={handleInput} />
          <select className="border p-2" name="statut" value={form.statut} onChange={handleInput}>
            <option value="">-- Statut --</option>
            <option value="neuf">Neuf</option>
            <option value="oblitéré">Oblitéré</option>
            <option value="variété">Variété</option>
            <option value="auto-adhésif">Auto-adhésif</option>
          </select>
          <input className="border p-2" placeholder="Album" name="album" value={form.album} onChange={handleInput} />
          <input className="border p-2" placeholder="Classement" name="classement" value={form.classement} onChange={handleInput} />
          <input className="border p-2" placeholder="Cote (€)" name="cote" value={form.cote} onChange={handleInput} />
          <input className="border p-2" placeholder="Oblitération" name="oblitération" value={form.oblitération} onChange={handleInput} />
          <textarea className="border p-2 md:col-span-2" placeholder="Notes" name="notes" value={form.notes} onChange={handleInput}></textarea>
          <input type="file" accept="image/*" onChange={handleImage} className="md:col-span-2" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="ME" checked={form.ME} onChange={handleInput} /> Mauvais état ?
          </label>
          <button onClick={addTimbre} className="bg-green-600 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Liste des Timbres ({filtered.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((timbre) => (
          <div key={timbre.id} className="border rounded shadow p-4 bg-white">
            {timbre.image && <img src={timbre.image} alt="timbre" className="w-full h-40 object-cover rounded" />}
            <h3 className="text-lg font-bold mt-2">{timbre.nom}</h3>
            <p className="text-sm">{timbre.pays} - {timbre.annee}</p>
            <p className="text-sm italic">Statut : {timbre.statut}</p>
            <p className="text-sm">Cote : {timbre.cote} €</p>
            <p className="text-sm">Classement : {timbre.classement}</p>
            <p className="text-sm">Album : {timbre.album}</p>
            <p className="text-sm">Oblitération : {timbre.oblitération}</p>
            <p className="text-sm">Notes : {timbre.notes}</p>
            {timbre.ME && <p className="text-red-600 font-bold">⚠️ Mauvais état</p>}
            <button onClick={() => deleteTimbre(timbre.id)} className="mt-2 text-sm bg-red-500 text-white px-2 py-1 rounded">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
