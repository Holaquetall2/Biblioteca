import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import conectarDB from "./db.js";
import librosRoutes from "./routes/libros.js";
import usuariosRoutes from "./routes/usuarios.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
conectarDB();

// Rutas
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }
    // Si no tienes password en la base, por ahora solo valida email
    res.json({ success: true, usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});
