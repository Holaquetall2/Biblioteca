import Usuario from '../models/Usuario.js';

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
};

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const nuevoUsuario = new Usuario(req.body);
  await nuevoUsuario.save();
  res.json(nuevoUsuario);
