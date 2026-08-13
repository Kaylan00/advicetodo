import Icon from "./Icon";

const PRIORIDADES = { low: "Baixa", medium: "Média", high: "Alta" };

function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function TaskItem({ tarefa, onToggle, onEditar, onCompartilhar, onExcluir }) {
  const podeEditar = tarefa.my_permission === "owner" || tarefa.my_permission === "edit";
  const ehDono = tarefa.my_permission === "owner";

  return (
    <article className={`task ${tarefa.is_completed ? "task--feita" : ""}`} data-testid="tarefa">
      <button
        type="button"
        className="task__check"
        onClick={() => onToggle(tarefa)}
        disabled={!podeEditar}
        aria-pressed={tarefa.is_completed}
        aria-label={tarefa.is_completed ? "Reabrir tarefa" : "Concluir tarefa"}
        data-testid="alternar-tarefa"
      >
        {tarefa.is_completed && <Icon name="check" size={14} />}
      </button>

      <div className="task__body">
        <h3 data-testid="titulo-tarefa">{tarefa.title}</h3>
        {tarefa.description && <p className="task__descricao">{tarefa.description}</p>}

        <div className="task__meta">
          {tarefa.category_detail && (
            <span className="chip" style={{ "--chip": tarefa.category_detail.color }}>
              {tarefa.category_detail.name}
            </span>
          )}
          <span className={`badge badge--${tarefa.priority}`}>{PRIORIDADES[tarefa.priority]}</span>
          {tarefa.due_date && (
            <span className={`task__prazo ${tarefa.is_overdue ? "task__prazo--vencido" : ""}`}>
              <Icon name="calendar" size={14} />
              {formatarData(tarefa.due_date)}
              {tarefa.is_overdue && " (atrasada)"}
            </span>
          )}
          {tarefa.holiday && <span className="task__feriado">{tarefa.holiday}</span>}
          {!ehDono && <span className="chip chip--neutro">de {tarefa.owner.email}</span>}
          {ehDono && tarefa.shares.length > 0 && (
            <span className="chip chip--neutro">
              compartilhada com {tarefa.shares.length}
              {tarefa.shares.length === 1 ? " pessoa" : " pessoas"}
            </span>
          )}
        </div>
      </div>

      <div className="task__acoes">
        {podeEditar && (
          <button
            type="button"
            className="icon-button"
            onClick={() => onEditar(tarefa)}
            aria-label="Editar tarefa"
          >
            <Icon name="pencil" />
          </button>
        )}
        {ehDono && (
          <button
            type="button"
            className="icon-button"
            onClick={() => onCompartilhar(tarefa)}
            aria-label="Compartilhar tarefa"
            data-testid="compartilhar-tarefa"
          >
            <Icon name="share" />
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
            <Icon name="trash" />
          </button>
        )}
      </div>
    </article>
  );
}
