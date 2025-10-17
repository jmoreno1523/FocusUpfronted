import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Ranking.css";

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [selectedGame, setSelectedGame] = useState("reaction");
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga
  const [error, setError] = useState(""); // Para manejar errores
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);  // Inicia carga
      setError("");  // Resetea el error en cada nueva llamada
      try {
        const res = await fetch(`http://localhost:4000/api/scores/ranking?game=${selectedGame}`);
        const data = await res.json();

        if (data.ok) {
          setRanking(data.data); // Actualiza los puntajes
        } else {
          setError("❌ No se pudo obtener el ranking, intenta más tarde."); // Si hay un problema
        }
      } catch (error) {
        console.error("⚠️ Error de conexión con el backend:", error);
        setError("⚠️ Error de conexión, por favor intenta más tarde.");  // Captura errores de conexión
      } finally {
        setLoading(false);  // Termina carga
      }
    };

    fetchRanking();
  }, [selectedGame]);

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
        </select>
      </div>

      {/* Mensaje de error */}
      {error && <p className="error-message">{error}</p>}

      {/* Si se está cargando */}
      {loading ? (
        <p>Cargando...</p>
      ) : ranking.length === 0 ? (
        <p>No hay registros para este juego aún.</p>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Juego</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.userId?.name || "Anónimo"}</td>
                <td>{item.game}</td>
                <td>
                  {item.game === "reaction"
                    ? `${item.score} ms`
                    : `${item.score} pts`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn-secondary" onClick={() => navigate("/selector")}>
        ⬅️ Volver
      </button>
    </div>
  );
}

export default Ranking;
