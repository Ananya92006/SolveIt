import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import Admin from "./pages/Admin";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import AdminUpdate from "./components/AdminUpdate";
import AdminUpload from "./components/AdminUpload";
import AdminVideo from "./components/AdminVideo";
import ProblemPage from "./pages/ProblemPage";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
        <span className="text-3xl font-bold font-mono gradient-text">⟨/⟩</span>
        <span className="loading loading-dots loading-md text-primary"></span>
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
      <Route path="/problem/:problemId" element={<ProblemPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAdmin ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAdmin ? <AdminUpdate /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAdmin ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAdmin ? <AdminVideo /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;