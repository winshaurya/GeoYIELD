import { useParams } from 'react-router-dom';
import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import YieldGauge from '@/components/charts/YieldGauge';
import LineChart from '@/chart/LineChart';

export default function FarmDetail() {
  const { farmId } = useParams<{ farmId: string }>();
  const { data, loading, error } = useFarmData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  const farm = data.find(f => f.farmId === farmId);
  if (!farm) return <div>Farm not found</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Details */}
        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Farmer Name</h3>
              <p>{farm.farmerName}</p>
            </div>
            <div>
              <h3 className="font-semibold">Farm ID</h3>
              <p>{farm.farmId}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{farm.village}, {farm.district}, {farm.state}</p>
            </div>
            <div>
              <h3 className="font-semibold">Crop Type</h3>
              <p>{farm.cropType}</p>
            </div>
            <div>
              <h3 className="font-semibold">Sowing Date</h3>
              <p>{new Date(farm.sowingDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* UAV Image Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Futuristic UAV View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
              {/* Base image placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <p className="text-muted-foreground">Farm Aerial View</p>
              </div>

              {/* Futuristic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--primary)), hsl(var(--primary)) 1px, transparent 1px, transparent 20px),
                                   repeating-linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)) 1px, transparent 1px, transparent 20px)`,
                }}
              ></div>

              {/* Animated scan hotspots */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full"></div>

              <div className="absolute bottom-6 right-6 w-4 h-4 bg-secondary rounded-full animate-ping"></div>
              <div className="absolute bottom-6 right-6 w-4 h-4 bg-secondary rounded-full"></div>

              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-500 rounded-full"></div>

              {/* Scan lines */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-1/4 left-0 w-full h-0.5 bg-secondary animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-secondary animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yield Gauge */}
            <div>
              <h3 className="font-semibold mb-4">Yield Performance</h3>
              <div className="h-64">
                <YieldGauge
                  predictedYield={farm.predictedYield}
                  expectedYield={farm.expectedYield}
                />
              </div>
            </div>

            {/* Time Series Charts */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">NDVI History</h3>
                <div className="h-32">
                  <TimeSeriesChart
                    data={farm.ndviHistory}
                    title="NDVI"
                    color="hsl(var(--primary))"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Soil Moisture History</h3>
                <div className="h-32">
                  <TimeSeriesChart
                    data={farm.soilMoistureHistory}
                    title="Soil Moisture (%)"
                    color="hsl(var(--secondary))"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
