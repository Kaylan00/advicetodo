import { useState } from "react";

import { categories as categoriesApi } from "../api/endpoints";
import Icon from "./Icon";

const CORES = ["#0F766E", "#2563EB", "#B45309", "#BE123C", "#6D28D9", "#15803D"];

export default function CategoryPanel({ categorias, onMudou, onFiltrar, categoriaAtiva }) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const [erro, setErro] = useState(null);

  async function criar(event) {
    event.preventDefault();
    try {
      await categoriesApi.create({ name: nome, color: cor });
      setNome("");
      setErro(null);
      onMudou();
    } catch (problema) {
      setErro(problema.firstMessage ?? "Não foi possível criar a categoria.");
    }
  }

  async function excluir(categoria) {
    if (!window.confirm(`Excluir a categoria "${categoria.name}"?`)) return;
    await categoriesApi.remove(categoria.id);
    onMudou();
  }

  return (
    <aside className="painel" aria-label="Categorias">
      <h2>Categorias</h2>

      <ul className="painel__lista">
        {categorias.map((categoria) => (
          <li key={categoria.id} className={categoriaAtiva === String(categoria.id) ? "ativa" : ""}>
            <button type="button" onClick={() => onFiltrar(String(categoria.id))}>
              <span className="ponto" style={{ background: categoria.color }} />
              {categoria.name}
              <em>{categoria.tasks_count}</em>
            </button>
            <button
              type="button"
              className="icon-button icon-button--perigo"
              onClick={() => excluir(categoria)}
              aria-label={`Excluir categoria ${categoria.name}`}
            >
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
        {categorias.length === 0 && <li className="painel__vazio">Nenhuma categoria ainda.</li>}
      </ul>

      <form className="painel__form" onSubmit={criar}>
        <input
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Nova categoria"
          maxLength={60}
          required
          data-testid="campo-categoria-nova"
        />
        <div className="painel__cores">
          {CORES.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`ponto ponto--botao ${cor === opcao ? "ponto--ativo" : ""}`}
              style={{ background: opcao }}
              onClick={() => setCor(opcao)}
              aria-label={`Usar a cor ${opcao}`}
            />
          ))}
        </div>
        {erro && <p className="alert">{erro}</p>}
        <button type="submit" className="button button--ghost" data-testid="salvar-categoria">
          <Icon name="plus" size={16} />
          Adicionar
        </button>
      </form>
    </aside>
  );
}
