import { useState } from "react";

import Dialog from "./Dialog";

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
      setErro(problema.firstMessage ?? "Nao foi possivel salvar a tarefa.");
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
          <span>Titulo</span>
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
          <span>Descricao</span>
          <textarea rows={3} value={form.description} onChange={atualizar("description")} />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Categoria</span>
            <select value={form.category} onChange={atualizar("category")} data-testid="campo-categoria">
              <option value="">Sem categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Prioridade</span>
            <select value={form.priority} onChange={atualizar("priority")}>
              <option value="low">Baixa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>
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
