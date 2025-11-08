import express from "express";
import {
  obtenerLibros,
  agregarLibro,
} from "../controllers/librosController.js";

const router = express.Router();

router.get("/", obtenerLibros);
router.post("/", agregarLibro);

export default router;
