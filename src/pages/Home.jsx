import React, { useEffect, useState } from "react";
import "../styles/home.css";
import { api } from "../utils/api";

export default function Home() {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Llamada a backend
        const data = await api.getLibros();
        // data puede ser { books: [...] } o un array, depende de tu backend.
        // Intentamos cubrir ambos casos sin tocar el JSX.
        const librosFromServer = data.books || data.libros || data || [];
        if (mounted) {
          // si tu estado se llama 'libros' y setter 'setLibros'
          if (typeof setLibros === "function") {
            setLibros(librosFromServer);
          } else {
            // si usas otro nombre de estado, intenta asignarlo donde corresponda
            console.warn(
              "setLibros no encontrado - adapta el nombre del setter"
            );
          }
        }
      } catch (err) {
        console.error("Error cargando libros:", err);
        // Mantén cualquier estado de error que tu UI utilice:
        if (typeof setError === "function")
          setError(err.message || "Error cargando libros");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">
      <h2>Bienvenido a la Biblioteca 📚</h2>
      <h3>Catálogo de Libros</h3>
      <div className="catalogo">
        {libros.map((libro) => (
          <div key={libro._id} className="libro">
            <h4>{libro.titulo}</h4>
            <p>
              {libro.autor} ({libro.anio})
            </p>
            <p>Género: {libro.genero}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
