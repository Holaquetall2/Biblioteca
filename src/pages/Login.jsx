import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiLogin } from "../utils/auth";
import { api } from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // suponiendo que tienes estados 'email' y 'password' en el componente
      const emailValue = typeof email === "string" ? email : email?.value || "";
      const passwordValue =
        typeof password === "string" ? password : password?.value || "";

      // Llamada al backend
      const data = await api.login(emailValue, passwordValue);
      // backend devuelve { success: true, usuario: {...} } según tu server
      const usuario = data.usuario || data.user || data;
      if (!usuario) throw new Error("Usuario no encontrado");

      // guardar en contexto (no en localStorage)
      login(usuario);

      // redirigir manteniendo el comportamiento visual existente:
      // si tu código original hacía window.location.href = '/', mantenlo
      // si tenía navegación por react-router, usa history.push('/') o similar
      if (typeof window !== "undefined") window.location.href = "/";
    } catch (err) {
      // conserva el manejo de errores visual que ya uses:
      // si tenías setError, úsalo; sino, mostramos alert minimal
      if (typeof setError === "function") {
        setError(err.message || "Error al iniciar sesión");
      } else {
        alert(err.message || "Error al iniciar sesión");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
