import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export default function Prototype() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    farmName: string;
    date: string;
    peakNdvi: string;
    ypi: string;
  } | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const MAP_CENTER = [22.7196, 75.8577];
  const MAP_ZOOM = 11;
  const DUMMY_NDVI_RESOLUTION = 0.0001; // Approx 10m in degrees at this latitude

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

  useEffect(() => {
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
          setDefaultDate();
        };
      } else {
        initMap();
        setDefaultDate();
      }
    };

    loadLeaflet();
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    const map = window.L.map(mapRef.current).setView(MAP_CENTER, MAP_ZOOM);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const farmLayer = window.L.geoJSON(farmData, {
      style: getFarmStyle,
      onEachFeature: onEachFarmFeature
    }).addTo(map);

    window.L.control.scale({ imperial: false }).addTo(map);

    // Store references for later use
    (mapRef.current as any).mapInstance = map;
    (mapRef.current as any).farmLayer = farmLayer;
    (mapRef.current as any).lastSelectedFarmLayer = null;
    (mapRef.current as any).selectedFarmFeature = null;
  };

  const getFarmStyle = (feature: any) => {
    return {
      fillColor: '#60a5fa',
      weight: 2,
      opacity: 1,
      color: '#3b82f6',
      fillOpacity: 0.3
    };
  };

  const getSelectedFarmStyle = (feature: any) => {
    return {
      fillColor: '#fcd34d',
      weight: 3,
      opacity: 1,
      color: '#f59e0b',
      fillOpacity: 0.6
    };
  };

  const onEachFarmFeature = (feature: any, layer: any) => {
    const farmName = feature.properties.name || 'Unnamed Farm';
    layer.bindPopup(`<b>${farmName}</b><br>ID: ${feature.properties.id}`);

    layer.on('click', (e: any) => {
      const clickedLayer = e.target;
      const farmId = clickedLayer.feature.properties.id;

      // Update select dropdown
      setSelectedFarmId(farmId);

      // Update map style and state
      highlightFarm(farmId, clickedLayer);

      // Enable analyze button if date is also selected
      // checkAnalyzeButtonState();

      // Zoom to farm
      const map = (mapRef.current as any).mapInstance;
      if (map) {
        map.fitBounds(clickedLayer.getBounds(), { padding: [50, 50] });
      }
    });
  };

  const highlightFarm = (farmId: string, clickedLayer: any = null) => {
    if (!mapRef.current) return;

    const farmLayer = (mapRef.current as any).farmLayer;
    const lastSelectedFarmLayer = (mapRef.current as any).lastSelectedFarmLayer;

    // Reset style of previously selected layer
    if (lastSelectedFarmLayer) {
      farmLayer.resetStyle(lastSelectedFarmLayer);
    }

    // Find the layer corresponding to farmId if not provided
    let targetLayer = clickedLayer;
    if (!targetLayer) {
      farmLayer.eachLayer((layer: any) => {
        if (layer.feature.properties.id === farmId) {
          targetLayer = layer;
        }
      });
    }

    // Apply selected style
    if (targetLayer) {
      targetLayer.setStyle(getSelectedFarmStyle(targetLayer.feature));
      targetLayer.bringToFront();
      (mapRef.current as any).lastSelectedFarmLayer = targetLayer;
      (mapRef.current as any).selectedFarmFeature = targetLayer.feature;
    } else {
      (mapRef.current as any).lastSelectedFarmLayer = null;
      (mapRef.current as any).selectedFarmFeature = null;
    }
  };

  const setDefaultDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() - 3);
    if (today > new Date()) {
      today.setDate(today.getDate() - 7);
    }
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleFarmChange = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (farmId) {
      highlightFarm(farmId);
      // Zoom to selected farm
      if (mapRef.current) {
        const map = (mapRef.current as any).mapInstance;
        const farmLayer = (mapRef.current as any).farmLayer;

        if (map && farmLayer) {
          farmLayer.eachLayer((layer: any) => {
            if (layer.feature.properties.id === farmId) {
              map.fitBounds(layer.getBounds(), { padding: [50, 50] });
            }
          });
        }
      }
    } else {
      highlightFarm(''); // Deselect if "-- Select --" is chosen
      if (mapRef.current) {
        const map = (mapRef.current as any).mapInstance;
        if (map) map.setView(MAP_CENTER, MAP_ZOOM);
      }
    }
    clearResults();
    removeNdviLayer();
    setShowLegend(false);
  };

  const clearResults = () => {
    setResults(null);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setResults(null);
    setShowLegend(false);
  };

  const generateDummyNdvi = (bounds: any) => {
    const points = [];
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const step = 0.000045; // Approximately 5 meters in degrees at latitude 22°

    let seedStr = selectedDate!.split('-').join('') + selectedFarmId!.replace(/\D/g,'');
    let seed = parseInt(seedStr) % 2147483647;
    const random = () => {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const centerLat = (sw.lat + ne.lat) / 2;
    const centerLng = (sw.lng + ne.lng) / 2;
    const maxDist = Math.max(ne.lat - sw.lat, ne.lng - sw.lng) / 2;

    // Generate more points for better visualization
    const latSteps = Math.max(Math.ceil((ne.lat - sw.lat) / step), 20);
    const lngSteps = Math.max(Math.ceil((ne.lng - sw.lng) / step), 20);

    for (let i = 0; i < latSteps; i++) {
      for (let j = 0; j < lngSteps; j++) {
        const lat = sw.lat + (i * (ne.lat - sw.lat)) / latSteps;
        const lng = sw.lng + (j * (ne.lng - sw.lng)) / lngSteps;

        const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
        const baseNdvi = 0.2 + 0.6 * Math.max(0, 1 - (dist / (maxDist + 0.0001)));
        const noise = (random() - 0.5) * 0.2;
        let ndviValue = baseNdvi + noise;
        ndviValue = Math.max(0.05, Math.min(0.9, ndviValue));

        points.push([lat, lng, ndviValue]);
      }
    }
    console.log(`Generated ${points.length} dummy NDVI points with 5m resolution.`);
    return points;
  };

  const calculateYpiFromNdvi = (ndviData: any[]) => {
    if (!ndviData || ndviData.length === 0) {
      return { ypi: 0, maxNdvi: 0 };
    }

    let sumNdvi = 0;
    let maxNdvi = 0;
    ndviData.forEach((point: any) => {
      sumNdvi += point[2];
      if (point[2] > maxNdvi) {
        maxNdvi = point[2];
      }
    });

    const avgNdvi = sumNdvi / ndviData.length;
    const ypi = ((avgNdvi - 0.1) / (0.9 - 0.1)) * 100;

    return { ypi: Math.max(0, Math.min(100, ypi)), maxNdvi };
  };

  const displayNdviLayer = (ndviData: any[]) => {
    if (!ndviData || ndviData.length === 0 || !mapRef.current) return;

    try {
      // Filter out any invalid data points
      const validData = ndviData.filter(point =>
        Array.isArray(point) &&
        point.length >= 3 &&
        typeof point[0] === 'number' &&
        typeof point[1] === 'number' &&
        typeof point[2] === 'number' &&
        !isNaN(point[0]) &&
        !isNaN(point[1]) &&
        !isNaN(point[2])
      );

      if (validData.length === 0) {
        console.error('No valid NDVI data points');
        setMessage({ text: 'No valid NDVI data to display', isError: true });
        return;
      }

      console.log('Creating grid visualization with', validData.length, 'points');
      console.log('Sample points:', validData.slice(0, 3));

      const map = (mapRef.current as any).mapInstance;
      if (!map) {
        console.error('Map instance not found');
        return;
      }

      // Remove existing layer first
      removeNdviLayer();

      // Create a layer group for all grid cells
      const gridLayer = window.L.layerGroup();

      // Create individual colored rectangles for each grid cell
      validData.forEach((point: any) => {
        const [lat, lng, ndvi] = point;

        // Determine color based on NDVI value
        let color;
        if (ndvi < 0.3) color = '#dc2626'; // Red - low/stressed
        else if (ndvi < 0.5) color = '#ea580c'; // Orange - medium-low
        else if (ndvi < 0.7) color = '#ca8a04'; // Yellow - medium
        else color = '#16a34a'; // Green - high/healthy

        // Create a small rectangle (approximately 5x5 meters)
        const bounds = [[lat, lng], [lat + 0.000045, lng + 0.000045]];

        const rectangle = window.L.rectangle(bounds, {
          color: color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 1,
          opacity: 0.8
        });

        gridLayer.addLayer(rectangle);
      });

      gridLayer.addTo(map);

      // Store reference for cleanup
      (mapRef.current as any).ndviLayer = gridLayer;
      console.log('Grid layer added successfully with', validData.length, 'cells');

      // Force a map update
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } catch (error) {
      console.error('Error creating grid visualization:', error);
      setMessage({ text: 'Failed to display NDVI data', isError: true });
    }
  };

  const removeNdviLayer = () => {
    if (mapRef.current) {
      const map = (mapRef.current as any).mapInstance;
      const ndviLayer = (mapRef.current as any).ndviLayer;

      if (ndviLayer && map && map.hasLayer(ndviLayer)) {
        map.removeLayer(ndviLayer);
        (mapRef.current as any).ndviLayer = null;
        console.log("NDVI Layer removed.");
      }
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFarmId || !selectedDate) {
      setMessage({ text: 'Please select a farm and a date first.', isError: true });
      return;
    }

    setIsLoading(true);
    setResults(null);
    setShowLegend(false);
    removeNdviLayer(); // Clear previous NDVI if any

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Get selected farm bounds
      const farmLayer = (mapRef.current as any).farmLayer;
      let selectedBounds = null;

      farmLayer.eachLayer((layer: any) => {
        if (layer.feature.properties.id === selectedFarmId) {
          selectedBounds = layer.getBounds();
        }
      });

      if (!selectedBounds) {
        throw new Error('Could not get farm bounds');
      }

      // Generate NDVI data (simulating 5x5 meter grid)
      const dummyNdviData = generateDummyNdvi(selectedBounds);
      console.log('Generated', dummyNdviData.length, 'NDVI points');

      if (dummyNdviData.length === 0) {
        throw new Error('No NDVI data generated');
      }

      // Calculate YPI and Peak NDVI from the data
      const { ypi, maxNdvi } = calculateYpiFromNdvi(dummyNdviData);

      // Display NDVI heatmap
      displayNdviLayer(dummyNdviData);
      setShowLegend(true);

      // Show results
      const farmName = selectedFarmId === 'farm_1' ? 'Farm Alpha (Near Pithampur)' :
                      selectedFarmId === 'farm_2' ? 'Farm Beta (Near Sanwer)' :
                      'Farm Gamma (Irregular)';

      setResults({
        farmName,
        date: selectedDate,
        peakNdvi: maxNdvi.toFixed(3),
        ypi: ypi.toFixed(2)
      });

      setMessage({ text: 'Analysis simulation complete!', isError: false });
    } catch (error: any) {
      console.error('Analysis error:', error);
      setMessage({ text: `Error during simulation: ${error.message}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
            <select
              id="farmSelect"
              name="farmSelect"
              value={selectedFarmId || ''}
              onChange={(e) => handleFarmChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">-- Select a Farm --</option>
              <option value="farm_1">Farm Alpha (Near Pithampur)</option>
              <option value="farm_2">Farm Beta (Near Sanwer)</option>
              <option value="farm_3">Farm Gamma (Irregular)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
            <input
              type="date"
              id="dateSelect"
              name="dateSelect"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            />
          </div>

          <button
            onClick={handleAnalysis}
            disabled={!selectedFarmId || !selectedDate || isLoading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Analyze Farm
          </button>

          {results && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
              <p className="text-sm text-gray-600">Selected Farm: <span className="font-medium text-gray-900">{results.farmName}</span></p>
              <p className="text-sm text-gray-600">Analysis Date: <span className="font-medium text-gray-900">{results.date}</span></p>
              <p className="text-sm text-gray-600">Simulated Peak NDVI: <span className="font-medium text-gray-900">{results.peakNdvi}</span></p>
              <p className="text-sm text-gray-600">Yield Potential Index (YPI): <span className="font-medium text-gray-900 text-lg">{results.ypi}</span></p>
              <p className="text-xs text-gray-500 italic">Note: NDVI & YPI are simulated based on dummy data representing variability.</p>
            </div>
          )}

          {showLegend && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
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
          )}
        </div>

        <div className="lg:col-span-2 bg-gray-200 rounded-md shadow-inner">
          <div ref={mapRef} className="w-full" style={{ height: '60vh' }}></div>
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md text-sm font-medium text-white ${message.isError ? 'bg-red-500' : 'bg-blue-500'}`}>
          {message.text}
        </div>
      )}

      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>GeoYield Prototype v0.1 | IndoriPohe Team | SIH 2025</p>
        <p className="mt-1">This prototype uses simulated data for demonstration purposes.</p>
      </footer>
    </div>
  );
}
