import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ["admin", "estudiante"], default: "estudiante" },
});

export default mongoose.model("Usuario", usuarioSchema);
