import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Auth from "./components/Auth";
import GameSelector from "./components/GameSelector";
import ReactionGame from "./components/ReactionGame";
import FocusGame from "./components/FocusGame";
import ScoreHistory from "./components/ScoreHistory";
import CupGame from "./components/CupGame"; // 🥤 Juego de Vasos y Pelota
import Ranking from "./components/Ranking"; // 🏆 Nuevo import para el ranking
import MemoryGuest from "./components/MemoryGuest";
import MemoryGame from "./components/MemoryGame";
import "./App.css";

// ✅ Componente de pantalla principal
function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/"); // Si no hay usuario, vuelve al login
    }
  }, [navigate]);

  return (
    <div className="container">
      <h1>FocusUp – Entrenador de Concentración</h1>
      <p>Bienvenido 👋. Mejora tu concentración con minijuegos cognitivos.</p>
      <button className="btn-primary" onClick={() => navigate("/selector")}>
        Comenzar
      </button>
    </div>
  );
}

// ✅ Enrutador principal
function App() {
  return (
    <Router>
      <Routes>
        {/* Pantalla de Login / Registro */}
        <Route path="/" element={<Auth />} />

        {/* Pantalla principal */}
        <Route path="/home" element={<Home />} />

        {/* Selector de minijuegos */}
        <Route path="/selector" element={<GameSelector />} />

        {/* ⚡ Juego de Tiempo de Reacción */}
        <Route path="/game/reaction" element={<ReactionGame />} />

        {/* 👁️ Juego de Atención Visual */}
        <Route path="/game/focus" element={<FocusGame />} />

        {/* 🥤 Juego de Vasos y Pelota */}
        <Route path="/game/cups" element={<CupGame />} />

        {/* 📜 Historial de Puntajes */}
        <Route path="/history" element={<ScoreHistory />} />

        {/* 🏆 Ranking general */}
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/memory-guest" element={<MemoryGuest />} />
<Route path="/memory-game" element={<MemoryGame />} />
      </Routes>
    </Router>
  );
}

export default App;

