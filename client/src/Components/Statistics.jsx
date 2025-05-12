import React, { useEffect, useState } from 'react';

const Statistics = ({ data, columns }) => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    if (!data || !columns) return;

    const statsData = {};
    columns.forEach(column => {
      const values = data.map(item => item[column]);
      
      // Check if numerical
      const isNumeric = values.every(val => !isNaN(parseFloat(val)));
      
      if (isNumeric) {
        const numericValues = values.map(v => parseFloat(v));
        statsData[column] = {
          type: 'numeric',
          mean: calculateMean(numericValues),
          median: calculateMedian(numericValues),
          stdDev: calculateStdDev(numericValues),
          min: Math.min(...numericValues),
          max: Math.max(...numericValues)
        };
      } else {
        const frequencies = calculateFrequencies(values);
        statsData[column] = {
          type: 'categorical',
          frequencies,
          uniqueValues: Object.keys(frequencies).length,
          mostCommon: findMostCommon(frequencies)
        };
      }
    });

    setStatistics(statsData);
  }, [data, columns]);

  // Helper functions
  const calculateMean = (values) => {
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const calculateMedian = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const calculateStdDev = (values) => {
    const mean = calculateMean(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(calculateMean(squareDiffs));
  };

  const calculateFrequencies = (values) => {
    return values.reduce((acc, val) => {
      const key = String(val).trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  };

  const findMostCommon = (frequencies) => {
    return Object.entries(frequencies)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Statistical Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(statistics).map(([column, stats]) => (
          <div key={column} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">{column}</h3>
            {stats.type === 'numeric' ? (
              <div className="space-y-2 text-gray-300">
                <p>Mean: {stats.mean.toFixed(2)}</p>
                <p>Median: {stats.median.toFixed(2)}</p>
                <p>Std Dev: {stats.stdDev.toFixed(2)}</p>
                <p>Range: {stats.min.toFixed(2)} - {stats.max.toFixed(2)}</p>
              </div>
            ) : (
              <div className="space-y-2 text-gray-300">
                <p>Unique Values: {stats.uniqueValues}</p>
                <p>Most Common: {stats.mostCommon}</p>
                <p>Categories: {Object.keys(stats.frequencies).length}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;