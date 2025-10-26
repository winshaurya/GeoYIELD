import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ScalabilityDashboard() {
  const { data, loading, error } = useFarmData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  // Calculate KPI metrics
  const totalFarms = data.length;
  const avgPredictedYield = data.reduce((sum, farm) => sum + farm.predictedYield, 0) / totalFarms;
  const stressedFarms = data.filter(farm => farm.healthStatus !== 'Healthy').length;
  const activeScans = Math.floor(Math.random() * 200) + 100; // Mock number

  // Get high-risk farms (lowest yield variance)
  const highRiskFarms = [...data]
    .sort((a, b) => a.yieldVariancePercent - b.yieldVariancePercent)
    .slice(0, 100);

  // Calculate yield variance by state
  const stateVarianceMap = new Map<string, { total: number; count: number }>();
  data.forEach(farm => {
    const existing = stateVarianceMap.get(farm.state) || { total: 0, count: 0 };
    stateVarianceMap.set(farm.state, {
      total: existing.total + farm.yieldVariancePercent,
      count: existing.count + 1,
    });
  });

  const stateVarianceData = Array.from(stateVarianceMap.entries()).map(([state, { total, count }]) => ({
    state,
    avgVariance: total / count,
  })).sort((a, b) => b.avgVariance - a.avgVariance);

  // Calculate health status distribution
  const healthStatusCounts = data.reduce((acc, farm) => {
    acc[farm.healthStatus] = (acc[farm.healthStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Farms Monitored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarms.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Predicted Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPredictedYield.toFixed(1)} tons/ha</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area Under Stress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stressedFarms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active UAV Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeScans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Variance by State Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Yield Variance by State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: stateVarianceData.map(item => item.state),
                  datasets: [
                    {
                      label: 'Average Yield Variance (%)',
                      data: stateVarianceData.map(item => item.avgVariance),
                      backgroundColor: 'hsl(var(--primary))',
                      borderColor: 'hsl(var(--primary))',
                      borderWidth: 1,
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
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.parsed.y?.toFixed(1) || 0}%`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'hsl(var(--muted-foreground) / 0.2)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Crop Health Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: Object.keys(healthStatusCounts),
                  datasets: [
                    {
                      data: Object.values(healthStatusCounts),
                      backgroundColor: [
                        'hsl(var(--primary))',
                        'hsl(var(--secondary))',
                        '#ef4444', // red-500
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
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
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

      {/* High-Risk Farms Table */}
      <Card>
        <CardHeader>
          <CardTitle>High-Priority Farms (Bottom 100)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Farm ID</th>
                  <th className="text-left p-2">Farmer Name</th>
                  <th className="text-left p-2">State</th>
                  <th className="text-left p-2">Crop Type</th>
                  <th className="text-left p-2">Predicted Yield</th>
                  <th className="text-left p-2">Variance</th>
                </tr>
              </thead>
              <tbody>
                {highRiskFarms.map((farm) => (
                  <tr key={farm.farmId} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Link
                        to={`/farm/${farm.farmId}`}
                        className="text-primary hover:underline"
                      >
                        {farm.farmId}
                      </Link>
                    </td>
                    <td className="p-2">{farm.farmerName}</td>
                    <td className="p-2">{farm.state}</td>
                    <td className="p-2">{farm.cropType}</td>
                    <td className="p-2">{farm.predictedYield.toFixed(1)}</td>
                    <td className="p-2">{farm.yieldVariancePercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
