import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  data: { date: string; value: number }[];
  title: string;
  color?: string;
}

export default function TimeSeriesChart({ data, title, color = 'hsl(var(--primary))' }: TimeSeriesChartProps) {
  const chartData = {
    labels: data.map(point => new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: title,
        data: data.map(point => point.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          label: (context: any) => `${title}: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'hsl(var(--muted-foreground) / 0.2)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
