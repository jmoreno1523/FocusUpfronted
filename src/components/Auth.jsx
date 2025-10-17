import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 📝 Maneja cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = isLogin
        ? "http://localhost:4000/api/auth/login"
        : "http://localhost:4000/api/auth/register";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "❌ Error en la operación");
        return;
      }

      // ✅ Si el login es exitoso, guarda el usuario completo (con _id)
      if (isLogin && data.user?._id) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`👋 Bienvenido ${data.user.name}`);
        navigate("/home");
      } else if (!isLogin) {
        alert("✅ Registro completado. Ahora inicia sesión.");
        setIsLogin(true);
      }
    } catch (err) {
      setError("⚠️ Error de conexión con el servidor");
    }
  };

  // 🚀 Lógica para modo invitado
  const handleGuestLogin = () => {
    const guestUser = { name: "Invitado", email: "invitado@ejemplo.com" };
    localStorage.setItem("user", JSON.stringify(guestUser)); // Guardamos el invitado en localStorage
    navigate("/home"); // Redirigimos a la página de inicio
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-primary">
          {isLogin ? "Entrar" : "Registrarse"}
        </button>
      </form>

      {/* Botón para el Modo Invitado */}
      <button onClick={handleGuestLogin} className="btn-secondary">
        Jugar como Invitado
      </button>

      {error && <p className="error-message">{error}</p>}

      <p>
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
        <button
          className="link-btn"
          onClick={() => setIsLogin(!isLogin)}
          type="button"
        >
          {isLogin ? "Regístrate aquí" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}

export default Auth;
