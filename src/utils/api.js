// Biblioteca-main/src/utils/api.js
const BASE = "http://localhost:5000/api";

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || "Error en API";
      throw new Error(message);
    }
    return data;
  } catch (err) {
    // si no es JSON, devolver texto
    if (!res.ok) throw new Error(text || "Error en API");
    return text;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  // Users & Books
  getUsuarios: () => request("/usuarios"),
  createUsuario: (payload) =>
    request("/usuarios", { method: "POST", body: JSON.stringify(payload) }),
  getLibros: () => request("/libros"),
  createLibro: (payload) =>
    request("/libros", { method: "POST", body: JSON.stringify(payload) }),
  updateLibro: (id, payload) =>
    request(`/libros/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteLibro: (id) => request(`/libros/${id}`, { method: "DELETE" }),
};
