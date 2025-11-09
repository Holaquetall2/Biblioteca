// Biblioteca-main/backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import conectarDB from "./db.js";
import librosRoutes from "./routes/libros.js";
import usuariosRoutes from "./routes/usuarios.js";
import Usuario from "./models/Usuario.js"; // IMPORT que faltaba

dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // ajusta si tu frontend corre en otra URL/puerto
    credentials: true,
  })
);
app.use(express.json());

// Conexión a la base de datos
conectarDB();

// Montar rutas existentes
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);

/**
 * Login simple (por ahora valida solo email — si quieres password, añade campo y hashing)
 * Devuelve el usuario en JSON. En la versión con cookies/JWT colocaremos token HttpOnly.
 */
app.post("/api/login", async (req, res) => {
  const { email /*, password*/ } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }
    // Si más adelante agregas password: compara hash aquí
    return res.json({ success: true, usuario });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// (Opcional) endpoint raíz
app.get("/", (req, res) => res.json({ ok: true, message: "API Biblioteca" }));

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
