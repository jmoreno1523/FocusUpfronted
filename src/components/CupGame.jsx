import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CupGame.css";

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
  const cupsPositions = useRef([]);

  useEffect(() => {
    // Inicializar posiciones de los vasos
    cupsPositions.current = Array.from({ length: numCups }, (_, i) => i);
    initGame();
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const initGame = () => {
    const random = Math.floor(Math.random() * numCups);
    setBallIndex(random);
    setShowBall(true);

    // Resetear posiciones visuales
    resetCupPositions();

    setTimeout(() => {
      setShowBall(false);
      startMixing();
    }, 1500);
  };

  const resetCupPositions = () => {
    const cups = document.querySelectorAll(".cup");
    cups.forEach((cup, index) => {
      cup.style.transition = "none";
      cup.style.transform = "none";
      cup.style.left = "0px";
      cup.style.zIndex = "1";
    });
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

    // Aumentar swaps según número de vasos
    const baseSwaps = 8;
    const additionalSwaps = Math.floor(numCups * 1.5);
    const totalSwaps = baseSwaps + additionalSwaps;
    
    // Velocidad controlada que aumenta gradualmente
    const baseSpeed = Math.max(450 - (numCups * 40), 200);

    console.log(`Nivel: ${numCups} vasos, Swaps: ${totalSwaps}, Velocidad: ${baseSpeed}ms`);

    for (let i = 0; i < totalSwaps; i++) {
      await new Promise((r) => setTimeout(r, baseSpeed));
      
      // EN TODOS LOS NIVELES mover múltiples vasos
      await animateControlledSwaps();
    }

    // Asegurar que todos los vasos vuelvan a su posición final
    setTimeout(() => {
      resetCupPositions();
    }, 100);

    setMixing(false);
    setMessage("¿Dónde está la pelota?");
  };

  // Función principal de animación - CONTROLADA
  const animateControlledSwap = async (a, b) => {
    return new Promise(async (resolve) => {
      const cups = document.querySelectorAll(".cup");
      const cupA = cups[a];
      const cupB = cups[b];

      if (!cupA || !cupB) {
        resolve();
        return;
      }

      // Configurar transiciones controladas
      cupA.style.transition = "all 0.4s ease-in-out";
      cupB.style.transition = "all 0.4s ease-in-out";

      // Fase 1: Levantar
      cupA.style.zIndex = "20";
      cupB.style.zIndex = "20";
      cupA.style.transform = "translateY(-25px)";
      cupB.style.transform = "translateY(-25px)";

      await new Promise(r => setTimeout(r, 200));

      // Fase 2: Mover horizontalmente (posición relativa)
      const cupWidth = 100;
      const gap = 20;
      const totalMove = (cupWidth + gap) * Math.abs(b - a);
      
      cupA.style.transform = `translateY(-15px) translateX(${b > a ? totalMove : -totalMove}px)`;
      cupB.style.transform = `translateY(-15px) translateX(${a > b ? totalMove : -totalMove}px)`;

      await new Promise(r => setTimeout(r, 300));

      // Fase 3: Bajar
      cupA.style.transform = `translateX(${b > a ? totalMove : -totalMove}px)`;
      cupB.style.transform = `translateX(${a > b ? totalMove : -totalMove}px)`;

      await new Promise(r => setTimeout(r, 200));

      // Fase 4: Reset inmediato pero suave
      setTimeout(() => {
        cupA.style.transition = "none";
        cupB.style.transition = "none";
        cupA.style.transform = "none";
        cupB.style.transform = "none";
        cupA.style.zIndex = "1";
        cupB.style.zIndex = "1";
        
        // Forzar reflow
        cupA.offsetHeight;
        cupB.offsetHeight;
      }, 50);

      // Actualizar posición de la pelota
      if (ballIndex === a) {
        setBallIndex(b);
      } else if (ballIndex === b) {
        setBallIndex(a);
      }

      // Pequeña pausa antes de resolver
      await new Promise(r => setTimeout(r, 100));
      resolve();
    });
  };

  // Función para mover múltiples vasos de forma CONTROLADA
  const animateControlledSwaps = async () => {
    const numSimultaneous = Math.min(3, Math.max(1, Math.floor(numCups / 2)));
    
    const swaps = [];
    
    for (let s = 0; s < numSimultaneous; s++) {
      // Seleccionar pares únicos
      const availableIndices = Array.from({ length: numCups }, (_, i) => i);
      const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
      
      if (shuffled.length >= 2) {
        const a = shuffled[0];
        const b = shuffled[1];
        
        // Ejecutar swaps secuencialmente, no simultáneamente
        swaps.push(animateControlledSwap(a, b));
      }
    }
    
    // Ejecutar swaps con un pequeño delay entre ellos
    for (let i = 0; i < swaps.length; i++) {
      await swaps[i];
      if (i < swaps.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  };

  const handlePick = (idx) => {
    if (mixing || gameOver) return;

    if (idx === ballIndex) {
      setScore((s) => s + 1);
      setMessage("✅ ¡Correcto!");
      
      // Mostrar la pelota brevemente
      setShowBall(true);
      setTimeout(() => {
        setShowBall(false);
        if (numCups < 6) setNumCups((n) => n + 1);
        initGame();
      }, 800);
    } else {
      setShowBall(true);
      endGame("❌ Fallaste. La pelota no estaba ahí.");
    }
  };

  const endGame = async (msg) => {
    clearInterval(timerRef.current);
    setMessage(msg);
    setGameOver(true);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      console.error("⚠️ No se encontró usuario válido en localStorage");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
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
        ⏳ Tiempo: {timeLeft}s | 🏆 Puntaje: {score} | 🥤 Nivel: {numCups} vasos
      </p>
      <p>{message}</p>

      <div className="cups-area">
        {Array.from({ length: numCups }).map((_, i) => (
          <div 
            key={i} 
            className="cup" 
            onClick={() => handlePick(i)}
          >
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

      {/* Información de dificultad */}
      <div className="difficulty-info">
        <p>💡 <strong>Dificultad:</strong> 
          {numCups >= 4 ? 
            " ¡Múltiples vasos en movimiento simultáneo! " : 
            numCups >= 3 ?
            " Vasos moviéndose en secuencia " :
            " Sigue la pelota cuidadosamente "
          }
        </p>
      </div>
    </div>
  );
}