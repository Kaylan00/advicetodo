import { useState } from "react";

import Dialog from "./Dialog";
import Select from "./Select";

const PRIORIDADES = [
  { valor: "high", rotulo: "Alta", cor: "#e0361e" },
  { valor: "medium", rotulo: "Média", cor: "#c07c05" },
  { valor: "low", rotulo: "Baixa", cor: "#12784f" },
];

const VAZIO = {
  title: "",
  description: "",
  category: "",
  priority: "medium",
  due_date: "",
};

export default function TaskForm({ tarefa, categorias, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...VAZIO,
    ...(tarefa && {
      title: tarefa.title,
      description: tarefa.description ?? "",
      category: tarefa.category ?? "",
      priority: tarefa.priority,
      due_date: tarefa.due_date ?? "",
    }),
  }));
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const atualizar = (campo) => (event) => setForm({ ...form, [campo]: event.target.value });

  async function salvar(event) {
    event.preventDefault();
    setEnviando(true);
    try {
      await onSubmit({
        ...form,
        category: form.category === "" ? null : Number(form.category),
        due_date: form.due_date === "" ? null : form.due_date,
      });
      onClose();
    } catch (problema) {
      setErro(problema.firstMessage ?? "Não foi possível salvar a tarefa.");
      setEnviando(false);
    }
  }

  return (
    <Dialog
      title={tarefa ? "Editar tarefa" : "Nova tarefa"}
      onClose={onClose}
      testId="dialogo-tarefa"
    >
      <form className="form" onSubmit={salvar}>
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            value={form.title}
            onChange={atualizar("title")}
            required
            maxLength={120}
            autoFocus
            data-testid="campo-titulo"
          />
        </label>
        <label className="field">
          <span>Descrição</span>
          <textarea rows={3} value={form.description} onChange={atualizar("description")} />
        </label>
        <div className="form__row">
          <div className="field">
            <span>Categoria</span>
            <Select
              valor={form.category}
              opcoes={[
                { valor: "", rotulo: "Sem categoria" },
                ...categorias.map((categoria) => ({
                  valor: String(categoria.id),
                  rotulo: categoria.name,
                  cor: categoria.color,
                })),
              ]}
              onChange={(valor) => setForm({ ...form, category: valor })}
              testId="campo-categoria"
            />
          </div>
          <div className="field">
            <span>Prioridade</span>
            <Select
              valor={form.priority}
              opcoes={PRIORIDADES}
              onChange={(valor) => setForm({ ...form, priority: valor })}
              testId="campo-prioridade"
            />
          </div>
          <label className="field">
            <span>Prazo</span>
            <input type="date" value={form.due_date} onChange={atualizar("due_date")} />
          </label>
        </div>
        {erro && (
          <p className="alert" role="alert">
            {erro}
          </p>
        )}
        <div className="dialog__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button" disabled={enviando} data-testid="salvar-tarefa">
            Salvar
          </button>
        </div>
      </form>
    </Dialog>
  );
}
