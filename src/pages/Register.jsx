import { useState } from 'react'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { loginSession } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/register.css'

export default function Register(){
  const [usuarios, setUsuarios] = useLocalStorage(STORAGE_KEYS.USUARIOS, [])
  const [form, setForm] = useState({ nombre:'', email:'', password:'' }) // password es visual
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onSubmit = (e) => {
    e.preventDefault()
    const { nombre, email } = form
    if (!nombre.trim() || !email.trim()) return

    const exists = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) return alert('Ya existe un usuario con ese email')

    const nuevo = {
      id: crypto.randomUUID().slice(0,8),
      nombre: nombre.trim(),
      email: email.trim(),
      rol: 'Estudiante',
      activo: true,
      bloqueado: false
    }
    setUsuarios([...usuarios, nuevo])
    loginSession({ id:nuevo.id, nombre:nuevo.nombre, email:nuevo.email, rol:nuevo.rol })
    navigate('/home', { replace: true })
  }

  return (
    <section className="Register">
      <form className="Register__form" onSubmit={onSubmit}>
        <h2 className="register__title">Registro</h2>

        <div className="register__content">
          {/* Nombre */}
          <div className="register__box">
            <i className="ri-user-3-line register__icon" />
            <div className="register__box-input">
              <input
                required
                className="register__input"
                placeholder=" "
                value={form.nombre}
                onChange={e => onChange('nombre', e.target.value)}
              />
              <label className="register__label">Nombre</label>
            </div>
          </div>

          {/* Email */}
          <div className="register__box">
            <i className="ri-mail-line register__icon" />
            <div className="register__box-input">
              <input
                type="email"
                required
                className="register__input"
                placeholder=" "
                value={form.email}
                onChange={e => onChange('email', e.target.value)}
              />
              <label className="register__label">Email</label>
            </div>
          </div>

          {/* Password (opcional/visual) */}
          <div className="register__box">
            <i className="ri-lock-2-line register__icon" />
            <div className="register__box-input">
              <input
                type={showPwd ? 'text' : 'password'}
                className="register__input"
                placeholder=" "
                value={form.password}
                onChange={e => onChange('password', e.target.value)}
              />
              <label className="register__label">Contraseña</label>
              <i
                className={`ri-eye${showPwd ? '-off' : ''}-line register__eye`}
                onClick={() => setShowPwd(s => !s)}
                title={showPwd ? 'Ocultar' : 'Mostrar'}
              />
            </div>
          </div>
        </div>

        <button className="register__button" type="submit">Crear cuenta</button>

        <p className="register__login">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </section>
  )
}
