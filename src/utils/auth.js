// src/utils/auth.js
export async function apiLogin(email) {
  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  return data.usuario; // devuelve el usuario desde MongoDB
}

export async function fetchLibros() {
  const res = await fetch("http://localhost:5000/api/libros");
  return res.json();
}
