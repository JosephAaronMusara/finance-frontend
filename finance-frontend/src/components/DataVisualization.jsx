import React, { useEffect, useState } from 'react';
import axios from '../api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const years = ['2008', '2012', '2016', '2020'];
const colors = [
  'rgba(75, 192, 192, 0.6)', // 2008
  'rgba(255, 99, 132, 0.6)', // 2012
  'rgba(255, 206, 86, 0.6)', // 2016
  'rgba(179, 164, 247, 0.6)'  // 2020
];

const colorKey = years.map((year, index) => ({
  year,
  color: colors[index],
}));

const DataVisualization = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('/visualization_data/');
        console.log(response.data);

        const labels = response.data.map(item => item.indicator);
        const data = years.map(year => response.data.map(item => item[`year_${year}`] || 0));
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Yearly Data',
              data: data.flat(),
              backgroundColor: colors,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Financial Inclusion</h2>
      
      <div className="mb-4 text-center">
        <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', justifyContent: 'center' }}>
          {colorKey.map(({ year, color }) => (
            <li key={year} style={{ margin: '0 15px', display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: color, marginRight: '8px' }}></span>
              {year}
            </li>
          ))}
        </ul>
      </div>

      {chartData.labels ? (
        <Bar
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Data by Year',
              },
            },
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DataVisualization;
