import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CupGame.css";

export default function CupGame() {
  const [numCups, setNumCups] = useState(2);
  const [ballIndex, setBallIndex] = useState(0);
  const [showBall, setShowBall] = useState(true);
  const [mixing, setMixing] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Encuentra la pelota 🎯");
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    initGame();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const initGame = () => {
    const random = Math.floor(Math.random() * numCups);
    setBallIndex(random);
    setShowBall(true);

    setTimeout(() => {
      setShowBall(false);
      startMixing();
    }, 1500);
  };

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

  const startMixing = async () => {
    setMixing(true);
    setMessage("Mezclando los vasos... 🔄");

    let swaps = 5 + numCups * 2;
    let speed = Math.max(400 - numCups * 40, 120);

    for (let i = 0; i < swaps; i++) {
      await new Promise((r) => setTimeout(r, speed));
      const a = Math.floor(Math.random() * numCups);
      let b = Math.floor(Math.random() * numCups);
      while (b === a) b = Math.floor(Math.random() * numCups);

      animateSwap(a, b);
    }

    setMixing(false);
    setMessage("¿Dónde está la pelota?");
  };

  const animateSwap = (a, b) => {
    const cups = document.querySelectorAll(".cup");
    const cupA = cups[a];
    const cupB = cups[b];

    if (!cupA || !cupB) return;

    cupA.style.transition = "transform 0.4s ease";
    cupB.style.transition = "transform 0.4s ease";

    // 🎥 Giro visual
    cupA.style.transform = "rotateY(180deg)";
    cupB.style.transform = "rotateY(-180deg)";

    setTimeout(() => {
      cupA.style.transform = "rotateY(0deg)";
      cupB.style.transform = "rotateY(0deg)";
    }, 400);

    if (ballIndex === a) setBallIndex(b);
    else if (ballIndex === b) setBallIndex(a);
  };

  const handlePick = (idx) => {
    if (mixing || gameOver) return;

    if (idx === ballIndex) {
      setScore((s) => s + 1);
      setMessage("✅ ¡Correcto!");
      if (numCups < 6) setNumCups((n) => n + 1);
      setTimeout(() => initGame(), 800);
    } else {
      setShowBall(true);
      endGame("❌ Fallaste. La pelota no estaba ahí.");
    }
  };

  // ✅ Actualizado: maneja fin de juego y guarda puntaje
  const endGame = async (msg) => {
    clearInterval(timerRef.current);
    setMessage(msg);
    setGameOver(true);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      console.error("⚠️ No se encontró usuario válido en localStorage");
      return;
    }

    // 📤 Enviar puntaje al backend
    try {
      const res = await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id, // ✅ ahora usa el _id real
          game: "cups",
          score,
          timeMs: (90 - timeLeft) * 1000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar puntaje");

      console.log("✅ Puntaje guardado correctamente:", data);
    } catch (error) {
      console.error("❌ Error al guardar el puntaje:", error);
    }
  };

  const resetGame = () => {
    setNumCups(2);
    setScore(0);
    setTimeLeft(90);
    setGameOver(false);
    setMessage("Encuentra la pelota 🎯");
    initGame();
    startTimer();
  };

  return (
    <div className="cupgame-wrap">
      <h2>🥤 Vasos y Pelota</h2>
      <p className="status">
        ⏳ Tiempo: {timeLeft}s | 🏆 Puntaje: {score}
      </p>
      <p>{message}</p>

      <div className="cups-area">
        {Array.from({ length: numCups }).map((_, i) => (
          <div key={i} className="cup" onClick={() => handlePick(i)}>
            {i === ballIndex && showBall && <div className="ball">⚪</div>}
            <div className="cup-body"></div>
          </div>
        ))}
      </div>

      <div className="actions">
        {gameOver ? (
          <>
            <button className="btn-primary" onClick={resetGame}>
              🔁 Jugar de nuevo
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/selector")}
            >
              ⬅️ Volver
            </button>
          </>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => navigate("/selector")}
          >
            ⬅️ Volver
          </button>
        )}
      </div>
    </div>
  );
}

