import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisualizationPage from "./Components/VisualizationPage";
import StatisticsPage from "./Components/StatisticsPage";
import CorrelationPage from "./Components/CorrelationPage";
import Dashboard from "./Pages/Dashboard";
import Chat from "./Components/Chat";
import Navbar from './Components/Navbar';
import GlowingBackground from './Components/GlowingBackground';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden">
        <GlowingBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visualize" element={<VisualizationPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/correlation" element={<CorrelationPage />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;