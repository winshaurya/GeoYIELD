import { useRef, useEffect, useState } from 'react';
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
  const chartRef = useRef<any>(null);
  const [gradient, setGradient] = useState<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const newGradient = ctx.createLinearGradient(0, 0, 0, 400);
      newGradient.addColorStop(0, `${color}50`);
      newGradient.addColorStop(1, `${color}00`);
      setGradient(newGradient);
    }
  }, [color]);

  const chartData = {
    labels: data.map(point => new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: title,
        data: data.map(point => point.value),
        borderColor: color,
        fill: true,
        backgroundColor: gradient,
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
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
