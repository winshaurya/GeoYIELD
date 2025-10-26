import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StateYieldBarProps {
  data: { district: string; avgVariance: number }[];
}

export default function StateYieldBar({ data }: StateYieldBarProps) {
  const chartData = {
    labels: data.map(item => item.district),
    datasets: [
      {
        label: 'Average Yield Variance (%)',
        data: data.map(item => item.avgVariance),
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
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
        callbacks: {
          label: (context: any) => `${context.parsed.y?.toFixed(1) || 0}%`,
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
  };

  return (
    <div className="h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
