import { useCallback, useEffect, useState } from "react";

import { categories as categoriesApi, tasks as tasksApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import Filters from "../components/Filters";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import ShareDialog from "../components/ShareDialog";
import Sidebar from "../components/Sidebar";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import { useTasks } from "../hooks/useTasks";

export default function TasksPage() {
  const { user, logout } = useAuth();
  const {
    filtros,
    visao,
    aplicarFiltro,
    aplicarVisao,
    limparFiltros,
    pagina,
    page,
    setPage,
    carregando,
    erro,
    recarregar,
  } = useTasks();

  const [categorias, setCategorias] = useState([]);
  const [resumo, setResumo] = useState({ total: 0, concluidas: 0 });
  const [emEdicao, setEmEdicao] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [compartilhando, setCompartilhando] = useState(null);

  const carregarApoio = useCallback(async () => {
    const [listaCategorias, todas, feitas] = await Promise.all([
      categoriesApi.list(),
      tasksApi.list({ page_size: 1 }),
      tasksApi.list({ page_size: 1, is_completed: true }),
    ]);
    setCategorias(listaCategorias.results);
    setResumo({ total: todas.count, concluidas: feitas.count });
  }, []);

  useEffect(() => {
    carregarApoio();
  }, [carregarApoio]);

  async function atualizarTudo() {
    await Promise.all([recarregar(), carregarApoio()]);
  }

  async function salvarTarefa(payload) {
    if (emEdicao) {
      await tasksApi.update(emEdicao.id, payload);
    } else {
      await tasksApi.create(payload);
    }
    await atualizarTudo();
  }

  async function alternar(tarefa) {
    await tasksApi.toggle(tarefa.id);
    atualizarTudo();
  }

  async function excluir(tarefa) {
    if (!window.confirm(`Excluir "${tarefa.title}"?`)) return;
    await tasksApi.remove(tarefa.id);
    await atualizarTudo();
  }

  function abrirEdicao(tarefa) {
    setEmEdicao(tarefa);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEmEdicao(null);
  }

  const fatia = resumo.total ? Math.round((resumo.concluidas / resumo.total) * 100) : 0;
  const nome = user.first_name || user.email;

  return (
    <div className="app">
      <Sidebar
        categorias={categorias}
        visaoAtiva={visao}
        categoriaAtiva={filtros.category}
        onVisao={aplicarVisao}
        onCategoria={(id) => aplicarFiltro("category", filtros.category === id ? "" : id)}
        onCategoriasMudaram={atualizarTudo}
        onCriarTarefa={() => setFormAberto(true)}
      />

      <main className="conteudo">
        <header className="topo">
          <label className="busca">
            <Icon name="busca" size={17} />
            <input
              type="search"
              placeholder="Buscar uma tarefa..."
              value={filtros.search}
              onChange={(event) => aplicarFiltro("search", event.target.value)}
              data-testid="busca"
            />
          </label>

          <div className="topo__usuario">
            <button type="button" className="icon-button" disabled aria-label="Notificações">
              <Icon name="sino" />
            </button>
            <span className="avatar">{nome.slice(0, 2).toUpperCase()}</span>
            <span data-testid="usuario-logado">{nome}</span>
            <button
              type="button"
              className="icon-button"
              onClick={logout}
              aria-label="Sair"
              data-testid="sair"
            >
              <Icon name="sair" />
            </button>
          </div>
        </header>

        <section className="abertura">
          <div>
            <h1>
              Vamos fazer <span>acontecer?</span>
            </h1>
            <p>
              {pagina.count} {pagina.count === 1 ? "tarefa" : "tarefas"} para deixar o dia mais leve
            </p>
          </div>

          <div className="progresso">
            <div className="anel" style={{ "--fatia": `${fatia}%` }}>
              <div className="anel__miolo">
                <strong className="anel__numero">{resumo.concluidas}</strong>
                <span className="anel__texto">de {resumo.total}</span>
                <span className="anel__texto">concluídas</span>
              </div>
            </div>
          </div>
        </section>

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

        <div className="lista">
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
          onMudou={atualizarTudo}
        />
      )}
    </div>
  );
}
