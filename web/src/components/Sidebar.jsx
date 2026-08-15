import { useState } from "react";

import { categories as categoriesApi } from "../api/endpoints";
import Icon from "./Icon";

const VISOES = [
  { id: "hoje", rotulo: "Hoje", icone: "sol" },
  { id: "semana", rotulo: "Esta semana", icone: "calendario" },
  { id: "todas", rotulo: "Todas", icone: "lista" },
  { id: "compartilhadas", rotulo: "Compartilhadas", icone: "pessoas" },
  { id: "concluidas", rotulo: "Concluídas", icone: "concluido" },
];

const CORES = ["#2563EB", "#15803D", "#6D28D9", "#B45309", "#BE123C", "#0F766E"];

export default function Sidebar({
  categorias,
  visaoAtiva,
  categoriaAtiva,
  onVisao,
  onCategoria,
  onCategoriasMudaram,
  onCriarTarefa,
}) {
  const [abrindoForm, setAbrindoForm] = useState(false);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const [erro, setErro] = useState(null);

  async function criarCategoria(event) {
    event.preventDefault();
    try {
      await categoriesApi.create({ name: nome, color: cor });
      setNome("");
      setErro(null);
      setAbrindoForm(false);
      onCategoriasMudaram();
    } catch (problema) {
      setErro(problema.firstMessage ?? "Não foi possível criar a categoria.");
    }
  }

  async function excluirCategoria(categoria, event) {
    event.stopPropagation();
    if (!window.confirm(`Excluir a categoria "${categoria.name}"?`)) return;
    await categoriesApi.remove(categoria.id);
    onCategoriasMudaram();
  }

  return (
    <aside className="lateral">
      <p className="marca">
        <Icon name="concluido" size={28} strokeWidth={2.2} />
        AdviceTodo
      </p>

      <nav className="visoes" aria-label="Visões">
        {VISOES.map((visao) => (
          <button
            key={visao.id}
            type="button"
            className={`visao ${visaoAtiva === visao.id ? "visao--ativa" : ""}`}
            onClick={() => onVisao(visao.id)}
            data-testid={`visao-${visao.id}`}
          >
            <Icon name={visao.icone} />
            {visao.rotulo}
          </button>
        ))}
      </nav>

      <div className="divisor" />

      <div className="categorias">
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            type="button"
            style={{ "--cor": categoria.color }}
            className={`categoria ${
              categoriaAtiva === String(categoria.id) ? "categoria--ativa" : ""
            }`}
            onClick={() => onCategoria(String(categoria.id))}
          >
            <Icon name="etiqueta" size={16} />
            {categoria.name}
            <em className="categoria__contagem">{categoria.tasks_count}</em>
            <span
              className="categoria__excluir"
              role="button"
              tabIndex={0}
              aria-label={`Excluir categoria ${categoria.name}`}
              onClick={(event) => excluirCategoria(categoria, event)}
              onKeyDown={(event) => event.key === "Enter" && excluirCategoria(categoria, event)}
            >
              <Icon name="lixeira" size={14} />
            </span>
          </button>
        ))}

        {abrindoForm ? (
          <form className="categoria-nova" onSubmit={criarCategoria}>
            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Nome da categoria"
              maxLength={60}
              required
              autoFocus
              data-testid="campo-categoria-nova"
            />
            <div className="categoria-nova__cores">
              {CORES.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  className={`ponto ${cor === opcao ? "ponto--ativo" : ""}`}
                  style={{ background: opcao }}
                  onClick={() => setCor(opcao)}
                  aria-label={`Usar a cor ${opcao}`}
                />
              ))}
            </div>
            {erro && <p className="alert">{erro}</p>}
            <button type="submit" className="button button--ghost" data-testid="salvar-categoria">
              Adicionar
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="categoria"
            style={{ "--cor": "#94a3b8" }}
            onClick={() => setAbrindoForm(true)}
            data-testid="nova-categoria"
          >
            <Icon name="mais" size={16} />
            Nova categoria
          </button>
        )}
      </div>

      <button type="button" className="button" onClick={onCriarTarefa} data-testid="nova-tarefa">
        <Icon name="mais" size={18} />
        Criar tarefa
      </button>
    </aside>
  );
}
