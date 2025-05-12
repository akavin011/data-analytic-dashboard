import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';

const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Plot' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' }
];

const CorrelationPage = () => {
  const [correlationData, setCorrelationData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();
  const storedData = JSON.parse(localStorage.getItem("chartData")) || [];

  // For custom visualization creation
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartType, setChartType] = useState(CHART_TYPES[0].type);
  const [visualizations, setVisualizations] = useState([]);

  useEffect(() => {
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    // Get numerical columns
    const numericalColumns = Object.keys(storedData[0]).filter(column =>
      storedData.every(row => !isNaN(parseFloat(row[column])))
    );

    setColumns(numericalColumns);
    calculateCorrelations(storedData, numericalColumns);
  }, [navigate, storedData]);

  const calculateCorrelations = (data, numericalColumns) => {
    const correlations = [];

    numericalColumns.forEach(col1 => {
      numericalColumns.forEach(col2 => {
        const correlation = calculatePearsonCorrelation(
          data.map(row => parseFloat(row[col1])),
          data.map(row => parseFloat(row[col2]))
        );
        correlations.push({
          source: col1,
          target: col2,
          correlation: correlation
        });
      });
    });

    setCorrelationData(correlations);
  };

  const calculatePearsonCorrelation = (x, y) => {
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const xMean = mean(x);
    const yMean = mean(y);
    const numerator = x.reduce((acc, xi, i) => acc + (xi - xMean) * (y[i] - yMean), 0);
    const xDev = Math.sqrt(x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0));
    const yDev = Math.sqrt(y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0));
    return numerator / (xDev * yDev);
  };

  // Handlers for custom visualization section
  const toggleParameter = (param) => {
    setSelectedParams(prev =>
      prev.includes(param)
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  const addVisualization = () => {
    if (selectedParams.length < 2) {
      alert("Please select at least 2 parameters for visualization.");
      return;
    }
    setVisualizations(prev => [...prev, { params: selectedParams, chartType }]);
    // Reset current selection
    setSelectedParams([]);
  };

  return (
    <div className="flex h-full min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span role="img" aria-label="correlation">📊</span> Correlation Analysis
            </h1>
            <p className="text-gray-400">
              Analyzing relationships between {columns.length} numerical parameters
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/visualize')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              View Visualizations
            </button>
            <button
              onClick={() => navigate('/statistics')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              View Statistics
            </button>
          </div>
        </div>

        {/* Heat Map (Correlation Matrix) */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Correlation Heatmap</h2>
          <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="p-2 text-white">Variables</th>
                  {columns.map(col => (
                    <th key={col} className="p-2 text-white">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns.map(row => (
                  <tr key={row}>
                    <td className="p-2 text-white font-medium">{row}</td>
                    {columns.map(col => {
                      const correlation = correlationData.find(
                        c => c.source === row && c.target === col
                      )?.correlation || 0;
                      const bgColor = `rgba(${correlation > 0 ? '0, 255, 0' : '255, 0, 0'}, ${Math.abs(correlation) * 0.5})`;
                      return (
                        <td 
                          key={`${row}-${col}`}
                          className="p-2 text-white text-center"
                          style={{ backgroundColor: bgColor }}
                        >
                          {correlation.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Visualization Creation Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create Custom Visualization</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 mb-2">Select parameters:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {columns.map(param => (
                <label key={param} className="flex items-center gap-1 text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedParams.includes(param)}
                    onChange={() => toggleParameter(param)}
                    className="form-checkbox text-blue-500"
                  />
                  {param}
                </label>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-gray-300 mr-2">Chart Type:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded"
              >
                {CHART_TYPES.map(option => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addVisualization}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Render Custom Visualizations */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Visualizations</h2>
          {visualizations.length === 0 ? (
            <p className="text-gray-300">No visualizations created.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visualizations.map((viz, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {CHART_TYPES.find(opt => opt.type === viz.chartType)?.label} Visualization
                  </h3>
                  <p className="text-gray-300">Parameters: {viz.params.join(', ')}</p>
                  {/* Place to render the actual chart if needed */}
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Chat Sidebar */}
      <div className="w-1/4 border-l border-gray-700">
        <Chat />
      </div>
    </div>
  );
};

export default CorrelationPage;