import Icon from "./Icon";

const PRIORIDADES = {
  low: { rotulo: "Baixa", classe: "chip--baixa", icone: "desce" },
  medium: { rotulo: "Média", classe: "chip--media", icone: "traco" },
  high: { rotulo: "Alta", classe: "chip--alta", icone: "sobe" },
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatarData(iso) {
  const [, mes, dia] = iso.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

function iniciais(usuario) {
  const base = usuario.first_name || usuario.email;
  return base.trim().slice(0, 2).toUpperCase();
}

function permissaoDoCartao(tarefa) {
  if (tarefa.my_permission !== "owner") {
    return tarefa.my_permission === "edit"
      ? { rotulo: "Pode editar", classe: "chip--edicao", icone: "lapis" }
      : { rotulo: "Somente leitura", classe: "chip--leitura", icone: "olho" };
  }
  return tarefa.shares.some((item) => item.permission === "edit")
    ? { rotulo: "Pode editar", classe: "chip--edicao", icone: "lapis" }
    : { rotulo: "Somente leitura", classe: "chip--leitura", icone: "olho" };
}

export default function TaskItem({ tarefa, onToggle, onEditar, onCompartilhar, onExcluir }) {
  const ehDono = tarefa.my_permission === "owner";
  const podeEditar = ehDono || tarefa.my_permission === "edit";
  const prioridade = PRIORIDADES[tarefa.priority];
  const permissao = permissaoDoCartao(tarefa);
  const emDestaque = !tarefa.is_completed && (tarefa.holiday || tarefa.is_overdue);
  const convidados = tarefa.shares.slice(0, 3);

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
        {tarefa.is_completed && <Icon name="check" size={13} strokeWidth={3} />}
      </button>

      <span className="tarefa__titulo" data-testid="titulo-tarefa">
        {tarefa.title}
      </span>

      <div className="tarefa__meta">
        {tarefa.category_detail && (
          <span className="chip" style={{ "--cor": tarefa.category_detail.color }}>
            <Icon name="etiqueta" size={13} />
            {tarefa.category_detail.name}
          </span>
        )}

        <span className={`chip ${prioridade.classe}`}>
          <Icon name={prioridade.icone} size={13} />
          {prioridade.rotulo}
        </span>

        {tarefa.holiday && tarefa.due_date && (
          <span className="feriado">
            <Icon name="calendario" size={13} />
            {tarefa.holiday} · {formatarData(tarefa.due_date)}
          </span>
        )}

        {tarefa.due_date && !tarefa.holiday && (
          <span className={`prazo ${tarefa.is_overdue ? "prazo--vencido" : ""}`}>
            <Icon name="calendario" size={14} />
            {formatarData(tarefa.due_date)}
          </span>
        )}

        {convidados.length > 0 && (
          <span className="avatares">
            {convidados.map((item) => (
              <span key={item.id} title={item.user.email}>
                {iniciais(item.user)}
              </span>
            ))}
            {tarefa.shares.length > 3 && <span>+{tarefa.shares.length - 3}</span>}
          </span>
        )}

        {tarefa.shares.length > 0 &&
          (ehDono ? (
            <button
              type="button"
              className={`chip ${permissao.classe}`}
              onClick={() => onCompartilhar(tarefa)}
              data-testid="compartilhar-tarefa"
            >
              <Icon name={permissao.icone} size={13} />
              {permissao.rotulo}
              <Icon name="seta_baixo" size={12} />
            </button>
          ) : (
            <span className={`chip ${permissao.classe}`}>
              <Icon name={permissao.icone} size={13} />
              {permissao.rotulo}
            </span>
          ))}

        {!ehDono && tarefa.shares.length === 0 && (
          <span className={`chip ${permissao.classe}`}>
            <Icon name={permissao.icone} size={13} />
            {permissao.rotulo}
          </span>
        )}

        <div className="acoes">
          {ehDono && tarefa.shares.length === 0 && (
            <button
              type="button"
              className="icon-button"
              onClick={() => onCompartilhar(tarefa)}
              aria-label="Compartilhar tarefa"
              data-testid="compartilhar-tarefa"
            >
              <Icon name="compartilhar" size={16} />
            </button>
          )}
          {podeEditar && (
            <button
              type="button"
              className="icon-button"
              onClick={() => onEditar(tarefa)}
              aria-label="Editar tarefa"
            >
              <Icon name="lapis" size={16} />
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
              <Icon name="lixeira" size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
