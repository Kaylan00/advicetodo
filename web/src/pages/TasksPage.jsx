import { useCallback, useEffect, useState } from "react";

import { categories as categoriesApi, tasks as tasksApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import CategoryPanel from "../components/CategoryPanel";
import Filters from "../components/Filters";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import ShareDialog from "../components/ShareDialog";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import { useTasks } from "../hooks/useTasks";

export default function TasksPage() {
  const { user, logout } = useAuth();
  const { filtros, aplicarFiltro, limparFiltros, pagina, page, setPage, carregando, erro, recarregar } =
    useTasks();
  const [categorias, setCategorias] = useState([]);
  const [emEdicao, setEmEdicao] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [compartilhando, setCompartilhando] = useState(null);

  const carregarCategorias = useCallback(async () => {
    const dados = await categoriesApi.list();
    setCategorias(dados.results);
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  async function salvarTarefa(payload) {
    if (emEdicao) {
      await tasksApi.update(emEdicao.id, payload);
    } else {
      await tasksApi.create(payload);
    }
    await Promise.all([recarregar(), carregarCategorias()]);
  }

  async function alternar(tarefa) {
    await tasksApi.toggle(tarefa.id);
    recarregar();
  }

  async function excluir(tarefa) {
    if (!window.confirm(`Excluir "${tarefa.title}"?`)) return;
    await tasksApi.remove(tarefa.id);
    await Promise.all([recarregar(), carregarCategorias()]);
  }

  function abrirEdicao(tarefa) {
    setEmEdicao(tarefa);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEmEdicao(null);
  }

  return (
    <div className="app">
      <header className="topo">
        <p className="topo__marca">AdviceTodo</p>
        <div className="topo__usuario">
          <span data-testid="usuario-logado">{user.first_name || user.email}</span>
          <button type="button" className="icon-button" onClick={logout} aria-label="Sair" data-testid="sair">
            <Icon name="logout" />
          </button>
        </div>
      </header>

      <div className="conteudo">
        <CategoryPanel
          categorias={categorias}
          categoriaAtiva={filtros.category}
          onMudou={() => Promise.all([carregarCategorias(), recarregar()])}
          onFiltrar={(id) => aplicarFiltro("category", filtros.category === id ? "" : id)}
        />

        <main className="lista">
          <div className="lista__topo">
            <h1>Tarefas</h1>
            <button
              type="button"
              className="button"
              onClick={() => setFormAberto(true)}
              data-testid="nova-tarefa"
            >
              <Icon name="plus" size={16} />
              Nova tarefa
            </button>
          </div>

          <Filters
            filtros={filtros}
            categorias={categorias}
            onChange={aplicarFiltro}
            onLimpar={limparFiltros}
          />

          {erro && (
            <p className="alert" role="alert">
              {erro}
            </p>
          )}

          {carregando && <p className="lista__estado">Carregando...</p>}

          {!carregando && pagina.results.length === 0 && (
            <p className="lista__estado" data-testid="lista-vazia">
              Nenhuma tarefa por aqui. Que tal criar a primeira?
            </p>
          )}

          <div className="lista__itens">
            {pagina.results.map((tarefa) => (
              <TaskItem
                key={tarefa.id}
                tarefa={tarefa}
                onToggle={alternar}
                onEditar={abrirEdicao}
                onCompartilhar={setCompartilhando}
                onExcluir={excluir}
              />
            ))}
          </div>

          <Pagination
            page={pagina.page ?? page}
            pages={pagina.pages ?? 1}
            count={pagina.count ?? 0}
            onChange={setPage}
          />
        </main>
      </div>

      {formAberto && (
        <TaskForm
          tarefa={emEdicao}
          categorias={categorias}
          onClose={fecharForm}
          onSubmit={salvarTarefa}
        />
      )}

      {compartilhando && (
        <ShareDialog
          tarefa={compartilhando}
          onClose={() => setCompartilhando(null)}
          onMudou={recarregar}
        />
      )}
    </div>
  );
}
