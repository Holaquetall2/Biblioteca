import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { getSession, isLoggedIn, hasRole, logoutSession, roleLabel } from "../utils/auth";

const LOGO = new URL("../assets/Imagenes/Logo.png", import.meta.url).href;

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getSession();

  const TITLES = {
    "/": "Acceso a la Plataforma",
    "/home": "Inicio",
    "/login": "Login",
    "/register": "Registro",
    "/estudiantes": "Catálogo para Estudiantes",
    "/prestamos": "Préstamos",
    "/gestion-usuarios": "Gestión de Usuarios",
    "/admin": "Gestión de Catálogo",
  };

  function handleLogout() {
    logoutSession();
    navigate("/", { replace: true });
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar__inner">
          <Link to="/home" className="brand">
            <img className="brand__logo" src={LOGO} alt="Biblioteca" />
            <span className="brand__text">
              Biblioteca
              <small>Nacional</small>
            </span>
          </Link>

          <h1 className="topbar__title">{TITLES[pathname] ?? "Biblioteca"}</h1>

          <div className="topbar__right">
            {isLoggedIn() && (
              <span className="user">
                {session?.nombre ?? "Usuario"} ({roleLabel(session)})
              </span>
            )}
            {isLoggedIn() ? (
              <button className="pill" onClick={handleLogout}>Salir</button>
            ) : (
              <NavLink to="/login" className="pill">Entrar</NavLink>
            )}
          </div>
        </div>
      </div>

      <nav className="subnav">
        <div className="subnav__inner">
          {/* sin “Inicio” */}
          <NavLink to="/estudiantes" className="subnav__link">Catálogo</NavLink>

          {hasRole(["Admin", "Coordinador"]) && (
            <NavLink to="/prestamos" className="subnav__link">Préstamos</NavLink>
          )}

          {hasRole(["Admin"]) && (
            <>
              <NavLink to="/gestion-usuarios" className="subnav__link">Usuarios</NavLink>
              <NavLink to="/admin" className="subnav__link">Gestión catálogo</NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
