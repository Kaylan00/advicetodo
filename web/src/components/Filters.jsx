import Icon from "./Icon";

export default function Filters({ filtros, categorias, onChange, onLimpar }) {
  const campo = (nome) => (event) => onChange(nome, event.target.value);

  return (
    <section className="filtros" aria-label="Filtros">
      <label className="filtros__busca">
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Buscar por titulo ou descricao"
          value={filtros.search}
          onChange={campo("search")}
          data-testid="busca"
        />
      </label>

      <select value={filtros.is_completed} onChange={campo("is_completed")} data-testid="filtro-status">
        <option value="">Todas</option>
        <option value="false">Em aberto</option>
        <option value="true">Concluidas</option>
      </select>

      <select value={filtros.category} onChange={campo("category")} data-testid="filtro-categoria">
        <option value="">Qualquer categoria</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.name}
          </option>
        ))}
      </select>

      <select value={filtros.priority} onChange={campo("priority")}>
        <option value="">Qualquer prioridade</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baixa</option>
      </select>

      <select value={filtros.scope} onChange={campo("scope")} data-testid="filtro-escopo">
        <option value="">Minhas e compartilhadas</option>
        <option value="owned">Somente minhas</option>
        <option value="shared">Somente compartilhadas comigo</option>
      </select>

      <select value={filtros.overdue} onChange={campo("overdue")}>
        <option value="">Qualquer prazo</option>
        <option value="true">Atrasadas</option>
        <option value="false">Dentro do prazo</option>
      </select>

      <select value={filtros.ordering} onChange={campo("ordering")}>
        <option value="-created_at">Mais recentes</option>
        <option value="created_at">Mais antigas</option>
        <option value="due_date">Prazo mais proximo</option>
        <option value="title">Titulo (A-Z)</option>
      </select>

      <button type="button" className="button button--ghost" onClick={onLimpar}>
        Limpar
      </button>
    </section>
  );
}
