import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const continentFiles = [
  "africa.geo.json",
  "europe.geo.json",
  "asia.geo.json",
  "north america.geo.json",
  "south america.geo.json",
  "oceania.geo.json",
  "antarctica.geo.json",
];

export default function WorldMap({ hoveredContinent, continentStats }) {
  const [geoData, setGeoData] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    Promise.all(
      continentFiles.map((file) =>
        fetch(`/worldmap/${file}`).then((res) => res.json())
      )
    ).then((results) => {
      const allFeatures = results.flatMap((data) => data.features);
      setGeoData(allFeatures);
    });
  }, []);

  const normalize = (str) => str?.toLowerCase().trim();
  const activeContinent = hoveredContinent || hovered;
  const stats = continentStats?.[activeContinent];

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 relative">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto" }}
      >
        {geoData.length > 0 && (
          <Geographies
            geography={{ type: "FeatureCollection", features: geoData }}
          >
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.CONTINENT;
                const isActive =
                  normalize(name) === normalize(hoveredContinent) ||
                  normalize(name) === normalize(hovered);

                return (
                  <Geography
                    key={geo.rsmKey || name}
                    geography={geo}
                    onMouseEnter={() => setHovered(name)}
                    onMouseLeave={() => setHovered(null)}
                    fill={isActive ? "#f87171" : "#e5e7eb"}
                    stroke="#ccc"
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        )}
      </ComposableMap>

      {activeContinent && stats && (
        <div className="absolute left-4 top-4 bg-white shadow-md rounded px-4 py-3 text-sm text-gray-800">
          <strong>🌍 {activeContinent}</strong>
          <br />
          📁 {stats.albums} albums
          <br />
          📬 {stats.timbres} timbres
          <br />
          💶 {stats.cote.toFixed(2)} €
        </div>
      )}
    </div>
  );
}
