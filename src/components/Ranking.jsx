import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Ranking.css";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [selectedGame, setSelectedGame] = useState("reaction");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:4000/api/scores/ranking?game=${selectedGame}`);
        const data = await res.json();

        if (data.ok) {
          setRanking(data.data);
        } else {
          setError("❌ No se pudo obtener el ranking, intenta más tarde.");
        }
      } catch (error) {
        console.error("⚠️ Error de conexión con el backend:", error);
        setError("⚠️ Error de conexión, por favor intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [selectedGame]);

  // Función para formatear el puntaje según el juego
  const formatScore = (item) => {
    switch (item.game) {
      case "reaction":
        return `${item.score} ms`;
      case "memory":
        // Formatear tiempo de memoria (ms a minutos:segundos)
        const seconds = Math.floor(item.score / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      default:
        return `${item.score} pts`;
    }
  };

  // Función para obtener el icono del jugador
  const getPlayerIcon = (item) => {
    return item.isGuest ? "👤" : "⭐";
  };

  return (
    <div className="ranking-container">
      <h2>🏆 Ranking General</h2>

      {/* Barra de filtro */}
      <div className="filter-bar">
        <label>Selecciona un juego:</label>
        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
          <option value="reaction">⚡ Tiempo de Reacción</option>
          <option value="focus">👁️ Atención Visual</option>
          <option value="cups">🥤 Vasos y Pelota</option>
          <option value="memory">🎴 Juego de Memoria</option>
        </select>
      </div>

      {/* Información del ranking actual */}
      <div className="ranking-info">
        {selectedGame === "memory" && (
          <p>🎯 Se muestra el mejor tiempo de cada jugador</p>
        )}
        {selectedGame === "reaction" && (
          <p>⚡ Se muestra el mejor tiempo de reacción</p>
        )}
        {!["memory", "reaction"].includes(selectedGame) && (
          <p>⭐ Se muestra el mejor puntaje de cada jugador</p>
        )}
      </div>

      {/* Mensaje de error */}
      {error && <p className="error-message">{error}</p>}

      {/* Estado de carga */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando ranking...</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="empty-state">
          <p>📊 No hay registros para este juego aún.</p>
          <p>¡Sé el primero en jugar!</p>
        </div>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Tipo</th>
              <th>
                {selectedGame === "memory" || selectedGame === "reaction" 
                  ? "Tiempo" 
                  : "Puntaje"}
              </th>
              {selectedGame === "memory" && <th>Intentos</th>}
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, index) => (
              <tr key={item._id} className={index < 3 ? `top-${index + 1}` : ''}>
                <td>
                  {index === 0 ? "🥇" : 
                   index === 1 ? "🥈" : 
                   index === 2 ? "🥉" : 
                   index + 1}
                </td>
                <td>
                  <span className="player-name">
                    {getPlayerIcon(item)} {item.playerName}
                    {item.isGuest && <span className="guest-badge">Invitado</span>}
                  </span>
                </td>
                <td>
                  {item.game === "reaction" && "⚡ Reacción"}
                  {item.game === "focus" && "👁️ Atención"}
                  {item.game === "cups" && "🥤 Vasos"}
                  {item.game === "memory" && "🎴 Memoria"}
                </td>
                <td className="score-value">
                  {formatScore(item)}
                </td>
                {selectedGame === "memory" && (
                  <td>
                    <span className="attempts-badge">{item.attempts || 1}</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn-secondary" onClick={() => navigate("/selector")}>
        ⬅️ Volver al Menú
      </button>
    </div>
  );
}

export default Ranking;