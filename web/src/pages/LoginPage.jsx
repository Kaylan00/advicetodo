import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/tarefas" replace />;

  async function entrar(event) {
    event.preventDefault();
    setEnviando(true);
    try {
      await login(form.email, form.password);
      navigate("/tarefas", { replace: true });
    } catch (problema) {
      setErro(
        problema.status === 401
          ? "E-mail ou senha inválidos."
          : (problema.firstMessage ?? "Não foi possível entrar."),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Organize suas tarefas e divida o que for de time."
      footer={<>Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link></>}
    >
      <form className="form" onSubmit={entrar} data-testid="form-login">
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            autoComplete="current-password"
          />
        </label>
        {erro && (
          <p className="alert" role="alert" data-testid="erro-login">
            {erro}
          </p>
        )}
        <button type="submit" className="button" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
