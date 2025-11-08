import { useNavigate } from 'react-router-dom'
import './access.css'

export default function Access() {
  const navigate = useNavigate()
  return (
    <div className="access">
      <main className="access__center">
        <div className="glass">
          <h2>Selecciona tu rol</h2>
          <p className="glass__subtitle">Para acceder a la plataforma</p>
          <div className="glass__actions">
            <button className="btn role" onClick={() => navigate('/login')}>
              Administración<br /><small>@nac.cl</small>
            </button>
            <button className="btn role" onClick={() => navigate('/login')}>
              Estudiantes o Profesores<br /><small>@nacional.cl</small>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
