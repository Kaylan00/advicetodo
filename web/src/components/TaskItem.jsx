import Icon from "./Icon";

const PRIORIDADES = {
  low: { rotulo: "Baixa", classe: "prioridade--baixa", seta: "↓" },
  medium: { rotulo: "Média", classe: "prioridade--media", seta: "—" },
  high: { rotulo: "Alta", classe: "prioridade--alta", seta: "↑" },
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const CORES_AVATAR = ["#335fc0", "#db7459", "#3b8a72", "#7a5cb8"];

function formatarData(iso) {
  const [, mes, dia] = iso.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

function iniciais(usuario) {
  const base = usuario.first_name || usuario.email;
  return base.trim().slice(0, 2).toUpperCase();
}

function permissaoDaTarefa(tarefa) {
  if (tarefa.my_permission !== "owner") {
    return tarefa.my_permission === "edit"
      ? { rotulo: "Pode editar", classe: "permissao--edicao", icone: "pessoas" }
      : { rotulo: "Somente leitura", classe: "permissao--leitura", icone: "olho" };
  }
  if (tarefa.shares.length === 0) {
    return { rotulo: "Compartilhar", classe: "permissao--vazia", icone: "compartilhar" };
  }
  return tarefa.shares.some((item) => item.permission === "edit")
    ? { rotulo: "Pode editar", classe: "permissao--edicao", icone: "pessoas" }
    : { rotulo: "Somente leitura", classe: "permissao--leitura", icone: "olho" };
}

export default function TaskItem({ tarefa, onToggle, onEditar, onCompartilhar, onExcluir }) {
  const ehDono = tarefa.my_permission === "owner";
  const podeEditar = ehDono || tarefa.my_permission === "edit";
  const prioridade = PRIORIDADES[tarefa.priority];
  const permissao = permissaoDaTarefa(tarefa);
  const emDestaque = !tarefa.is_completed && (tarefa.holiday || tarefa.is_overdue);

  return (
    <article
      className={`tarefa ${tarefa.is_completed ? "tarefa--feita" : ""} ${
        emDestaque ? "tarefa--destaque" : ""
      }`}
      data-testid="tarefa"
    >
      <button
        type="button"
        className="check"
        onClick={() => onToggle(tarefa)}
        disabled={!podeEditar}
        aria-pressed={tarefa.is_completed}
        aria-label={tarefa.is_completed ? "Reabrir tarefa" : "Concluir tarefa"}
        data-testid="alternar-tarefa"
      >
        {tarefa.is_completed && <Icon name="check" size={14} strokeWidth={2.6} />}
      </button>

      <div className="tarefa__texto">
        <span className="tarefa__titulo" data-testid="titulo-tarefa">
          {tarefa.title}
        </span>
        {tarefa.description && <span className="tarefa__descricao">{tarefa.description}</span>}
      </div>

      {tarefa.category_detail ? (
        <span className="etiqueta" style={{ "--cor": tarefa.category_detail.color }}>
          {tarefa.category_detail.name}
        </span>
      ) : (
        <span />
      )}

      <span className={`prioridade ${prioridade.classe}`}>
        {prioridade.seta} {prioridade.rotulo}
      </span>

      {tarefa.holiday && tarefa.due_date ? (
        <span className="feriado">
          <Icon name="calendario" size={15} />
          <span>
            <b>{tarefa.holiday}</b>
            <small>{formatarData(tarefa.due_date)}</small>
          </span>
        </span>
      ) : tarefa.due_date ? (
        <span className={`prazo ${tarefa.is_overdue ? "prazo--vencido" : ""}`}>
          <Icon name="calendario" size={15} />
          {formatarData(tarefa.due_date)}
        </span>
      ) : (
        <span />
      )}

      <span className="avatares">
        {tarefa.shares.slice(0, 3).map((item, indice) => (
          <span
            key={item.id}
            title={item.user.email}
            style={{ background: CORES_AVATAR[indice % CORES_AVATAR.length] }}
          >
            {iniciais(item.user)}
          </span>
        ))}
        {tarefa.shares.length > 3 && (
          <span style={{ background: "#8a8f9c" }}>+{tarefa.shares.length - 3}</span>
        )}
      </span>

      {ehDono ? (
        <button
          type="button"
          className={`permissao ${permissao.classe}`}
          onClick={() => onCompartilhar(tarefa)}
          data-testid="compartilhar-tarefa"
        >
          <Icon name={permissao.icone} size={14} />
          {permissao.rotulo}
        </button>
      ) : (
        <span className={`permissao ${permissao.classe}`}>
          <Icon name={permissao.icone} size={14} />
          {permissao.rotulo}
        </span>
      )}

      <span className="acoes">
        {podeEditar && (
          <button
            type="button"
            className="icon-button"
            onClick={() => onEditar(tarefa)}
            aria-label="Editar tarefa"
          >
            <Icon name="lapis" size={17} />
          </button>
        )}
        {ehDono && (
          <button
            type="button"
            className="icon-button icon-button--perigo"
            onClick={() => onExcluir(tarefa)}
            aria-label="Excluir tarefa"
            data-testid="excluir-tarefa"
          >
            <Icon name="lixeira" size={17} />
          </button>
        )}
      </span>
    </article>
  );
}
