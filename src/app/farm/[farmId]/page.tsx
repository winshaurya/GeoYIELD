import { useParams } from 'react-router-dom';
import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import YieldGauge from '@/components/charts/YieldGauge';

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
            <CardTitle>UAV Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg"></div>
              <div className="absolute inset-4 border-2 border-primary/30 rounded"></div>
              <div className="absolute top-2 left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-muted-foreground">UAV Image Placeholder</p>
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
