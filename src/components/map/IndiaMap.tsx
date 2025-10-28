import React, { useState } from 'react'; // Only useState is needed for this component's logic
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Define the exact structure for the data shown in the overlay
type HoveredStateData = {
  name: string;
  count: number; // Dummy: e.g., Math.floor(Math.random() * 5000) + 1000
  avgYield: number; // Dummy: e.g., Math.random() * 5 + 3 (tons/ha)
  topCrop: string; // Dummy: e.g., ['Rice', 'Wheat', 'Cotton'][Math.floor(Math.random() * 3)]
  soilHealth: number; // Dummy: e.g., Math.floor(Math.random() * 30) + 70 (%)
  waterStress: "Low" | "Medium" | "High"; // Dummy: random pick
  pestAlerts: number; // Dummy: Math.floor(Math.random() * 10)
  predictedVariance: number; // Dummy: (Math.random() * 10) - 5 (%)
};

// CRITICAL: The path to the GeoJSON file
const GEO_URL = "/maps/india-states.json";

const IndiaMap = () => {
  // State to hold the data for the currently hovered state's overlay.
  // Will be null if no state is hovered.
  const [hoveredStateData, setHoveredStateData] = useState<HoveredStateData | null>(null);

  // NO other state is needed for this component's core functionality (no selected state, no external data fetching in THIS component).

  return (
  // 1. **Relative Wrapper**: This container defines the map's area and acts as the positioning context for the absolute overlay.
  <div className="relative w-full h-[600px] overflow-hidden rounded-lg shadow-lg border border-secondary/20">

    {/* 2. **The Map Component**: This renders the actual interactive map of India. */}
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        scale: 1000,
        center: [80, 22] // Centered on India
      }}
      className="z-10" // Ensure map is below the overlay when overlay is active (via opacity)
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const stateName = geo.properties.st_nm; // Access the state name

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}

                // Mouse Event Handlers for Hover Zoom & Overlay Trigger
                onMouseEnter={() => {
                  // Generate rich dummy data for the overlay
                  const newDummyData: HoveredStateData = {
                    name: stateName,
                    count: Math.floor(Math.random() * 5000) + 1000,
                    avgYield: Math.random() * 5 + 3,
                    topCrop: ['Rice', 'Wheat', 'Cotton', 'Sugarcane'][Math.floor(Math.random() * 4)],
                    soilHealth: Math.floor(Math.random() * 30) + 70, // 70-99%
                    waterStress: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
                    pestAlerts: Math.floor(Math.random() * 10), // 0-9 alerts
                    predictedVariance: parseFloat(((Math.random() * 10) - 5).toFixed(1)), // -5.0 to +5.0 %
                  };
                  setHoveredStateData(newDummyData); // Update state to show overlay
                }}
                onMouseLeave={() => {
                  setHoveredStateData(null); // Hide overlay
                }}

                // Styling for Hover Zoom & Theme
                style={{
                  default: {
                    fill: "hsl(var(--secondary) / 0.3)", // Light Green base
                    stroke: "hsl(var(--secondary))",     // Darker Green border
                    strokeWidth: 0.75,
                    outline: "none",
                    transition: "transform 0.3s ease-in-out, fill 0.3s ease-in-out", // Smooth transitions for both
                    transform: "scale(1)",
                    transformBox: "fill-box", // CRITICAL for centered zoom
                    transformOrigin: "center", // CRITICAL for centered zoom
                  },
                  hover: {
                    fill: "hsl(var(--primary))",    // Bright Orange on hover
                    stroke: "hsl(var(--primary-foreground) / 0.8)", // Brighter border
                    strokeWidth: 1.5,
                    outline: "none",
                    cursor: "pointer",
                    transform: "scale(1.1)", // Zoom in effect
                    transformBox: "fill-box", // Ensure zoom is centered
                    transformOrigin: "center", // Ensure zoom is centered
                  },
                  pressed: { // Style for when the mouse is pressed down on a state (optional but good UX)
                    fill: "hsl(var(--primary) / 0.8)", // Slightly darker orange
                    outline: "none",
                    cursor: "pointer",
                    transform: "scale(1.05)",
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>

    {/* 3. **The Data Overlay**: This div is absolutely positioned to cover the entire map when active. */}
    <div
      className={`absolute inset-0 bg-black/70 backdrop-blur-sm
                  flex items-center justify-center p-8 z-20 // z-20 ensures it's above the map
                  transition-opacity duration-300 ease-in-out
                  ${hoveredStateData ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
    >
      {/* Only render content when data is available, for smoother fade */}
      {hoveredStateData && (
        <div className="text-white max-w-2xl w-full p-8 bg-black/60 rounded-xl border border-primary/50 shadow-2xl animate-fade-in">
          <h2 className="text-5xl font-extrabold text-primary mb-6 text-center tracking-tight">
            {hoveredStateData.name} Analytics
          </h2>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-lg">
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">FARMS MONITORED</span>
              <span className="ml-0 text-3xl font-bold text-green-400">{hoveredStateData.count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">AVG. YIELD (PREDICTED)</span>
              <span className="ml-0 text-3xl font-bold">{hoveredStateData.avgYield.toFixed(2)} <span className="text-xl font-normal">tons/ha</span></span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">TOP CROP</span>
              <span className="ml-0 text-3xl font-bold text-orange-300">{hoveredStateData.topCrop}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">SOIL HEALTH SCORE</span>
              <span className="ml-0 text-3xl font-bold text-green-400">{hoveredStateData.soilHealth}%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">WATER STRESS LEVEL</span>
              <span className={`ml-0 text-3xl font-bold ${hoveredStateData.waterStress === 'High' ? 'text-red-500' : 'text-green-400'}`}>
                {hoveredStateData.waterStress}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-secondary-foreground/70">PEST ALERT COUNT</span>
              <span className="ml-0 text-3xl font-bold text-red-400">{hoveredStateData.pestAlerts}</span>
            </div>
            <div className="flex flex-col col-span-2 text-center mt-4">
              <span className="font-light text-secondary-foreground/70">PREDICTED YIELD VARIANCE</span>
              <span className={`ml-0 text-4xl font-extrabold ${hoveredStateData.predictedVariance < 0 ? 'text-red-500' : 'text-green-400'}`}>
                {hoveredStateData.predictedVariance < 0 ? '↓' : '↑'} {Math.abs(hoveredStateData.predictedVariance).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>

  </div> // End of relative wrapper
  );
};

export default IndiaMap;
