import { useEffect, useState } from 'react'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS, seedCatalogIfEmpty } from '../utils/storage'

export default function Admin(){
  const [list, setList] = useLocalStorage(STORAGE_KEYS.CATALOGO, [])
  const [form, setForm] = useState({ id:null, titulo:'', descripcion:'', stock:0, imagen:'Imagenes/logo_fondo.png' })

  useEffect(() => { seedCatalogIfEmpty() }, [])

  function editar(item){ setForm(item) }
  function limpiar(){ setForm({ id:null, titulo:'', descripcion:'', stock:0, imagen:'Imagenes/logo_fondo.png' }) }
  function guardar(e){
    e.preventDefault()
    if (!form.titulo) return
    if (form.id){
      setList(list.map(x => x.id === form.id ? { ...x, ...form, stock: Number(form.stock)||0 } : x))
    } else {
      const nuevo = { ...form, id: 'bk-' + Math.random().toString(36).slice(2,9), stock: Number(form.stock)||0 }
      setList([nuevo, ...list])
    }
    limpiar()
  }
  function eliminar(id){ setList(list.filter(x => x.id !== id)) }

  return (
    <section className="container">
      <h1>Gestión de Catálogo</h1>
      <form onSubmit={guardar} className="flex" style={{gap:'0.75rem', flexWrap:'wrap', margin:'0 0 1rem'}}>
        <input className="input" placeholder="Título" value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} />
        <input className="input" placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} />
        <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} />
        <input className="input" placeholder="Ruta imagen (en /src/assets)" value={form.imagen} onChange={e=>setForm({...form, imagen:e.target.value})} />
        <button className="btn btn--primary" type="submit">{form.id ? 'Actualizar' : 'Agregar'}</button>
        {form.id && <button type="button" className="btn btn--ghost" onClick={limpiar}>Cancelar</button>}
      </form>

      <div className="grid">
        {list.map(item => (
          <div className="card" key={item.id}>
            <img src={new URL(`../assets/${item.imagen}`, import.meta.url).href} alt={item.titulo} />
            <div style={{padding:'0.75rem 1rem 1rem'}}>
              <h3 style={{margin:'.25rem 0 .35rem'}}>{item.titulo}</h3>
              <p style={{opacity:.85}}>{item.descripcion}</p>
              <p><strong>Stock:</strong> {item.stock ?? 0}</p>
              <div className="flex">
                <button className="btn btn--ghost" onClick={() => editar(item)}>Editar</button>
                <button className="btn btn--danger" onClick={() => eliminar(item.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
