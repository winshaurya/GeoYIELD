import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CropDistributionPieProps {
  data: { [key: string]: number };
}

export default function CropDistributionPie({ data }: CropDistributionPieProps) {
  const cropTypes = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: cropTypes,
    datasets: [
      {
        data: values,
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
            return `${label}: ${value} farms (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-full">
      <Pie data={chartData} options={options} />
    </div>
  );
}
