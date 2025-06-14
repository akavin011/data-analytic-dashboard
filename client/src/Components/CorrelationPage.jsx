import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import Chat from './Chat';

const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Plot' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const analyzeDataTypes = (data, sampleSize = 10) => {
  if (!data || data.length === 0) return {};
  
  const sample = data.slice(0, Math.min(sampleSize, data.length));
  const columns = Object.keys(data[0]);
  const analysis = {};

  columns.forEach(column => {
    const values = sample.map(row => row[column]);
    const types = values.map(value => {
      if (value === null || value === '') return 'null';
      if (!isNaN(value) && !isNaN(parseFloat(value))) return 'number';
      if (typeof value === 'boolean' || value === 'true' || value === 'false') return 'boolean';
      if (!isNaN(Date.parse(value))) return 'date';
      return 'string';
    });

    // Get the most common type
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    analysis[column] = {
      type: Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0],
      sample: values,
      uniqueValues: [...new Set(values)].length
    };
  });

  return analysis;
};

const CorrelationPage = () => {
  const [correlationData, setCorrelationData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();
  const storedData = JSON.parse(localStorage.getItem("chartData")) || [];
  const [rawDataString, setRawDataString] = useState(localStorage.getItem("chartData") || "[]");

  // For custom visualization creation
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartType, setChartType] = useState(CHART_TYPES[0].type);
  const [visualizations, setVisualizations] = useState([]);
  const [chatWidth, setChatWidth] = useState(300); // default width
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setRawDataString(localStorage.getItem("chartData") || "[]");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(rawDataString) || [];
    if (storedData.length === 0) {
      navigate("/");
      return;
    }
    // Analyze data types
    const dataAnalysis = analyzeDataTypes(storedData);
    console.log("Data Analysis:", dataAnalysis);

    // Get numerical columns based on analysis
    const numericalColumns = Object.entries(dataAnalysis)
      .filter(([_, info]) => info.type === 'number')
      .map(([column]) => column);

    console.log("Numerical columns:", numericalColumns);

    // Create clean numeric dataset
    const numericDataset = storedData.map(row => {
      const cleanRow = {};
      numericalColumns.forEach(col => {
        const value = parseFloat(row[col]);
        cleanRow[col] = isNaN(value) ? null : value;
      });
      return cleanRow;
    });

    // Filter out rows with null values
    const cleanDataset = numericDataset.filter(row => 
      Object.values(row).every(value => value !== null)
    );

    console.log("Clean dataset size:", cleanDataset.length);
    
    setColumns(numericalColumns);
    if (cleanDataset.length > 0) {
      calculateCorrelations(cleanDataset, numericalColumns);
    }
  }, [rawDataString, navigate]);

  const calculateCorrelations = (data, numericalColumns) => {
    const correlations = [];
    
    numericalColumns.forEach(col1 => {
      numericalColumns.forEach(col2 => {
        const values1 = data.map(row => row[col1]);
        const values2 = data.map(row => row[col2]);
        
        const correlation = calculatePearsonCorrelation(values1, values2);
        
        correlations.push({
          source: col1,
          target: col2,
          correlation: !isNaN(correlation) ? correlation : 0
        });
      });
    });

    console.log("Correlation matrix created with", correlations.length, "entries");
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

  // Replace the renderVisualization function with this Plotly version
  const renderVisualization = (viz, index) => {
    // Prepare data for the chart
    const chartData = storedData.map(row => ({
      x: parseFloat(row[viz.params[0]]),
      y: parseFloat(row[viz.params[1]])
    })).filter(point => !isNaN(point.x) && !isNaN(point.y));

    // Create a descriptive title
    const chartTitle = `${viz.params[1]} vs ${viz.params[0]}`;
    
    const layout = {
      title: {
        text: chartTitle,
        font: { 
          size: 18, 
          color: '#ffffff',
          weight: 'bold'
        },
        x: 0.5,
        xanchor: 'center'
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      height: 400,
      margin: { t: 60, r: 30, l: 80, b: 80 },
      xaxis: {
        title: {
          text: viz.params[0],
          font: { 
            size: 14,
            color: '#ffffff',
            weight: 'bold'
          },
          standoff: 20
        },
        tickfont: { 
          color: '#ffffff',
          size: 12
        },
        gridcolor: '#444444',
        zerolinecolor: '#666666',
        showgrid: true,
        zeroline: true,
        showline: true,
        linecolor: '#666666'
      },
      yaxis: {
        title: {
          text: viz.params[1],
          font: { 
            size: 14,
            color: '#ffffff',
            weight: 'bold'
          },
          standoff: 20
        },
        tickfont: { 
          color: '#ffffff',
          size: 12
        },
        gridcolor: '#444444',
        zerolinecolor: '#666666',
        showgrid: true,
        zeroline: true,
        showline: true,
        linecolor: '#666666'
      },
      showlegend: true,
      legend: { 
        font: { color: '#ffffff' },
        bgcolor: 'rgba(0,0,0,0.3)',
        bordercolor: '#666666',
        borderwidth: 1
      },
      hoverlabel: {
        bgcolor: '#1f2937',
        font: { color: '#ffffff' }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToAdd: ['zoom2d', 'pan2d', 'resetScale2d', 'toImage'],
      toImageButtonOptions: {
        format: 'png',
        filename: `${viz.params[1]}_vs_${viz.params[0]}`,
        height: 500,
        width: 700,
        scale: 2
      }
    };

    let plotData;
    switch (viz.chartType) {
      case 'scatter':
        plotData = [{
          x: chartData.map(d => d.x),
          y: chartData.map(d => d.y),
          type: 'scatter',
          mode: 'markers',
          marker: { 
            color: COLORS[index % COLORS.length],
            size: 8,
            line: {
              color: '#ffffff',
              width: 1
            }
          },
          name: `${viz.params[1]} vs ${viz.params[0]}`,
          hovertemplate: `${viz.params[0]}: %{x}<br>${viz.params[1]}: %{y}<extra></extra>`
        }];
        break;

      case 'line':
        plotData = [{
          x: chartData.map(d => d.x),
          y: chartData.map(d => d.y),
          type: 'scatter',
          mode: 'lines+markers',
          line: { 
            color: COLORS[index % COLORS.length],
            width: 2
          },
          marker: {
            size: 6
          },
          name: `${viz.params[1]} vs ${viz.params[0]}`,
          hovertemplate: `${viz.params[0]}: %{x}<br>${viz.params[1]}: %{y}<extra></extra>`
        }];
        break;

      case 'area':
        plotData = [{
          x: chartData.map(d => d.x),
          y: chartData.map(d => d.y),
          type: 'scatter',
          fill: 'tozeroy',
          fillcolor: `${COLORS[index % COLORS.length]}50`,
          line: { 
            color: COLORS[index % COLORS.length],
            width: 2
          },
          name: `${viz.params[1]} vs ${viz.params[0]}`,
          hovertemplate: `${viz.params[0]}: %{x}<br>${viz.params[1]}: %{y}<extra></extra>`
        }];
        break;

      default: // bar chart
        plotData = [{
          x: chartData.map(d => d.x),
          y: chartData.map(d => d.y),
          type: 'bar',
          marker: { 
            color: COLORS[index % COLORS.length],
            line: {
              color: COLORS[index % COLORS.length],
              width: 1.5
            }
          },
          name: `${viz.params[1]} vs ${viz.params[0]}`,
          hovertemplate: `${viz.params[0]}: %{x}<br>${viz.params[1]}: %{y}<extra></extra>`
        }];
        break;
    }

    return (
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '400px' }}
        className="bg-gray-800 rounded-lg p-2"
      />
    );
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

  const renderCorrelationHeatmap = () => {
    if (!columns.length || !correlationData.length) return null;

    // Prepare data for heatmap
    const matrix = [];
    const zValues = [];
    columns.forEach(row => {
      const rowData = [];
      columns.forEach(col => {
        const correlation = correlationData.find(
          c => c.source === row && c.target === col
        )?.correlation || 0;
        rowData.push(correlation);
      });
      zValues.push(rowData);
    });

    const data = [{
      z: zValues,
      x: columns,
      y: columns,
      type: 'heatmap',
      colorscale: [
        [0, 'rgb(239, 68, 68)'],     // Red for negative correlations
        [0.5, 'rgb(75, 85, 99)'],    // Gray for no correlation
        [1, 'rgb(52, 211, 153)']     // Green for positive correlations
      ],
      zmin: -1,
      zmax: 1,
      hoverongaps: false,
      hovertemplate: 
        '%{y} → %{x}<br>' +
        'Correlation: %{z:.3f}<extra></extra>',
    }];

    const layout = {
      title: {
        text: 'Correlation Heatmap',
        font: { size: 24, color: '#ffffff' }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      width: 800,
      height: 800,
      margin: { t: 50, l: 140, r: 40, b: 140 },
      xaxis: {
        tickangle: 45,
        tickfont: { color: '#ffffff' },
        gridcolor: '#444444'
      },
      yaxis: {
        tickfont: { color: '#ffffff' },
        gridcolor: '#444444'
      },
      font: { color: '#ffffff' }
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      responsive: true,
      toImageButtonOptions: {
        format: 'png',
        filename: 'correlation_heatmap',
        height: 800,
        width: 800,
        scale: 2
      }
    };

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Correlation Heatmap</h2>
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <Plot
            data={data}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '800px' }}
          />
        </div>
        
        {/* Legend */}
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
    );
  };

  // Update the return statement to use the new heatmap
  return (
    <div className="flex h-full min-h-screen bg-gray-900">
      <div className="flex-1 p-6 overflow-auto">
        {/* Header section remains the same */}
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

        {/* Replace the old table-based heatmap with the new Plotly heatmap */}
        {renderCorrelationHeatmap()}

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