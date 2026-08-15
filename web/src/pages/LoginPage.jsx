import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Icon from "../components/Icon";

// Usuario criado pelo comando seed_demo, com tarefas, categorias e compartilhamento prontos.
const DEMO = { email: "ana@advice.dev", senha: "advice2026" };

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/tarefas" replace />;

  async function entrar(event) {
    event.preventDefault();
    setEnviando(true);
    try {
      await login(form.email, form.password, lembrar);
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

  async function entrarComDemo() {
    setEnviando(true);
    try {
      await login(DEMO.email, DEMO.senha, false);
      navigate("/tarefas", { replace: true });
    } catch {
      setErro("A conta de demonstração não está disponível neste ambiente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      chamada={
        <>
          Organize o dia.<span>Respire melhor.</span>
        </>
      }
      apoio="Tudo o que importa, no lugar certo."
      title="Bem-vindo de volta"
      subtitle="Entre para continuar organizando suas tarefas."
      footer={
        <>
          Ainda não tem uma conta? <Link to="/criar-conta">Criar conta</Link>
        </>
      }
    >
      <form className="form" onSubmit={entrar} data-testid="form-login">
        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              autoComplete="current-password"
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
        </label>

        <label className="lembrar">
          <input
            type="checkbox"
            checked={lembrar}
            onChange={(event) => setLembrar(event.target.checked)}
          />
          Lembrar de mim
        </label>

        {erro && (
          <p className="alert" role="alert" data-testid="erro-login">
            {erro}
          </p>
        )}

        <button type="submit" className="button button--bloco" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="separador">ou</p>

        <button
          type="button"
          className="button button--ghost button--bloco"
          onClick={entrarComDemo}
          disabled={enviando}
          data-testid="entrar-demo"
        >
          <Icon name="sol" size={18} />
          Entrar na demonstração
        </button>
        <small className="acesso__dica">
          Abre a conta {DEMO.email}, com dados de exemplo.
        </small>
      </form>
    </AuthLayout>
  );
}
