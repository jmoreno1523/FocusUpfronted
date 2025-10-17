import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ScoreHistory.css";

export default function ScoreHistory() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1) Traer historial del usuario
  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user._id) {
          setLoading(false);
          return;
        }
        const res = await fetch(`http://localhost:4000/api/scores/user/${user._id}`);
        const data = await res.json();
        if (data.ok) {
          // Ordenamos de más reciente a más antiguo
          const ordered = [...data.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setScores(ordered);
        }
      } catch (e) {
        console.error("⚠️ Error cargando historial:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Helpers de comparación
  // Por simplicidad: en "cups" un score MÁS ALTO es mejor; en "reaction" un timeMs MÁS BAJO es mejor
  const getDelta = (curr, prev) => {
    if (!prev) return { text: "—", trend: "same" };
    if (curr.game === "reaction") {
      const diff = prev.timeMs - curr.timeMs; // positivo = mejor (más rápido)
      if (diff > 0) return { text: `↓ ${diff} ms`, trend: "up" };
      if (diff < 0) return { text: `↑ ${Math.abs(diff)} ms`, trend: "down" };
      return { text: "=", trend: "same" };
    } else {
      const diff = curr.score - prev.score; // positivo = mejor (más aciertos)
      if (diff > 0) return { text: `↑ +${diff}`, trend: "up" };
      if (diff < 0) return { text: `↓ ${Math.abs(diff)}`, trend: "down" };
      return { text: "=", trend: "same" };
    }
  };

  // 3) Resúmenes por juego (best/avg)
  const summaries = useMemo(() => {
    const byGame = {};
    for (const s of scores) {
      const g = s.game;
      byGame[g] ||= { attempts: 0, bestScore: null, bestTime: null, sumScore: 0, sumTime: 0 };
      const bucket = byGame[g];
      bucket.attempts += 1;
      bucket.sumScore += s.score ?? 0;
      bucket.sumTime += s.timeMs ?? 0;

      // bestScore = máximo; bestTime = mínimo
      if (bucket.bestScore === null || s.score > bucket.bestScore) bucket.bestScore = s.score;
      if (bucket.bestTime === null || s.timeMs < bucket.bestTime) bucket.bestTime = s.timeMs;
    }
    // calcular promedios
    for (const g of Object.keys(byGame)) {
      const b = byGame[g];
      b.avgScore = b.attempts ? Math.round((b.sumScore / b.attempts) * 10) / 10 : 0;
      b.avgTime = b.attempts ? Math.round(b.sumTime / b.attempts) : 0;
    }
    return byGame;
  }, [scores]);

  // 4) Construir filas con comparación vs intento anterior del MISMO juego
  const rows = useMemo(() => {
    const lastByGame = {}; // anterior del mismo juego
    return scores.map((s) => {
      const prev = lastByGame[s.game];
      const delta = getDelta(s, prev);
      lastByGame[s.game] = s;
      const isPersonalBestScore =
        s.score != null && summaries[s.game]?.bestScore === s.score && s.game !== "reaction";
      const isPersonalBestTime =
        s.timeMs != null && summaries[s.game]?.bestTime === s.timeMs && s.game === "reaction";
      return { ...s, delta, isPB: isPersonalBestScore || isPersonalBestTime };
    });
  }, [scores, summaries]);

  return (
    <div className="history-container">
      <h2>📜 Historial y Progreso</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : scores.length === 0 ? (
        <p>No hay puntajes registrados aún.</p>
      ) : (
        <>
          {/* 5) Tarjetas de resumen por juego */}
          <div className="stats-grid">
            {Object.entries(summaries).map(([game, s]) => (
              <div key={game} className="stat-card">
                <div className="stat-title">
                  {game === "cups" ? "🥤 Vasos" : game === "reaction" ? "⚡ Reacción" : game}
                </div>
                <div className="stat-line">Intentos: <strong>{s.attempts}</strong></div>
                <div className="stat-line">Mejor puntaje: <strong>{s.bestScore ?? "—"}</strong></div>
                <div className="stat-line">Promedio puntaje: <strong>{s.avgScore ?? "—"}</strong></div>
                <div className="stat-line">Mejor tiempo: <strong>{s.bestTime ?? "—"} ms</strong></div>
                <div className="stat-line">Promedio tiempo: <strong>{s.avgTime ?? "—"} ms</strong></div>
              </div>
            ))}
          </div>

          {/* 6) Tabla comparativa intento a intento */}
          <table className="score-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Juego</th>
                <th>Puntaje</th>
                <th>Tiempo (ms)</th>
                <th>Δ vs anterior</th>
                <th>Mejor personal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    {item.game === "cups"
                      ? "Vasos"
                      : item.game === "reaction"
                      ? "Reacción"
                      : item.game}
                  </td>
                  <td>{item.score ?? "—"}</td>
                  <td>{item.timeMs ?? "—"}</td>
                  <td className={`delta ${item.delta.trend}`}>
                    {item.delta.text}
                  </td>
                  <td>{item.isPB ? <span className="badge-pb">🏅 PB</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <button className="btn-secondary" onClick={() => navigate("/selector")}>
        ⬅️ Volver
      </button>
    </div>
  );
}
