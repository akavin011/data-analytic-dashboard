import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, ScatterChart, Scatter,
  AreaChart, Area
} from "recharts"; // Import recharts components

const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Plot' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const CorrelationPage = () => {
  const [correlationData, setCorrelationData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();
  const storedData = JSON.parse(localStorage.getItem("chartData")) || [];

  // For custom visualization creation
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartType, setChartType] = useState(CHART_TYPES[0].type);
  const [visualizations, setVisualizations] = useState([]);
  const [chatWidth, setChatWidth] = useState(300); // default width
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    // Get numerical columns - fixed filter function
    const numericalColumns = Object.keys(storedData[0]).filter(column =>
      storedData.every(row => !isNaN(parseFloat(row[column])) && row[column] !== '')
    );

    console.log("Numerical columns:", numericalColumns); // Debug log
    setColumns(numericalColumns);
    calculateCorrelations(storedData, numericalColumns);
  }, [navigate, storedData]);

  const calculateCorrelations = (data, numericalColumns) => {
    const correlations = [];
    
    // Convert string values to numbers first
    const numericData = data.map(row => {
      const newRow = {};
      numericalColumns.forEach(col => {
        newRow[col] = parseFloat(row[col]);
      });
      return newRow;
    });
    
    numericalColumns.forEach(col1 => {
      numericalColumns.forEach(col2 => {
        const values1 = numericData.map(row => row[col1]);
        const values2 = numericData.map(row => row[col2]);
        
        const correlation = calculatePearsonCorrelation(values1, values2);
        
        // Check if correlation is valid
        const validCorrelation = !isNaN(correlation) ? correlation : 0;
        
        correlations.push({
          source: col1,
          target: col2,
          correlation: validCorrelation
        });
      });
    });

    console.log("Correlation data:", correlations); // Debug log
    setCorrelationData(correlations);
  };

  const calculatePearsonCorrelation = (x, y) => {
    try {
      const n = x.length;
      if (n === 0) return 0;

      // Calculate means
      const mean1 = x.reduce((a, b) => a + b, 0) / n;
      const mean2 = y.reduce((a, b) => a + b, 0) / n;

      // Calculate covariance and standard deviations
      let covariance = 0;
      let stdDev1 = 0;
      let stdDev2 = 0;

      for (let i = 0; i < n; i++) {
        const diff1 = x[i] - mean1;
        const diff2 = y[i] - mean2;
        covariance += diff1 * diff2;
        stdDev1 += diff1 * diff1;
        stdDev2 += diff2 * diff2;
      }

      stdDev1 = Math.sqrt(stdDev1 / n);
      stdDev2 = Math.sqrt(stdDev2 / n);

      if (stdDev1 === 0 || stdDev2 === 0) return 0;

      return covariance / (n * stdDev1 * stdDev2);
    } catch (error) {
      console.error("Error calculating correlation:", error);
      return 0;
    }
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

  const renderVisualization = (viz, index) => {
    // Prepare data for the chart
    const chartData = storedData.map(row => {
      const dataPoint = {};
      viz.params.forEach(param => {
        dataPoint[param] = parseFloat(row[param]);
      });
      return dataPoint;
    });

    const commonProps = {
      width: 500,
      height: 300,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 50 }
    };

    switch (viz.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey={viz.params[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {viz.params.slice(1).map((param, i) => (
              <Line
                key={param}
                type="monotone"
                dataKey={param}
                stroke={COLORS[i % COLORS.length]}
              />
            ))}
          </LineChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <XAxis dataKey={viz.params[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {viz.params.slice(1).map((param, i) => (
              <Scatter
                key={param}
                name={param}
                data={chartData}
                fill={COLORS[i % COLORS.length]}
                dataKey={param}
              />
            ))}
          </ScatterChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis dataKey={viz.params[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {viz.params.slice(1).map((param, i) => (
              <Area
                key={param}
                type="monotone"
                dataKey={param}
                fill={COLORS[i % COLORS.length]}
                stroke={COLORS[i % COLORS.length]}
              />
            ))}
          </AreaChart>
        );

      default: // bar chart
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey={viz.params[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {viz.params.slice(1).map((param, i) => (
              <Bar
                key={param}
                dataKey={param}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </BarChart>
        );
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setChatWidth(newWidth);
      }
    }
  }, [isResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  }, [handleMouseMove, stopResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResizing);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, handleMouseMove, stopResizing]);

  return (
    <div className="flex h-full min-h-screen bg-gray-900">
      <div className="flex-1 p-6 overflow-auto">
        {/* Main Content */}
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
          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            {columns.length > 0 ? (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-white border border-gray-700">Variables</th>
                    {columns.map(col => (
                      <th key={col} className="p-2 text-white border border-gray-700 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {columns.map(row => (
                    <tr key={row}>
                      <td className="p-2 text-white font-medium border border-gray-700 whitespace-nowrap">
                        {row}
                      </td>
                      {columns.map(col => {
                        const correlation = correlationData.find(
                          c => c.source === row && c.target === col
                        )?.correlation || 0;
                        
                        // Calculate color based on correlation value
                        const getColor = (value) => {
                          const absValue = Math.abs(value);
                          if (value > 0) {
                            return `rgba(52, 211, 153, ${Math.min(absValue + 0.2, 1)})`; // Green for positive
                          } else if (value < 0) {
                            return `rgba(239, 68, 68, ${Math.min(absValue + 0.2, 1)})`; // Red for negative
                          }
                          return 'rgba(75, 85, 99, 0.2)'; // Gray for zero
                        };

                        return (
                          <td 
                            key={`${row}-${col}`}
                            className="p-2 text-white text-center border border-gray-700 transition-colors duration-200 hover:opacity-80"
                            style={{ 
                              backgroundColor: getColor(correlation),
                              minWidth: '80px'
                            }}
                            title={`${row} → ${col}: ${correlation.toFixed(3)}`}
                          >
                            {correlation.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400">No numerical parameters found in the dataset.</p>
            )}
          </div>
          
          {/* Add color scale legend */}
          <div className="mt-4 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span className="text-sm text-gray-300">Strong Negative (-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600"></div>
              <span className="text-sm text-gray-300">No Correlation (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span className="text-sm text-gray-300">Strong Positive (1.0)</span>
            </div>
          </div>
        </div>

        {/* Custom Visualization Creation Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create Custom Visualization</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 mb-2">Select parameters (minimum 2):</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {columns.map(param => (
                <label 
                  key={param} 
                  className={`flex items-center gap-2 p-2 rounded border ${
                    selectedParams.includes(param) 
                      ? 'border-blue-500 bg-gray-700' 
                      : 'border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedParams.includes(param)}
                    onChange={() => toggleParameter(param)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-300">{param}</span>
                </label>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div>
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
                disabled={selectedParams.length < 2}
                className={`
                  px-4 py-2 rounded-full text-white font-bold text-xl
                  ${selectedParams.length < 2 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 transition-colors'}
                `}
              >
                +
              </button>
            </div>

            {selectedParams.length > 0 && (
              <div className="text-gray-400 text-sm">
                Selected parameters: {selectedParams.join(', ')}
              </div>
            )}
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {CHART_TYPES.find(opt => opt.type === viz.chartType)?.label}
                    </h3>
                    <button
                      onClick={() => {
                        setVisualizations(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">Parameters: {viz.params.join(', ')}</p>
                  <div className="overflow-auto">
                    {renderVisualization(viz, index)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resizable Chat Sidebar */}
      <div 
        className="relative"
        style={{ width: chatWidth, minWidth: '250px', maxWidth: '600px' }}
      >
        <div
          className="absolute left-0 h-full w-1 cursor-ew-resize bg-gray-700 hover:bg-blue-500 transition-colors"
          onMouseDown={startResizing}
        />
        <div className="h-full border-l border-gray-700">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default CorrelationPage;