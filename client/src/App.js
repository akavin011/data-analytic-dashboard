import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisualizationPage from "./Components/VisualizationPage";
import Dashboard from "./Pages/Dashboard";
import Chat from "./Components/Chat";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard /> } />
        <Route path="/visualize" element={<VisualizationPage/> } />
        <Route path="/chat" element={<Chat /> } />
      </Routes>
    </Router>
  );
};

export default App;
