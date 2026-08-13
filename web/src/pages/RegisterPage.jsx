import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", email: "", password: "" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/tarefas" replace />;

  async function criarConta(event) {
    event.preventDefault();
    setEnviando(true);
    try {
      await register(form);
      navigate("/tarefas", { replace: true });
    } catch (problema) {
      setErro(problema.firstMessage ?? "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  const atualizar = (campo) => (event) => setForm({ ...form, [campo]: event.target.value });

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={<>Já tem conta? <Link to="/entrar">Entrar</Link></>}
    >
      <form className="form" onSubmit={criarConta} data-testid="form-cadastro">
        <label className="field">
          <span>Nome</span>
          <input type="text" name="first_name" value={form.first_name} onChange={atualizar("first_name")} />
        </label>
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={atualizar("email")}
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
            onChange={atualizar("password")}
            required
            autoComplete="new-password"
          />
          <small>Use pelo menos 8 caracteres, sem sequências óbvias.</small>
        </label>
        {erro && (
          <p className="alert" role="alert" data-testid="erro-cadastro">
            {erro}
          </p>
        )}
        <button type="submit" className="button" disabled={enviando}>
          {enviando ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </AuthLayout>
  );
}
