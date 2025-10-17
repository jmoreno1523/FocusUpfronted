import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MemoryGame.css";

const CARD_SYMBOLS = ['🎮', '⭐', '🎯', '🎨', '🚀', '🎵', '🏆', '💡'];

function MemoryGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Obtener nombre del jugador
  useEffect(() => {
    const name = sessionStorage.getItem("memoryGuestName");
    if (name) {
      setPlayerName(name);
    } else {
      // Si no hay nombre, volver a la pantalla de nombre
      navigate("/memory-guest");
    }
  }, [navigate]);

  // Inicializar el juego
  const initializeGame = useCallback(() => {
    const gameCards = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameCompleted(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Temporizador
  useEffect(() => {
    let interval;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Manejar clic en carta
  const handleCardClick = (id) => {
    if (!gameStarted) setGameStarted(true);
    
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(prev => prev + 1);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        setSolved(prev => [...prev, firstId, secondId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // Verificar si el juego está completo
  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setGameCompleted(true);
      saveGuestScore();
    }
  }, [solved, cards.length]);

  // Guardar puntaje del invitado - SOLO MEJOR TIEMPO
  const saveGuestScore = async () => {
    try {
      const guestId = `memory_guest_${playerName.replace(/\s+/g, '_').toLowerCase()}`;
      
      await fetch("http://localhost:4000/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guestId,
          game: "memory",
          score: time * 1000, // Tiempo en milisegundos
          timeMs: time * 1000,
          playerName: playerName // Nombre del jugador invitado
        })
      });
    } catch (error) {
      console.error("Error guardando puntaje:", error);
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleBackToStart = () => {
    // Limpiar sessionStorage y volver al inicio
    sessionStorage.removeItem("memoryGuestName");
    navigate("/");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="memory-game-container">
      <div className="memory-game-header">
        <button className="btn-back" onClick={() => navigate("/memory-guest")}>
          ← Volver
        </button>
        <div className="game-title">
          <h2>🎴 Juego de Memoria</h2>
          <p className="player-info">Jugador: <strong>{playerName}</strong></p>
        </div>
        <div className="game-stats">
          <span>⏱️ {formatTime(time)}</span>
          <span>🔄 {moves} movimientos</span>
          <span>✅ {solved.length / 2}/8 pares</span>
        </div>
      </div>

      {gameCompleted && (
        <div className="game-completed">
          <h3>🎉 ¡Felicidades {playerName}!</h3>
          <p>Completaste el juego en <strong>{formatTime(time)}</strong> con <strong>{moves}</strong> movimientos</p>
          <p className="ranking-note">🏆 Tu mejor tiempo ha sido guardado</p>
          <div className="completed-buttons">
            <button className="btn-primary" onClick={handleRestart}>
              🔄 Jugar de nuevo
            </button>
            <button className="btn-secondary" onClick={handleBackToStart}>
              🏠 Volver al Inicio
            </button>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${
              flipped.includes(card.id) || solved.includes(card.id) ? 'flipped' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.symbol}</div>
            </div>
          </div>
        ))}
      </div>

      {!gameCompleted && (
        <button className="btn-restart" onClick={handleRestart}>
          🔄 Reiniciar Juego
        </button>
      )}
    </div>
  );
}

export default MemoryGame;