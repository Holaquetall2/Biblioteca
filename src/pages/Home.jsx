import React, { useEffect, useState } from "react";
import "../styles/home.css";

export default function Home() {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/libros")
      .then((res) => res.json())
      .then((data) => setLibros(data))
      .catch((err) => console.error("Error cargando libros:", err));
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
