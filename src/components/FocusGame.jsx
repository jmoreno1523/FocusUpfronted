import { useState, useEffect, useRef } from "react";
import "./FocusGame.css";

function FocusGame() {
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState("Haz clic en el círculo diferente 🎯");
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  // 🎲 Generar la cuadrícula
  const generateGrid = () => {
    const baseColor = randomColor();
    const diffColor = slightlyDifferentColor(baseColor);

    const newGrid = Array(9).fill(baseColor);
    const randomIndex = Math.floor(Math.random() * 9);
    newGrid[randomIndex] = diffColor;

    setTarget(randomIndex);
    setGrid(newGrid);
  };

  const handleClick = (index) => {
    if (gameOver) return;

    if (index === target) {
      setScore((prev) => prev + 1);
      setMessage("✅ ¡Bien hecho!");
      generateGrid();
    } else {
      setMessage("❌ Fallaste, intenta de nuevo");
    }
  };

  // ⏱️ Cronómetro
  useEffect(() => {
    generateGrid();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🎨 Colores
  const randomColor = () => {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const slightlyDifferentColor = (baseColor) => {
    const [r, g, b] = baseColor.match(/\d+/g).map(Number);
    const adjust = (value) => Math.min(value + 25, 255);
    return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
  };

  // 💾 Fin del juego y envío al backend
  const endGame = async () => {
    setGameOver(true);
    setMessage("⏱️ ¡Tiempo agotado!");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      console.error("⚠️ Usuario no encontrado en localStorage");
      return;
    }

    // Guardar el puntaje en localStorage temporalmente
    const previousScores = JSON.parse(localStorage.getItem("scores")) || [];
    previousScores.push({ game: "focus", score, timeMs: (60 - timeLeft) * 1000 });
    localStorage.setItem("scores", JSON.stringify(previousScores));

    try {
      const res = await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          game: "focus",
          score,
          timeMs: (60 - timeLeft) * 1000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar puntaje");
      console.log("✅ Puntaje guardado correctamente en MongoDB", data);
    } catch (error) {
      console.error("❌ Error al guardar el puntaje:", error);
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setMessage("Haz clic en el círculo diferente 🎯");
    setGameOver(false);
    generateGrid();
    startTimer();

    // Limpiar el puntaje almacenado al reiniciar
    localStorage.removeItem("scores");
  };

  return (
    <div className="focus-container">
      <h2>👁️ Juego de Atención Visual</h2>
      <p>
        ⏳ Tiempo: {timeLeft}s | 🏆 Puntaje: {score}
      </p>
      <p>{message}</p>

      <div className="grid">
        {grid.map((color, index) => (
          <div
            key={index}
            className="circle"
            style={{ backgroundColor: color }}
            onClick={() => handleClick(index)}
          ></div>
        ))}
      </div>

      {gameOver ? (
        <button className="btn-primary" onClick={resetGame}>
          🔁 Jugar de nuevo
        </button>
      ) : null}

      <button
        className="btn-secondary"
        onClick={() => (window.location.href = "/selector")}
      >
        ⬅️ Volver
      </button>
    </div>
  );
}

export default FocusGame;
