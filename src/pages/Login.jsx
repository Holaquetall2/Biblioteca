import { useState } from 'react'
import useLocalStorage from '../utils/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { loginSession } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'

export default function Login() {
  const [usuarios] = useLocalStorage(STORAGE_KEYS.USUARIOS, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return alert('Usuario no existe')
    if (user.bloqueado) return alert('Usuario bloqueado')
    if (!user.activo) return alert('Usuario inactivo')
    // (Por ahora no validamos password)
    loginSession({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol })
    navigate('/home', { replace: true })
  }
  
  return (
    <div className="access">
      <section className="login-card">
        <form className="Login__form" onSubmit={onSubmit}>
          <h2 className="login__title">Login</h2>

          <div className="login__content">
            {/* EMAIL */}
            <div className="login__box">
              <i className="ri-user-line login__icon" />
              <div className="login__box-input">
                <input
                  type="email"
                  required
                  className="login__input"
                  placeholder=" "
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <label className="login__label">Email</label>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="login__box">
              <i className="ri-lock-2-line login__icon" />
              <div className="login__box-input">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="login__input"
                  placeholder=" "
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <label className="login__label">Contraseña</label>
                <i
                  className={`ri-eye${showPwd ? '-off' : ''}-line login__eye`}
                  onClick={() => setShowPwd(s => !s)}
                  title={showPwd ? 'Ocultar' : 'Mostrar'}
                />
              </div>
            </div>
          </div>

          <div className="login__actions">
            <label className="login__check">
              <input type="checkbox" /> Recuérdame
            </label>
            <a className="login__forgot" href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <button className="login__button" type="submit">Entrar</button>

          <p className="login__register">
            ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
