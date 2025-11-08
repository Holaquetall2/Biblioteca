import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Estudiantes from "./pages/Estudiantes";
import Prestamos from "./pages/Prestamos";
import GestionUsuarios from "./pages/GestionUsuarios";
import Access from "./pages/Access";
import { isLoggedIn, hasRole } from "./utils/auth";

function Protected({ children, roles = [] }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (roles.length && !hasRole(roles)) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const isAccess = ["/", "/login", "/register"].includes(pathname);

  return (
    <div className={isAccess ? "access" : "app"}>
      {!isAccess && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Access />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route
            path="/prestamos"
            element={
              <Protected roles={["Admin", "Coordinador"]}>
                <Prestamos />
              </Protected>
            }
          />
          <Route
            path="/gestion-usuarios"
            element={
              <Protected roles={["Admin"]}>
                <GestionUsuarios />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected roles={["Admin"]}>
                <Admin />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
    </div>
  );
}
