import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SynthesePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/synthese")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error("Erreur synthèse:", err);
        alert("Erreur lors du chargement de la synthèse");
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Synthèse de la collection</h1>
        <Link
          to="/collection"
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          ↩ Retour à la collection
        </Link>
      </div>

      {data ? (
        <>
          {Object.entries(data.continents).map(([continent, stats]) => (
            <div
              key={continent}
              className="border p-4 mb-4 rounded bg-white shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-2">🌍 {continent}</h2>
              <ul className="text-gray-700 space-y-1">
                <li>📁 Albums : {stats.albums}</li>
                <li>📬 Timbres : {stats.timbres}</li>
                <li>💶 Cotation totale : {stats.cote.toFixed(2)} €</li>
              </ul>
            </div>
          ))}

          <div className="border-t pt-4 mt-6 text-lg font-medium">
            <p>
              📦 <strong>Total albums :</strong> {data.total.albums}
            </p>
            <p>
              📬 <strong>Total timbres :</strong> {data.total.timbres}
            </p>
            <p>
              💶 <strong>Cotation totale :</strong> {data.total.cote} €
            </p>
          </div>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
