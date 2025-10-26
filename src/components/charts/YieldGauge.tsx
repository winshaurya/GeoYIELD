import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface YieldGaugeProps {
  data?: Record<string, number>;
  predictedYield?: number;
  expectedYield?: number;
}

export default function YieldGauge({ data, predictedYield, expectedYield }: YieldGaugeProps) {
  if (predictedYield !== undefined && expectedYield !== undefined) {
    // Individual farm yield gauge
    const variance = predictedYield - expectedYield;
    const isPositive = variance >= 0;

    const chartData = {
      datasets: [
        {
          data: [predictedYield, Math.max(0, expectedYield - predictedYield)],
          backgroundColor: [
            'hsl(var(--primary))',
            'hsl(var(--muted-foreground))',
          ],
          borderWidth: 0,
          cutout: '70%',
          circumference: 180,
          rotation: 270,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };

    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="w-full h-full">
          <Doughnut data={chartData} options={options} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-primary">{predictedYield.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">tons/ha</div>
          <div className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{variance.toFixed(1)} vs expected
          </div>
        </div>
      </div>
    );
  }

  // Health status doughnut
  if (!data) return null;

  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
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
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
