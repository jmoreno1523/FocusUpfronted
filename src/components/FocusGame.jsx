import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FocusGame.css";

function FocusGame() {
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState("Haz clic en el círculo diferente 🎯");
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 🎲 Generar la cuadrícula con mayor dificultad
  const generateGrid = () => {
    const baseColor = randomColor();
    // Hacer la diferencia más sutil según el puntaje
    const difficulty = Math.min(Math.floor(score / 5) * 5, 30); // Máximo 30 de ajuste
    const diffColor = slightlyDifferentColor(baseColor, 25 - difficulty);

    const size = score < 10 ? 9 : 16; // Aumentar a 4x4 después de 10 puntos
    const newGrid = Array(size).fill(baseColor);
    const randomIndex = Math.floor(Math.random() * size);
    newGrid[randomIndex] = diffColor;

    setTarget(randomIndex);
    setGrid(newGrid);
  };

  const handleClick = (index) => {
    if (gameOver || !gameStarted) return;

    if (index === target) {
      setScore((prev) => prev + 1);
      setMessage("✅ ¡Correcto! +1 punto");
      setTimeout(() => {
        setMessage("Haz clic en el círculo diferente 🎯");
        generateGrid();
      }, 800);
    } else {
      // ❌ PERDER INMEDIATAMENTE AL ELEGIR MAL
      setMessage("❌ ¡Fallaste! El juego ha terminado");
      endGame("❌ ¡Fallaste! Haz clic en el círculo incorrecto");
    }
  };

  // ⏱️ Cronómetro
  useEffect(() => {
    if (!gameStarted) return;
    
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [gameStarted]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame("⏱️ ¡Tiempo agotado!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🎨 Colores con dificultad progresiva
  const randomColor = () => {
    const r = Math.floor(Math.random() * 200 + 30);
    const g = Math.floor(Math.random() * 200 + 30);
    const b = Math.floor(Math.random() * 200 + 30);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const slightlyDifferentColor = (baseColor, adjustment = 25) => {
    const [r, g, b] = baseColor.match(/\d+/g).map(Number);
    
    // Elegir aleatoriamente qué canal modificar
    const channel = Math.floor(Math.random() * 3);
    
    const newColor = [r, g, b];
    newColor[channel] = Math.min(newColor[channel] + adjustment, 255);
    
    return `rgb(${newColor[0]}, ${newColor[1]}, ${newColor[2]})`;
  };

  // 💾 Fin del juego y envío al backend
  const endGame = async (msg) => {
    clearInterval(timerRef.current);
    setGameOver(true);
    setMessage(msg);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      console.error("⚠️ Usuario no encontrado en localStorage");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          game: "focus",
          score: score,
          timeMs: (60 - timeLeft) * 1000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar puntaje");
      console.log("✅ Puntaje guardado correctamente:", data);
    } catch (error) {
      console.error("❌ Error al guardar el puntaje:", error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setMessage("Haz clic en el círculo diferente 🎯");
    generateGrid();
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setGameStarted(false);
    setMessage("Haz clic en el círculo diferente 🎯");
    setGrid([]);
  };

  const getGridClass = () => {
    return grid.length === 16 ? "grid grid-4x4" : "grid grid-3x3";
  };

  return (
    <div className="focus-container">
      <h2>👁️ Juego de Atención Visual</h2>
      
      {!gameStarted && !gameOver ? (
        <div className="game-start">
          <p>Encuentra el círculo con color ligeramente diferente</p>
          <p><strong>⚠️ Cuidado: Un error y pierdes</strong></p>
          <button className="btn-primary" onClick={startGame}>
            🚀 Comenzar Juego
          </button>
        </div>
      ) : (
        <>
          <p className="status">
            ⏳ Tiempo: {timeLeft}s | 🏆 Puntaje: {score}
            {grid.length === 16 && " | 🔥 Modo Difícil (4x4)"}
          </p>
          <p className="message">{message}</p>

          <div className={getGridClass()}>
            {grid.map((color, index) => (
              <div
                key={index}
                className={`circle ${index === target ? 'target' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleClick(index)}
              ></div>
            ))}
          </div>
        </>
      )}

      <div className="actions">
        {gameOver ? (
          <>
            <button className="btn-primary" onClick={resetGame}>
              🔁 Jugar de nuevo
            </button>
            <button className="btn-secondary" onClick={() => navigate("/selector")}>
              ⬅️ Volver al Menú
            </button>
          </>
        ) : gameStarted ? (
          <button className="btn-secondary" onClick={() => navigate("/selector")}>
            ⬅️ Volver al Menú
          </button>
        ) : (
          <button className="btn-secondary" onClick={() => navigate("/selector")}>
            ⬅️ Volver al Menú
          </button>
        )}
      </div>

      {/* Información de dificultad */}
      {gameStarted && !gameOver && (
        <div className="difficulty-info">
          <p>💡 <strong>Dificultad:</strong> 
            {score < 5 ? " Básica (3x3)" : 
             score < 10 ? " Media (3x3)" : 
             " Avanzada (4x4)"}
            {score >= 5 && " - Colores más similares"}
          </p>
        </div>
      )}
    </div>
  );
}

export default FocusGame;