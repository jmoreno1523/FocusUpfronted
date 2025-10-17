import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MemoryGuest.css";

function MemoryGuest() {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartGame = () => {
    if (!playerName.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (playerName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    // Guardar nombre en sessionStorage para usarlo en el juego
    sessionStorage.setItem("memoryGuestName", playerName.trim());
    navigate("/memory-game");
  };

  return (
    <div className="memory-guest-container">
      <div className="memory-guest-card">
        <h2>🎴 Juego de Memoria</h2>
        <p className="subtitle">Modo Invitado - Solo el mejor tiempo cuenta</p>
        
        <div className="game-info">
          <h3>📋 Instrucciones:</h3>
          <ul>
            <li>Encuentra todos los pares de cartas</li>
            <li>Tu tiempo será guardado automáticamente</li>
            <li>🎯 Solo tu <strong>mejor tiempo</strong> aparecerá en el ranking</li>
            <li>Puedes jugar las veces que quieras</li>
          </ul>
        </div>

        <div className="name-input-section">
          <label htmlFor="playerName">¿Cómo te llamas?</label>
          <input
            type="text"
            id="playerName"
            placeholder="Ingresa tu nombre"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError("");
            }}
            maxLength={20}
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="buttons-section">
          <button 
            className="btn-start"
            onClick={handleStartGame}
          >
            🚀 Comenzar Juego
          </button>
          <button 
            className="btn-back"
            onClick={() => navigate("/")}
          >
            ↩️ Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemoryGuest;