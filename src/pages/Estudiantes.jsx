import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS, seedCatalogIfEmpty, addLoan, adjustStock } from '../utils/storage'
import { getSession, isLoggedIn } from '../utils/auth'

function Card({ item, onAdd }) {
  return (
    <div className="card">
      <img
        src={new URL(`../assets/${item.imagen}`, import.meta.url).href}
        alt={item.titulo}
      />
      <div className="card__body" style={{ padding: '0.75rem 1rem 1rem' }}>
        <h3 style={{ margin: '.25rem 0 .35rem' }}>{item.titulo}</h3>
        <p style={{ opacity: .85, fontSize: '.95rem', minHeight: '3.2em' }}>{item.descripcion}</p>
        <p><strong>Stock:</strong> {item.stock ?? 0}</p>
        <button className="btn btn--primary"
          onClick={() => onAdd(item)}
          disabled={(item.stock ?? 0) <= 0}>
          {(item.stock ?? 0) > 0 ? 'Solicitar' : 'Sin stock'}
        </button>
      </div>
    </div>
  )
}

export default function Estudiantes(){
  const [catalogo, setCatalogo] = useLocalStorage(STORAGE_KEYS.CATALOGO, [])
  const navigate = useNavigate()

  useEffect(() => { seedCatalogIfEmpty() }, [])

  useEffect(() => {
    if (!isLoggedIn()) navigate('/login')
  }, [navigate])

  function handleAdd(item){
    const s = getSession()
    // Guardar préstamo a nombre del alumno
    addLoan({ userId: s.id, userNombre: s.nombre, libroId: item.id, libroTitulo: item.titulo })
    // Decrementar stock
    const next = catalogo.map(x => x.id === item.id ? { ...x, stock: Math.max(0, (x.stock ?? 0) - 1) } : x)
    setCatalogo(next)
  }

  return (
    <section className="container">
      <h1>Catálogo para Estudiantes</h1>
      <div className="grid">
        {catalogo.map(item => <Card key={item.id} item={item} onAdd={handleAdd} />)}
      </div>
    </section>
  )
}
