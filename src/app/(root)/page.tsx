import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import { TrendingUp, AlertTriangle, CheckCircle, Droplets, Thermometer, CloudRain, DollarSign, Activity, Eye } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

export default function Dashboard() {
  const { data, loading, error } = useFarmData();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-screen">No data available</div>;

  // Enhanced KPI calculations
  const totalFarms = data.length;
  const totalFarmArea = data.reduce((sum, farm) => sum + farm.farmSize, 0);
  const totalExpectedYield = data.reduce((sum, farm) => sum + farm.expectedYield, 0);
  const totalPredictedYield = data.reduce((sum, farm) => sum + farm.predictedYield, 0);
  const healthyFarms = data.filter(farm => farm.healthStatus === 'Healthy').length;

  // Mock revenue calculation (assuming average price per ton)
  const avgPricePerTon = 20000; // INR
  const totalRevenue = totalPredictedYield * avgPricePerTon;

  // Crop distribution
  const cropData = data.reduce((acc: Record<string, number>, farm) => {
    acc[farm.cropType] = (acc[farm.cropType] || 0) + 1;
    return acc;
  }, {});

  // State-wise analysis
  const stateData = data.reduce((acc: Record<string, { farms: number; area: number; yield: number }>, farm) => {
    if (!acc[farm.state]) {
      acc[farm.state] = { farms: 0, area: 0, yield: 0 };
    }
    acc[farm.state].farms += 1;
    acc[farm.state].area += farm.farmSize;
    acc[farm.state].yield += farm.predictedYield;
    return acc;
  }, {});

  // Mock economic data
  const economicData = {
    costs: totalFarmArea * 5000, // Mock cost per hectare
    revenue: totalRevenue,
    profit: totalRevenue - totalFarmArea * 5000
  };

  // Mock risk data
  const riskData = {
    weather: data.filter(f => f.healthStatus === 'Damaged_Weather').length,
    pest: data.filter(f => f.healthStatus === 'Stressed_Pest').length,
    total: data.length
  };

  // Mock seasonal data (since no season in data, use crop types as proxy)
  const seasonalData = cropData;

  // Mock insurance coverage
  const totalInsuranceCoverage = totalFarmArea * 10000; // Mock

  // Health status distribution
  const healthData = data.reduce((acc: Record<string, number>, farm) => {
    acc[farm.healthStatus] = (acc[farm.healthStatus] || 0) + 1;
    return acc;
  }, {});

  // Soil type distribution
  const soilData = data.reduce((acc: Record<string, number>, farm) => {
    acc[farm.soilType] = (acc[farm.soilType] || 0) + 1;
    return acc;
  }, {});

  // Irrigation type distribution
  const irrigationData = data.reduce((acc: Record<string, number>, farm) => {
    acc[farm.irrigationType] = (acc[farm.irrigationType] || 0) + 1;
    return acc;
  }, {});

  // Time series data aggregation (average across all farms)
  const ndviTrend = data[0]?.ndviHistory.map((_, index) => ({
    date: data[0].ndviHistory[index].date,
    value: data.reduce((sum, farm) => sum + (farm.ndviHistory[index]?.value || 0), 0) / data.length
  })) || [];

  const soilMoistureTrend = data[0]?.soilMoistureHistory.map((_, index) => ({
    date: data[0].soilMoistureHistory[index].date,
    value: data.reduce((sum, farm) => sum + (farm.soilMoistureHistory[index]?.value || 0), 0) / data.length
  })) || [];

  const temperatureTrend = data[0]?.weatherHistory.map((_, index) => ({
    date: data[0].weatherHistory[index].date,
    value: data.reduce((sum, farm) => sum + (farm.weatherHistory[index]?.temperature || 0), 0) / data.length
  })) || [];

  const rainfallTrend = data[0]?.weatherHistory.map((_, index) => ({
    date: data[0].weatherHistory[index].date,
    value: data.reduce((sum, farm) => sum + (farm.weatherHistory[index]?.rainfall || 0), 0) / data.length
  })) || [];

  // Mock crop health metrics (based on NDVI and health status)
  const avgCropHealth = {
    chlorophyllIndex: ndviTrend.length > 0 ? ndviTrend[ndviTrend.length - 1].value * 100 : 0,
    waterStressIndex: soilMoistureTrend.length > 0 ? (60 - soilMoistureTrend[soilMoistureTrend.length - 1].value) / 60 : 0,
    diseaseIncidence: ((totalFarms - healthyFarms) / totalFarms) * 100
  };

  // Mock satellite stats (based on last UAV scan)
  const recentScans = data.filter(f => {
    const scanDate = new Date(f.lastUAVScan);
    const now = new Date();
    const daysDiff = (now.getTime() - scanDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  }).length;
  const satelliteStats = {
    excellentQuality: Math.floor(recentScans * 0.8),
    lowCloudCover: Math.floor(recentScans * 0.7),
    highResolution: Math.floor(recentScans * 0.9)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GeoYIELD Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced Farm Analytics & Yield Prediction Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">System Online</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Farms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalFarms.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">{totalFarmArea.toFixed(1)} hectares total area</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expected Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">₹{(totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-green-600 mt-1">₹{(economicData.profit / 100000).toFixed(1)}L estimated profit</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Healthy Farms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{healthyFarms}</div>
            <p className="text-xs text-purple-600 mt-1">{((healthyFarms / totalFarms) * 100).toFixed(1)}% of total farms</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{riskData.weather + riskData.pest}</div>
            <p className="text-xs text-orange-600 mt-1">High risk farms requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State-wise Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>State-wise Farm Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(stateData),
                  datasets: [
                    {
                      label: 'Number of Farms',
                      data: Object.values(stateData).map((s) => s.farms),
                      backgroundColor: 'hsl(var(--primary))',
                      borderColor: 'hsl(var(--primary))',
                      borderWidth: 1,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Average Yield (tons/ha)',
                      data: Object.values(stateData).map((s) => s.yield / s.farms),
                      backgroundColor: 'hsl(var(--secondary))',
                      borderColor: 'hsl(var(--secondary))',
                      borderWidth: 1,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          if (context.datasetIndex === 0) {
                            return `${context.parsed.y} farms`;
                          }
                          return `${context.parsed.y?.toFixed(1)} tons/ha`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Number of Farms',
                      },
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Average Yield (tons/ha)',
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Crop Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: Object.keys(cropData),
                  datasets: [
                    {
                      data: Object.values(cropData),
                      backgroundColor: [
                        'hsl(var(--primary))',
                        'hsl(var(--secondary))',
                        '#10b981', // emerald-500
                        '#f59e0b', // amber-500
                      ],
                      borderWidth: 2,
                      borderColor: 'hsl(var(--background))',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} farms (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NDVI Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              NDVI Trend (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: ndviTrend.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'NDVI',
                      data: ndviTrend.map(item => item.value),
                      borderColor: 'hsl(var(--primary))',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'NDVI Value',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Soil Moisture Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              Soil Moisture Trend (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: soilMoistureTrend.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Soil Moisture (%)',
                      data: soilMoistureTrend.map(item => item.value),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Moisture (%)',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-600" />
              Temperature Trend (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: temperatureTrend.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Temperature (°C)',
                      data: temperatureTrend.map(item => item.value),
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: 'Temperature (°C)',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rainfall Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              Rainfall Trend (Average)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: rainfallTrend.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Rainfall (mm)',
                      data: rainfallTrend.map(item => item.value),
                      borderColor: '#06b6d4',
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Rainfall (mm)',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental & Health Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>Farm Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Radar
                data={{
                  labels: ['Healthy', 'Water Stress', 'Pest Stress', 'Weather Damage'],
                  datasets: [
                    {
                      label: 'Farm Count',
                      data: [
                        healthData['Healthy'] || 0,
                        healthData['Stressed_Water'] || 0,
                        healthData['Stressed_Pest'] || 0,
                        healthData['Damaged_Weather'] || 0,
                      ],
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      borderColor: 'hsl(var(--primary))',
                      borderWidth: 2,
                      pointBackgroundColor: 'hsl(var(--primary))',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      grid: {
                        color: 'hsl(var(--muted-foreground) / 0.2)',
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Crop Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Health Metrics (Average)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Chlorophyll Index</p>
                  <p className="text-lg font-bold text-green-700">{avgCropHealth.chlorophyllIndex.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Droplets className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Water Stress Index</p>
                  <p className="text-lg font-bold text-blue-700">{avgCropHealth.waterStressIndex.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">Disease Incidence</p>
                  <p className="text-lg font-bold text-red-700">{avgCropHealth.diseaseIncidence.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis & Economic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weather Risk</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {riskData.weather} farms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pest Risk</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {riskData.pest} farms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Insurance Coverage</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  ₹{(totalInsuranceCoverage / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Economic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Economic Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{(economicData.revenue / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Costs</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{(economicData.costs / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Profit</span>
                <span className={`text-lg font-bold ${economicData.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(economicData.profit / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(seasonalData).map(([season, count]) => (
                <div key={season} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{season}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / totalFarms) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satellite & Technology Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Satellite & Technology Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {satelliteStats.excellentQuality}
              </div>
              <p className="text-sm text-gray-600">Excellent Quality Images</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {satelliteStats.lowCloudCover}
              </div>
              <p className="text-sm text-gray-600">Low Cloud Cover (less than 20%)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {satelliteStats.highResolution}
              </div>
              <p className="text-sm text-gray-600">High Resolution Imagery</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recentScans}
              </div>
              <p className="text-sm text-gray-600">Recent UAV Scans</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
