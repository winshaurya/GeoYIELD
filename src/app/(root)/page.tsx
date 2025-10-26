import { useState } from 'react';
import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IndiaMap from '@/components/map/IndiaMap';
import CropDistributionPie from '@/components/charts/CropDistributionPie';
import StateYieldBar from '@/components/charts/StateYieldBar';
import YieldGauge from '@/components/charts/YieldGauge';

export default function Dashboard() {
  const { data, loading, error } = useFarmData();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  if (!data) return <div className="flex items-center justify-center h-screen">No data available</div>;

  const filteredData = selectedState ? data.filter(farm => farm.state === selectedState) : data;

  // Calculate KPI metrics
  const totalFarms = filteredData.length;
  const avgPredictedYield = filteredData.reduce((sum, farm) => sum + farm.predictedYield, 0) / totalFarms || 0;
  const stressedFarms = filteredData.filter(farm => farm.healthStatus !== 'Healthy').length;
  const cropTypes = filteredData.reduce((acc, farm) => {
    acc[farm.cropType] = (acc[farm.cropType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate health status distribution
  const healthStatusCounts = filteredData.reduce((acc, farm) => {
    acc[farm.healthStatus] = (acc[farm.healthStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate district-level yield variance for selected state
  const districtVariance = selectedState ? (() => {
    const districtMap = new Map<string, { total: number; count: number }>();
    filteredData.forEach(farm => {
      const existing = districtMap.get(farm.district) || { total: 0, count: 0 };
      districtMap.set(farm.district, {
        total: existing.total + farm.yieldVariancePercent,
        count: existing.count + 1,
      });
    });
    return Array.from(districtMap.entries())
      .map(([district, { total, count }]) => ({
        district,
        avgVariance: total / count,
      }))
      .sort((a, b) => b.avgVariance - a.avgVariance)
      .slice(0, 5);
  })() : [];

  return (
    <div className="flex h-screen">
      {/* Map Section */}
      <div className="flex-1 p-4">
        <IndiaMap
          onStateClick={setSelectedState}
          selectedState={selectedState}
          farmData={data}
        />
      </div>

      {/* Analytics Sidebar */}
      <div className="w-96 bg-card border-l p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedState ? `Analytics for: ${selectedState}` : 'National Analytics'}
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFarms.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPredictedYield.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Area Under Stress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stressedFarms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crops Monitored</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(cropTypes).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedState ? `Crop Distribution in ${selectedState}` : 'National Crop Distribution'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <CropDistributionPie data={cropTypes} />
              </div>
            </CardContent>
          </Card>

          {selectedState ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">District-Level Yield Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <StateYieldBar data={districtVariance} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">National Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <YieldGauge data={healthStatusCounts} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
