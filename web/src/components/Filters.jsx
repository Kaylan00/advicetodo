import Icon from "./Icon";
import Select from "./Select";

const SITUACAO = [
  { valor: "", rotulo: "Situação" },
  { valor: "false", rotulo: "Em aberto" },
  { valor: "true", rotulo: "Concluídas" },
];

const PRIORIDADE = [
  { valor: "", rotulo: "Prioridade" },
  { valor: "high", rotulo: "Alta", cor: "#e0361e" },
  { valor: "medium", rotulo: "Média", cor: "#c07c05" },
  { valor: "low", rotulo: "Baixa", cor: "#12784f" },
];

const PRAZO = [
  { valor: "", rotulo: "Prazo" },
  { valor: "true", rotulo: "Atrasadas" },
  { valor: "false", rotulo: "Dentro do prazo" },
];

const ORDEM = [
  { valor: "-created_at", rotulo: "Mais recentes" },
  { valor: "created_at", rotulo: "Mais antigas" },
  { valor: "due_date", rotulo: "Prazo mais próximo" },
  { valor: "title", rotulo: "Título (A-Z)" },
];

export default function Filters({ filtros, categorias, onChange, onLimpar }) {
  const opcoesDeCategoria = [
    { valor: "", rotulo: "Categoria" },
    ...categorias.map((categoria) => ({
      valor: String(categoria.id),
      rotulo: categoria.name,
      cor: categoria.color,
    })),
  ];

  return (
    <section className="filtros" aria-label="Filtros">
      <Select
        variante="chip"
        cor="#1744b9"
        valor={filtros.is_completed}
        opcoes={SITUACAO}
        onChange={(valor) => onChange("is_completed", valor)}
        testId="filtro-status"
      />

      <Select
        variante="chip"
        cor="#166b49"
        valor={filtros.category}
        opcoes={opcoesDeCategoria}
        onChange={(valor) => onChange("category", valor)}
        testId="filtro-categoria"
      />

      <Select
        variante="chip"
        cor="#5d3bbc"
        valor={filtros.priority}
        opcoes={PRIORIDADE}
        onChange={(valor) => onChange("priority", valor)}
        testId="filtro-prioridade"
      />

      <Select
        variante="chip"
        cor="#805713"
        valor={filtros.overdue}
        opcoes={PRAZO}
        onChange={(valor) => onChange("overdue", valor)}
        testId="filtro-prazo"
      />

      <Select
        variante="chip"
        cor="#4b5563"
        valor={filtros.ordering}
        opcoes={ORDEM}
        onChange={(valor) => onChange("ordering", valor)}
        testId="filtro-ordem"
      />

      <button type="button" className="button button--ghost" onClick={onLimpar}>
        Limpar
        <Icon name="fechar" size={15} />
      </button>
    </section>
  );
}
