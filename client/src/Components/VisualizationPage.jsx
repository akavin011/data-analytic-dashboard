import React, { useEffect, useState } from "react";
import Plot from 'react-plotly.js';
import { useNavigate } from "react-router-dom";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#A28EFF", "#FF647F"];
const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Plot' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' }
];

const VisualizationPage = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartTypes, setChartTypes] = useState({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showParameters, setShowParameters] = useState(false);

  const renderChartTypeSelector = (column) => (
    <div className="mb-4">
      <select
        value={chartTypes[column] || 'bar'}
        onChange={(e) => handleChartTypeChange(column, e.target.value)}
        className="bg-gray-700 text-white rounded px-3 py-1"
      >
        {CHART_TYPES.map(({ type, label }) => (
          <option key={type} value={type}>{label}</option>
        ))}
      </select>
    </div>
  );

  const renderChart = (column, data, index) => {
    const chartType = chartTypes[column] || 'bar';
    const columnData = chartData.find(d => d.column === column);
    
    if (!columnData) return null;

    const x = columnData.data.map((item, idx) => item.name || `${idx + 1}`);
    const y = columnData.data.map(item => item.value || item);

    const layout = {
      title: {
        text: `${column} Distribution`,
        font: { 
          size: 24,
          color: '#ffffff'
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { 
        family: 'Arial, sans-serif',
        color: '#ffffff',
        size: 14
      },
      xaxis: {
        title: {
          text: column,
          font: {
            size: 16,
            color: '#ffffff'
          },
          standoff: 20
        },
        gridcolor: '#444',
        showgrid: true,
        showline: true,
        linecolor: '#666',
        tickfont: {
          color: '#ffffff'
        }
      },
      yaxis: {
        title: {
          text: columnData.type === 'numeric' ? 'Value' : 'Frequency',
          font: {
            size: 16,
            color: '#ffffff'
          },
          standoff: 20
        },
        gridcolor: '#444',
        showgrid: true,
        showline: true,
        linecolor: '#666',
        tickfont: {
          color: '#ffffff'
        }
      },
      margin: { 
        t: 50,
        r: 30,
        l: 80,
        b: 80 
      },
      showlegend: true,
      legend: {
        font: {
          color: '#ffffff'
        }
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
      modeBarButtonsToAdd: ['toImage'],
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    switch(chartType) {
      case 'line':
        return (
          <Plot
            data={[{
              x: x,
              y: y,
              type: 'scatter',
              mode: 'lines+markers',
              line: { 
                color: COLORS[index % COLORS.length],
                width: 2
              },
              marker: {
                size: 6,
                color: COLORS[index % COLORS.length]
              },
              name: column,
              hovertemplate: `${column}: %{x}<br>Value: %{y:.2f}<extra></extra>`
            }]}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        );

      case 'scatter':
        return (
          <Plot
            data={[{
              x: x,
              y: y,
              type: 'scatter',
              mode: 'markers',
              marker: { 
                color: COLORS[index % COLORS.length],
                size: 8,
                opacity: 0.7,
                line: {
                  color: '#ffffff',
                  width: 1
                }
              },
              name: column,
              hovertemplate: `${column}: %{x}<br>Value: %{y:.2f}<extra></extra>`
            }]}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        );

      case 'area':
        return (
          <Plot
            data={[{
              x: x,
              y: y,
              type: 'scatter',
              fill: 'tozeroy',
              fillcolor: `${COLORS[index % COLORS.length]}50`,
              line: { 
                color: COLORS[index % COLORS.length],
                width: 2
              },
              name: column,
              hovertemplate: `${column}: %{x}<br>Value: %{y}<extra></extra>`
            }]}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        );

      default: // bar chart
        return (
          <Plot
            data={[{
              x: x,
              y: y,
              type: 'bar',
              marker: { 
                color: COLORS[index % COLORS.length],
                line: {
                  color: COLORS[index % COLORS.length],
                  width: 1.5
                }
              },
              name: column,
              hovertemplate: `${column}: %{x}<br>Value: %{y}<extra></extra>`
            }]}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '400px' }}
          />
        );
    }
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("chartData")) || [];
    
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    const dataColumns = Object.keys(storedData[0] || {});
    setColumns(dataColumns);
    setSelectedColumns(dataColumns);

    // Process the data for visualization
    const processedData = dataColumns.map(column => {
      const values = storedData.map(item => item[column]);
      const isNumeric = values.every(val => !isNaN(parseFloat(val)));

      if (isNumeric) {
        return {
          column,
          type: 'numeric',
          data: values.map(v => parseFloat(v))
        };
      } else {
        const frequencies = values.reduce((acc, val) => {
          const key = String(val).trim();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        return {
          column,
          type: 'categorical',
          data: Object.entries(frequencies).map(([name, value]) => ({
            name,
            value
          }))
        };
      }
    });

    setChartData(processedData);

    // Set initial chart types
    const initialChartTypes = {};
    processedData.forEach(({ column, type }) => {
      initialChartTypes[column] = type === 'numeric' ? 'scatter' : 'bar';
    });
    setChartTypes(initialChartTypes);
  }, [navigate]);

  // Function to check if a column is boolean
  const isBooleanColumn = (data, column) => {
    return data.every(item => 
      item[column]?.toString().toLowerCase() === 'yes' || 
      item[column]?.toString().toLowerCase() === 'no'
    );
  };

  // Function to check if a column is numerical
  const isNumericalColumn = (data, column) => {
    return data.every(item => !isNaN(parseFloat(item[column])));
  };

  // Function to handle chart type selection
  const handleChartTypeChange = (column, type) => {
    setChartTypes(prev => ({
      ...prev,
      [column]: type
    }));
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleDeleteChart = (columnToDelete) => {
    setSelectedColumns(prev => prev.filter(col => col !== columnToDelete));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span role="img" aria-label="chart">📊</span> Data Visualization
          </h1>
          <p className="text-gray-400">Analysis of {columns.length} parameters from the dataset</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/statistics')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            View Statistics
          </button>
          <button
            onClick={() => navigate('/correlation')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            View Correlations
          </button>
        </div>
      </div>
      
      {/* Parameters Selection Panel */}
      <div className="mt-4">
        <button 
          onClick={() => setShowParameters(!showParameters)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
        >
          {showParameters ? 'Hide Parameters' : 'Show Parameters'}
        </button>
        
        {showParameters && (
          <div className="mt-4 bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Dataset Parameters</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map(column => (
                <label key={column} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => handleColumnToggle(column)}
                    className="form-checkbox h-4 w-4 text-blue-500"
                  />
                  <span className="text-sm">{column}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {selectedColumns.map((column, index) => (
          <div key={column} className="bg-gray-800 p-6 rounded-lg relative">
            <button
              onClick={() => handleDeleteChart(column)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10"
            >
              ×
            </button>
            {renderChartTypeSelector(column)}
            <div className="mt-4">
              {renderChart(column, chartData[column], index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualizationPage;
