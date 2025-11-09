import Usuario from "../models/Usuario.js";

/**
 * Obtener todos los usuarios
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * Registrar un nuevo usuario
 */
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, rol } = req.body;

    // Validación de campos
    if (!nombre || !email) {
      return res
        .status(400)
        .json({ mensaje: "Nombre y email son obligatorios" });
    }

    // Verificar si el email ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    const nuevoUsuario = new Usuario({ nombre, email, rol });
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
