import { useMemo, useState } from 'react'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { getSession, hasRole } from '../utils/auth'

export default function GestionUsuarios(){
  const [list, setList] = useLocalStorage(STORAGE_KEYS.USUARIOS, [])
  const [form, setForm] = useState({ id:null, nombre:'', email:'', clave:'', rol:'Alumno' })

  function editar(u){ setForm(u) }
  function limpiar(){ setForm({ id:null, nombre:'', email:'', clave:'', rol:'Alumno' }) }
  function guardar(e){
    e.preventDefault()
    if (!form.nombre || !form.email) return
    if (form.id){
      setList(list.map(x => x.id === form.id ? { ...x, ...form } : x))
    } else {
      const nuevo = { ...form, id: 'usr-' + Math.random().toString(36).slice(2,9) }
      setList([nuevo, ...list])
    }
    limpiar()
  }
  function eliminar(id){ setList(list.filter(x => x.id !== id)) }

  return (
    <section className="container">
      <h1>Gestión de Usuarios</h1>
      <form onSubmit={guardar} className="flex" style={{gap:'0.75rem', flexWrap:'wrap', margin:'0 0 1rem'}}>
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="input" placeholder="Clave" type="password" value={form.clave} onChange={e=>setForm({...form, clave:e.target.value})} />
        <select className="select" value={form.rol} onChange={e=>setForm({...form, rol:e.target.value})}>
          <option>Alumno</option>
          <option>Admin</option>
        </select>
        <button className="btn btn--primary" type="submit">{form.id ? 'Actualizar' : 'Crear'}</button>
        {form.id && <button type="button" className="btn btn--ghost" onClick={limpiar}>Cancelar</button>}
      </form>

      <table className="table">
        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          {list.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td className="flex">
                <button className="btn btn--ghost" onClick={() => editar(u)}>Editar</button>
                <button className="btn btn--danger" onClick={() => eliminar(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
