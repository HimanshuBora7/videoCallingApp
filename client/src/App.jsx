import { Routes, Route } from "react-router-dom";
import RoomPage from "./screen/room";

import { useState } from "react";
import "./App.css";
import LobbyScreen from "./screen/lobby";
function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
