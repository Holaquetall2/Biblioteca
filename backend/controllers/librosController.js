import Libro from "../models/Libro.js";

// Obtener todos los libros
export const obtenerLibros = async (req, res) => {
  const libros = await Libro.find();
  res.json(libros);
};

// Agregar un libro
export const agregarLibro = async (req, res) => {
  const nuevoLibro = new Libro(req.body);
  await nuevoLibro.save();
  res.json(nuevoLibro);
};
