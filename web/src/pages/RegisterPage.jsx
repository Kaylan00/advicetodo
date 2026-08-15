import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Icon from "../components/Icon";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", email: "", password: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      chamada={
        <>
          Comece hoje.<span>Sem bagunça.</span>
        </>
      }
      apoio="Suas tarefas, suas categorias, seu time."
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <>
          Já tem uma conta? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <form className="form" onSubmit={criarConta} data-testid="form-cadastro">
        <label className="field">
          <span>Nome</span>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={atualizar("first_name")}
            placeholder="Como quer ser chamado"
          />
        </label>

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={atualizar("email")}
            placeholder="voce@email.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <span className="campo-senha">
            <input
              type={mostrarSenha ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={atualizar("password")}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
            >
              <Icon name={mostrarSenha ? "olho-fechado" : "olho"} size={18} />
            </button>
          </span>
          <small>Use pelo menos 8 caracteres, sem sequências óbvias.</small>
        </label>

        {erro && (
          <p className="alert" role="alert" data-testid="erro-cadastro">
            {erro}
          </p>
        )}

        <button type="submit" className="button button--bloco" disabled={enviando}>
          {enviando ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </AuthLayout>
  );
}
