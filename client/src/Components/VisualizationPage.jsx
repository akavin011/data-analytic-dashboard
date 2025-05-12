import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter, AreaChart, Area
} from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#A28EFF", "#FF647F"];
const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Plot' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'area', label: 'Area Chart' }
];

// Add this constant for axis styling
const AXIS_STYLE = {
  fontSize: '12px',
  fontFamily: 'sans-serif',
  fill: '#cccccc'
};

const VisualizationPage = () => {
  const [chartData, setChartData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartTypes, setChartTypes] = useState({});
  const [dataAnalysis, setDataAnalysis] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showParameters, setShowParameters] = useState(false);
  const [rawData, setRawData] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("chartData")) || [];
    const analysis = JSON.parse(localStorage.getItem("dataAnalysis")) || {};
    
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    setRawData(storedData);
    setDataAnalysis(analysis);
    const dataColumns = Object.keys(storedData[0] || {});
    setColumns(dataColumns);
    setSelectedColumns(dataColumns); // Initialize with all columns

    // Process the data based on column types
    const processedData = {};
    
    // Analyze data types and aggregate data
    dataColumns.forEach(column => {
      const values = storedData.map(item => item[column]);
      
      // Check if numerical
      const isNumeric = values.every(val => !isNaN(parseFloat(val)));
      
      if (isNumeric) {
        // For numerical data, calculate average/distribution
        processedData[column] = values.map(v => parseFloat(v));
      } else {
        // For categorical/text data, count frequencies
        const frequencies = values.reduce((acc, val) => {
          const key = String(val).trim();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        
        processedData[column] = frequencies;
      }
    });

    // Convert processed data to chart format
    const chartableData = dataColumns.map(column => {
      const data = processedData[column];
      
      if (Array.isArray(data)) {
        // Numerical data
        return {
          column,
          type: 'numeric',
          data: data
        };
      } else {
        // Categorical data
        return {
          column,
          type: 'categorical',
          data: Object.entries(data).map(([name, value]) => ({
            name,
            value
          }))
        };
      }
    });

    setChartData(chartableData);

    // Set appropriate initial chart types
    const initialChartTypes = {};
    chartableData.forEach(({ column, type }) => {
      if (type === 'numeric') {
        initialChartTypes[column] = 'bar';
      } else {
        initialChartTypes[column] = 'pie';
      }
    });
    setChartTypes(initialChartTypes);
  }, [navigate]);

  // Modify the renderChart function
  const renderChart = (column, data, index) => {
    const chartType = chartTypes[column] || 'bar';
    const columnData = chartData.find(d => d.column === column);
    
    if (!columnData) return null;

    const formattedData = columnData.data.map((item, idx) => ({
      name: item.name || `Item ${idx + 1}`,
      value: item.value || item
    }));

    // Common props for all charts
    const commonProps = {
      width: 400,
      height: 300,
      margin: { top: 20, right: 30, left: 20, bottom: 50 } // Increased bottom margin for labels
    };

    switch(chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} data={formattedData}>
            <XAxis 
              dataKey="name" 
              label={{ 
                value: column,
                position: 'bottom',
                offset: 20,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <YAxis 
              label={{ 
                value: 'Frequency',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend wrapperStyle={AXIS_STYLE} />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={column}
              stroke={COLORS[index % COLORS.length]}
              dot={{ fill: COLORS[index % COLORS.length] }} 
            />
          </LineChart>
        );
      
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <XAxis 
              dataKey="name"
              label={{ 
                value: column,
                position: 'bottom',
                offset: 20,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <YAxis 
              label={{ 
                value: 'Frequency',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend wrapperStyle={AXIS_STYLE} />
            <Scatter 
              data={formattedData} 
              name={column}
              fill={COLORS[index % COLORS.length]}
              dataKey="value" 
            />
          </ScatterChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps} data={formattedData}>
            <XAxis 
              dataKey="name"
              label={{ 
                value: column,
                position: 'bottom',
                offset: 20,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <YAxis 
              label={{ 
                value: 'Frequency',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend wrapperStyle={AXIS_STYLE} />
            <Area 
              type="monotone" 
              dataKey="value" 
              name={column}
              fill={COLORS[index % COLORS.length]}
              stroke={COLORS[index % COLORS.length]} 
              fillOpacity={0.6}
            />
          </AreaChart>
        );
      
      default:
        return (
          <BarChart {...commonProps} data={formattedData}>
            <XAxis 
              dataKey="name"
              label={{ 
                value: column,
                position: 'bottom',
                offset: 20,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <YAxis 
              label={{ 
                value: 'Frequency',
                angle: -90,
                position: 'insideLeft',
                offset: -10,
                style: AXIS_STYLE
              }}
              tick={AXIS_STYLE}
            />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend wrapperStyle={AXIS_STYLE} />
            <Bar 
              dataKey="value" 
              name={column}
              fill={COLORS[index % COLORS.length]} 
            />
          </BarChart>
        );
    }
  };

  // Update chart type selector
  const renderChartTypeSelector = (column) => {
    return (
      <div className="flex gap-2 flex-wrap mb-3">
        {CHART_TYPES.map(chartType => (
          <button
            key={chartType.type}
            className={`px-3 py-1 rounded ${
              chartTypes[column] === chartType.type ? 'bg-blue-500' : 'bg-gray-600'
            } hover:opacity-80 transition-opacity`}
            onClick={() => handleChartTypeChange(column, chartType.type)}
          >
            {chartType.label}
          </button>
        ))}
      </div>
    );
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
          <div key={column} className="bg-gray-800 p-4 rounded-lg relative">
            <button
              onClick={() => handleDeleteChart(column)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
            {renderChartTypeSelector(column)}
            {renderChart(column, chartData[column], index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualizationPage;
