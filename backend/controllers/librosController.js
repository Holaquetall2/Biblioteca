import Libro from "../models/Libro.js";

/**
 * Obtener todos los libros
 */
export const obtenerLibros = async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    console.error("Error al obtener libros:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * Agregar un nuevo libro
 */
export const agregarLibro = async (req, res) => {
  try {
    const { titulo, autor } = req.body;

    // Validación de campos
    if (!titulo || !autor) {
      return res
        .status(400)
        .json({ mensaje: "Título y autor son obligatorios" });
    }

    const nuevoLibro = new Libro({ titulo, autor });
    await nuevoLibro.save();
    res.status(201).json(nuevoLibro);
  } catch (error) {
    console.error("Error al agregar libro:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
