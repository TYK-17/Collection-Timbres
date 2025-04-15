import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WorldMap from "../components/WorldMap";

export default function SynthesePage() {
  const [data, setData] = useState(null);
  const [hoveredContinent, setHoveredContinent] = useState(null);

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

          <h2 className="text-xl font-bold mb-4 mt-8">
            🌍 Détail par continent
          </h2>

          <WorldMap
            hoveredContinent={hoveredContinent}
            continentStats={data.continents}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(data.continents).map(([continent, stats]) => (
              <div
                key={continent}
                onMouseEnter={() => setHoveredContinent(continent)}
                onMouseLeave={() => setHoveredContinent(null)}
                title="Survoler pour voir le continent sur la carte"
                className="border p-4 rounded bg-white shadow-sm hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold mb-2">🌍 {continent}</h2>
                <ul className="text-gray-700 space-y-1">
                  <li>📁 Albums : {stats.albums}</li>
                  <li>📬 Timbres : {stats.timbres}</li>
                  <li>💶 Cotation totale : {stats.cote.toFixed(2)} €</li>
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
}
