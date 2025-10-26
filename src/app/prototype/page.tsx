import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export default function Prototype() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Load Heat plugin
        const heatScript = document.createElement('script');
        heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
        document.head.appendChild(heatScript);

        script.onload = () => {
          initMap();
        };
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.L) return;

      const MAP_CENTER = [22.7196, 75.8577];
      const MAP_ZOOM = 11;
      const DUMMY_NDVI_RESOLUTION = 0.0001;

      const farmData = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": { "id": "farm_1", "name": "Farm Alpha (Near Pithampur)" },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[
                [75.7050, 22.6100], [75.7080, 22.6100], [75.7080, 22.6120], [75.7050, 22.6120], [75.7050, 22.6100]
              ]]
            }
          },
          {
            "type": "Feature",
            "properties": { "id": "farm_2", "name": "Farm Beta (Near Sanwer)" },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[
                [75.8300, 22.8550], [75.8330, 22.8555], [75.8325, 22.8580], [75.8295, 22.8575], [75.8300, 22.8550]
              ]]
            }
          },
          {
            "type": "Feature",
            "properties": { "id": "farm_3", "name": "Farm Gamma (Irregular)" },
            "geometry": {
              "type": "Polygon",
              "coordinates": [[
                [75.950, 22.750], [75.952, 22.751], [75.953, 22.753], [75.951, 22.754],[75.949, 22.752], [75.950, 22.750]
              ]]
            }
          }
        ]
      };

      const map = window.L.map(mapRef.current).setView(MAP_CENTER, MAP_ZOOM);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const farmLayer = window.L.geoJSON(farmData, {
        style: {
          fillColor: '#60a5fa',
          weight: 2,
          opacity: 1,
          color: '#3b82f6',
          fillOpacity: 0.3
        },
        onEachFeature: (feature: any, layer: any) => {
          const farmName = feature.properties.name || 'Unnamed Farm';
          layer.bindPopup(`<b>${farmName}</b><br>ID: ${feature.properties.id}`);
        }
      }).addTo(map);

      window.L.control.scale({ imperial: false }).addTo(map);
    };

    loadLeaflet();
  }, []);

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">GeoYield Prototype</h1>
        </div>
        <p className="text-sm text-gray-500 text-center sm:text-right">Farm-Level Yield Potential Monitoring</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label htmlFor="farmSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Farm:</label>
            <select id="farmSelect" name="farmSelect" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
              <option value="">-- Select a Farm --</option>
              <option value="farm_1">Farm Alpha (Near Pithampur)</option>
              <option value="farm_2">Farm Beta (Near Sanwer)</option>
              <option value="farm_3">Farm Gamma (Irregular)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
            <input type="date" id="dateSelect" name="dateSelect" className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm" />
          </div>

          <button id="analyzeBtn" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50" disabled>
            Analyze Farm
          </button>

          <div id="resultsPanel" className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3 hidden">
            <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
            <p className="text-sm text-gray-600">Selected Farm: <span id="selectedFarmName" className="font-medium text-gray-900">N/A</span></p>
            <p className="text-sm text-gray-600">Analysis Date: <span id="analysisDate" className="font-medium text-gray-900">N/A</span></p>
            <p className="text-sm text-gray-600">Simulated Peak NDVI: <span id="peakNdvi" className="font-medium text-gray-900">N/A</span></p>
            <p className="text-sm text-gray-600">Yield Potential Index (YPI): <span id="ypiValue" className="font-medium text-gray-900 text-lg">N/A</span></p>
            <p className="text-xs text-gray-500 italic">Note: NDVI & YPI are simulated based on dummy data representing variability.</p>
          </div>

          <div id="legendPanel" className="bg-gray-50 p-4 rounded-md border border-gray-200 hidden">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Simulated NDVI Legend</h4>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div> <span className="text-xs text-gray-700">Low (Stressed/Bare)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div> <span className="text-xs text-gray-700">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-600"></div> <span className="text-xs text-gray-700">High (Healthy Veg.)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-200 rounded-md shadow-inner">
          <div id="map" ref={mapRef} className="w-full h-96 rounded-md z-0"></div>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>GeoYield Prototype v0.1 | IndoriPohe Team | SIH 2025</p>
        <p className="mt-1">This prototype uses simulated data for demonstration purposes.</p>
      </footer>
    </div>
  );
}
