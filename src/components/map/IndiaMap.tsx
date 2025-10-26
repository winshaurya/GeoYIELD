import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface IndiaMapProps {
  onStateClick: (state: string) => void;
  selectedState: string | null;
  farmData: any[];
}

const INDIA_TOPO_JSON = 'https://raw.githubusercontent.com/datameet/india-states/master/india-states.geojson';

export default function IndiaMap({ onStateClick, selectedState, farmData }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const getStateStats = (stateName: string) => {
    const stateFarms = farmData.filter(farm => farm.state === stateName);
    const avgYield = stateFarms.length > 0
      ? stateFarms.reduce((sum, farm) => sum + farm.predictedYield, 0) / stateFarms.length
      : 0;
    return {
      farms: stateFarms.length,
      avgYield: avgYield.toFixed(2)
    };
  };

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [78.9629, 22.5937] // Center of India
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name || geo.properties.STATE;
                const isSelected = selectedState === stateName;
                const isHovered = hoveredState === stateName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isSelected
                        ? 'hsl(var(--primary))'
                        : isHovered
                        ? 'hsl(var(--primary) / 0.8)'
                        : 'hsl(var(--secondary) / 0.3)'
                    }
                    stroke="hsl(var(--secondary))"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: 'pointer' },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onStateClick(isSelected ? null : stateName)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {hoveredState && (
        <div className="absolute top-4 left-4 bg-card p-3 rounded-lg shadow-lg border text-sm z-10">
          <p><strong>State:</strong> {hoveredState}</p>
          <p><strong>Farms Monitored:</strong> {getStateStats(hoveredState).farms}</p>
          <p><strong>Avg. Predicted Yield:</strong> {getStateStats(hoveredState).avgYield} tons/ha</p>
        </div>
      )}
    </div>
  );
}
