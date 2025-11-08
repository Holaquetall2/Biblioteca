import { useMemo } from 'react'
import { getSession, hasRole } from '../utils/auth'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS, adjustStock, seedDemoLoansIfEmpty } from '../utils/storage'

function formatFecha(v){
  if (!v) return '—'
  const d = new Date(v); if (isNaN(d)) return '—'
  return d.toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })
}
export default function Prestamos(){
  seedDemoLoansIfEmpty()
  const session = getSession()
  const [loans, setLoans] = useLocalStorage(STORAGE_KEYS.PRESTAMOS, [])

  const rows = useMemo(() => {
    if (hasRole(['Admin'])) return loans
    return loans.filter(l => l.userId === session?.id)
  }, [loans, session])

  function marcarDevuelto(l){
    if (l.devuelto) return
    // marcar como devuelto
    const next = loans.map(x => x.id === l.id ? { ...x, devuelto: true, fechaDevuelto: new Date().toISOString() } : x)
    setLoans(next)
    // devolver stock
    adjustStock(l.libroId, +1)
  }

  function eliminar(l){
    const next = loans.filter(x => x.id !== l.id)
    setLoans(next)
  }

  return (
    <section className="container">
      <h1>Préstamos</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Libro</th>
            <th>Alumno</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(l => (
            <tr key={l.id}>
              <td>{l.libroTitulo}</td>
              <td>{l.userNombre}</td>
              <td>{formatFecha(l.fecha)}</td>
              <td><span className={l.devuelto ? 'chip chip--ok' : 'chip chip--warn'}>{l.devuelto ? <span className='badge badge--ok'>Devuelto</span> : <span className='badge badge--warn'>En préstamo</span>}</span></td>
              <td className="flex">
                {!l.devuelto && hasRole(['Admin']) && (
                  <button className="btn btn--ghost" onClick={() => marcarDevuelto(l)}>Marcar devuelto</button>
                )}
                {hasRole(['Admin']) && (
                  <button className="btn btn--danger" onClick={() => eliminar(l)}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
