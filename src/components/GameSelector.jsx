import { useNavigate } from "react-router-dom";
import "./GameSelector.css";

function GameSelector() {
  const navigate = useNavigate();

  const handleSelect = (game) => {
    navigate(`/game/${game}`);
  };

  return (
    <div className="selector-container">
      <h2 className="title">🎮 Selecciona un Minijuego</h2>

      <div className="games-list">
        {/* ⚡ Juego 1: Tiempo de Reacción */}
        <button
          onClick={() => handleSelect("reaction")}
          className="game-btn reaction"
        >
          ⚡ Tiempo de Reacción
        </button>

        {/* 👁️ Juego 2: Atención Visual */}
        <button
          onClick={() => handleSelect("focus")}
          className="game-btn focus"
        >
          👁️ Atención Visual
        </button>

        {/* 🥤 Juego 3: Vasos y Pelota */}
        <button
          onClick={() => handleSelect("cups")}
          className="game-btn cups"
        >
          🥤 Vasos y Pelota
        </button>
      </div>

      {/* 🧾 Ver historial de puntajes */}
      <div className="extra-options">
        <button className="btn-secondary" onClick={() => navigate("/history")}>
          📜 Ver Historial de Puntajes
        </button>
      </div>

      {/* 🏆 Nuevo botón para Ranking General */}
      <div className="extra-options">
        <button className="btn-ranking" onClick={() => navigate("/ranking")}>
          🏆 Ver Ranking General
        </button>
      </div>

      <button className="back-btn" onClick={() => navigate("/home")}>
        ⬅️ Volver al inicio
      </button>
    </div>
  );
}

export default GameSelector;
