import { Navigate, Route, Routes } from "react-router-dom";

import RequireAuth from "./auth/RequireAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/criar-conta" element={<RegisterPage />} />
      <Route
        path="/tarefas"
        element={
          <RequireAuth>
            <TasksPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/tarefas" replace />} />
    </Routes>
  );
}
