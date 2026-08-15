import Icon from "./Icon";

function Chip({ variante, valor, onChange, children, testId }) {
  return (
    <span className={`filtro filtro--${variante}`}>
      <select value={valor} onChange={onChange} data-testid={testId}>
        {children}
      </select>
      <Icon name="seta_baixo" size={15} />
    </span>
  );
}

export default function Filters({ filtros, categorias, onChange, onLimpar }) {
  const campo = (nome) => (event) => onChange(nome, event.target.value);

  return (
    <section className="filtros" aria-label="Filtros">
      <Chip
        variante="situacao"
        valor={filtros.is_completed}
        onChange={campo("is_completed")}
        testId="filtro-status"
      >
        <option value="">Situação</option>
        <option value="false">Em aberto</option>
        <option value="true">Concluídas</option>
      </Chip>

      <Chip
        variante="categoria"
        valor={filtros.category}
        onChange={campo("category")}
        testId="filtro-categoria"
      >
        <option value="">Categoria</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.name}
          </option>
        ))}
      </Chip>

      <Chip variante="prioridade" valor={filtros.priority} onChange={campo("priority")}>
        <option value="">Prioridade</option>
        <option value="high">Alta</option>
        <option value="medium">Média</option>
        <option value="low">Baixa</option>
      </Chip>

      <Chip variante="prazo" valor={filtros.overdue} onChange={campo("overdue")}>
        <option value="">Prazo</option>
        <option value="true">Atrasadas</option>
        <option value="false">Dentro do prazo</option>
      </Chip>

      <Chip variante="ordem" valor={filtros.ordering} onChange={campo("ordering")}>
        <option value="-created_at">Mais recentes</option>
        <option value="created_at">Mais antigas</option>
        <option value="due_date">Prazo mais próximo</option>
        <option value="title">Título (A-Z)</option>
      </Chip>

      <button type="button" className="button button--ghost" onClick={onLimpar}>
        Limpar
        <Icon name="fechar" size={15} />
      </button>
    </section>
  );
}
