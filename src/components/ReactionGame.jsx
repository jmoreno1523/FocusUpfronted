import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importamos useNavigate
import { v4 as uuidv4 } from "uuid";  // Importamos la librería para generar un UUID
import "../styles/ReactionGame.css";

function ReactionGame() {
  const [status, setStatus] = useState("waiting"); // waiting | ready | now | done
  const [message, setMessage] = useState("Haz clic en iniciar para comenzar ⚡");
  const [reactionTime, setReactionTime] = useState(null);
  const [score, setScore] = useState(0);
  const [isGuest, setIsGuest] = useState(false);  // Nuevo estado para identificar si es invitado
  const [guestId, setGuestId] = useState(null);  // Guardaremos el ID único del invitado
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(0);
  const navigate = useNavigate(); // 👈 Hook para navegación

  // Inicia el juego
  const startGame = () => {
    setStatus("ready");
    setMessage("⏳ Espera a que el color cambie...");

    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // entre 2 y 5 segundos

    timeoutRef.current = setTimeout(() => {
      setStatus("now");
      setMessage("💥 ¡Haz clic ahora!");
      startTimeRef.current = new Date().getTime();
    }, randomDelay);
  };

  // Manejador de clics
  const handleClick = () => {
    if (status === "ready") {
      // Se adelantó
      clearTimeout(timeoutRef.current);
      setStatus("waiting");
      setMessage("❌ Muy pronto, intenta otra vez");
      setReactionTime(null);
    } else if (status === "now") {
      // Correcto
      const endTime = new Date().getTime();
      const reaction = endTime - startTimeRef.current;
      setReactionTime(reaction);
      setStatus("done");
      setMessage(`✅ Tu tiempo fue ${reaction} ms`);
      setScore(reaction);

      // Si es invitado, almacenamos el puntaje localmente
      if (isGuest) {
        // Guardamos el puntaje en MongoDB con un ID único para el invitado
        saveGuestScore(reaction);
      } else {
        saveScore(reaction);  // Si no es invitado, lo guardamos en el backend
      }
    }
  };

  // 💾 Guardar resultado en el backend para usuarios registrados
  const saveScore = async (reaction) => {
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
          game: "reaction",
          score: reaction,
          timeMs: reaction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar puntaje");
      console.log("✅ Puntaje guardado correctamente en MongoDB", data);
    } catch (error) {
      console.error("❌ Error al guardar el puntaje:", error);
    }
  };

  // 💾 Guardar resultado en MongoDB para invitados
  const saveGuestScore = async (reaction) => {
    const guestId = guestId || uuidv4(); // Generamos un ID único para el invitado si no existe
    setGuestId(guestId); // Guardamos el ID en el estado

    try {
      const res = await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: guestId,  // Usamos el ID del invitado
          game: "reaction",
          score: reaction,
          timeMs: reaction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al guardar puntaje");
      console.log("✅ Puntaje de invitado guardado correctamente en MongoDB", data);
    } catch (error) {
      console.error("❌ Error al guardar el puntaje del invitado:", error);
    }
  };

  // Reiniciar juego
  const resetGame = () => {
    clearTimeout(timeoutRef.current);
    setStatus("waiting");
    setReactionTime(null);
    setMessage("Haz clic en iniciar para comenzar ⚡");
  };

  // Manejo de modo invitado
  const handleGuestMode = () => {
    setIsGuest(true);  // Activamos el modo invitado
    alert("Estás jugando como invitado. Tu puntaje será guardado localmente.");
  };

  return (
    <div className="reaction-container">
      <h2>⚡ Juego de Tiempo de Reacción</h2>

      <div
        className={`reaction-box ${status}`}
        onClick={status !== "waiting" ? handleClick : undefined}
      >
        <p>{message}</p>
      </div>

      <div className="reaction-controls">
        {status === "done" ? (
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
          <>
            <button
              className="btn-primary"
              onClick={startGame}
              disabled={status === "ready" || status === "now"}
            >
              Iniciar
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/selector")}
            >
              Volver
            </button>
            {/* Agregamos el botón para jugar como invitado */}
            <button className="btn-guest" onClick={handleGuestMode}>
              Jugar como Invitado
            </button>
          </>
        )}
      </div>

      {reactionTime && (
        <p className="reaction-result">Tu tiempo: {reactionTime} ms</p>
      )}
    </div>
  );
}

export default ReactionGame;

