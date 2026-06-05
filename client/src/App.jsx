import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Accueil from "./pages/Accueil";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trajets from "./pages/Trajets";
import TrajetDetail from "./pages/TrajetDetail";
import MesReservations from "./pages/MesReservations";
import DashboardCoop from "./pages/DashboardCoop";
import Admin from "./pages/Admin";
import Profil from "./pages/Profil";

const LayoutPrive = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

const RedirectAccueil = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "cooperative") return <Navigate to="/dashboard-coop" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/trajets" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Page publique */}
          <Route path="/" element={<Accueil />} />

          {/* Auth */}
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />

          {/* Routes protégées voyageur */}
          <Route path="/trajets" element={
            <LayoutPrive>
              <ProtectedRoute roles={["voyageur"]}>
                <Trajets />
              </ProtectedRoute>
            </LayoutPrive>
          } />
          <Route path="/trajets/:id" element={
            <LayoutPrive>
              <ProtectedRoute roles={["voyageur"]}>
                <TrajetDetail />
              </ProtectedRoute>
            </LayoutPrive>
          } />
          <Route path="/mes-reservations" element={
            <LayoutPrive>
              <ProtectedRoute roles={["voyageur"]}>
                <MesReservations />
              </ProtectedRoute>
            </LayoutPrive>
          } />

          {/* Routes protégées coopérative */}
          <Route path="/dashboard-coop" element={
            <LayoutPrive>
              <ProtectedRoute roles={["cooperative"]}>
                <DashboardCoop />
              </ProtectedRoute>
            </LayoutPrive>
          } />

          {/* Routes protégées admin */}
          <Route path="/admin" element={
            <LayoutPrive>
              <ProtectedRoute roles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            </LayoutPrive>
          } />

          {/* Profil */}
          <Route path="/profil" element={
            <LayoutPrive>
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            </LayoutPrive>
          } />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
