import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const VisualizationPage = () => {
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("chartData")) || [];
    if (storedData.length === 0) {
      navigate("/");
      return;
    }

    const keys = Object.keys(storedData[0]);
    const numericKeys = keys.filter((key) => !isNaN(storedData[0][key]));

    if (numericKeys.length === 0) return;

    const formattedData = storedData.map((row) => ({
      name: row[keys[0]],
      value: parseFloat(row[numericKeys[0]]) || 0,
    }));

    setChartData(formattedData.slice(0, 10));
  }, [navigate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Data Dashboard</h2>
      
      <div className="grid grid-cols-2 gap-8 p-4 bg-white shadow-lg rounded-lg">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Bar Chart</h3>
          <BarChart width={400} height={300} data={chartData} className="mx-auto">
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Pie Chart</h3>
          <PieChart width={400} height={300} className="mx-auto">
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Line Chart</h3>
          <LineChart width={400} height={300} data={chartData} className="mx-auto">
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" />
          </LineChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-center mb-2">Additional Stats</h3>
          <p className="text-center text-gray-700">Total Entries: {chartData.length}</p>
          <p className="text-center text-gray-700">Highest Value: {Math.max(...chartData.map(d => d.value))}</p>
          <p className="text-center text-gray-700">Lowest Value: {Math.min(...chartData.map(d => d.value))}</p>
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <button onClick={ () => navigate("/chat") } className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Chat with Data
        </button>
      </div>
    </div>
  );
};

export default VisualizationPage;