import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Statistics from './Statistics';

const StatisticsPage = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
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

  // Calculate current rows to display
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle page navigation
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

      {/* Dataset Preview Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dataset Preview</h2>
        <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column}
                    className="px-4 py-2 text-left text-gray-300 border-b border-gray-700"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}
                >
                  {columns.map(column => (
                    <td 
                      key={`${index}-${column}`}
                      className="px-4 py-2 border-b border-gray-700"
                    >
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-400">
              Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, data.length)} of {data.length} rows
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(currentPage - page) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render the Statistics component */}
      <Statistics data={data} columns={columns} />
    </div>
  );
};

export default StatisticsPage;