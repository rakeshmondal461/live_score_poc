import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import MatchControl from "./pages/admin/MatchControl";
import ViewerMatchList from "./pages/viewer/MatchList";
import Scoreboard from "./pages/viewer/Scoreboard";
import { socket } from "./socket/socket.ts";

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => console.log("user connected"));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/match/:id"
        element={
          <AdminRoute>
            <MatchControl />
          </AdminRoute>
        }
      />

      {/* Viewer routes */}
      <Route
        path="/viewer"
        element={
          <ProtectedRoute>
            <ViewerMatchList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewer/match/:id"
        element={
          <ProtectedRoute>
            <Scoreboard />
          </ProtectedRoute>
        }
      />

      {/* Root redirect based on role */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin" : "/viewer"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
