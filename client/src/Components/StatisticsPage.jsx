import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Statistics from './Statistics';

const StatisticsPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("chartData")) || [];
    
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    setData(storedData);
    setColumns(Object.keys(storedData[0] || {}));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span role="img" aria-label="stats">📈</span> Statistical Analysis
          </h1>
          <p className="text-gray-400">Detailed statistics for {columns.length} parameters</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/visualize')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            View Visualizations
          </button>
          <button
            onClick={() => navigate('/correlation')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            View Correlations
          </button>
        </div>
      </div>

      {/* Render the Statistics component */}
      <Statistics data={data} columns={columns} />
    </div>
  );
};

export default StatisticsPage;