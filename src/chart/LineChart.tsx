import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register components (required for Chart.js v3+)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface LineChartProps {
  data: Array<{ [key: string]: any }>;
  xAxis: string;
  yAxis: string;
  title?: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, xAxis, yAxis, title, color = 'rgb(53, 162, 235)' }) => {
  const labels = data.map(item => item[xAxis]);
  const values = data.map(item => item[yAxis]);

  const chartData = {
    labels,
    datasets: [
      {
        label: yAxis,
        data: values,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  return <Line options={options} data={chartData} />
}

export default LineChart
