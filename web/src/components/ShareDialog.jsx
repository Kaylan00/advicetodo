import { useState } from "react";

import { tasks as tasksApi } from "../api/endpoints";
import Dialog from "./Dialog";
import Icon from "./Icon";

export default function ShareDialog({ tarefa, onClose, onMudou }) {
  const [compartilhamentos, setCompartilhamentos] = useState(tarefa.shares);
  const [email, setEmail] = useState("");
  const [permissao, setPermissao] = useState("view");
  const [erro, setErro] = useState(null);

  async function compartilhar(event) {
    event.preventDefault();
    try {
      const novo = await tasksApi.share(tarefa.id, { email, permission: permissao });
      setCompartilhamentos((atual) => [
        novo,
        ...atual.filter((item) => item.user.id !== novo.user.id),
      ]);
      setEmail("");
      setErro(null);
      onMudou();
    } catch (problema) {
      setErro(problema.firstMessage ?? "Nao foi possivel compartilhar.");
    }
  }

  async function revogar(compartilhamento) {
    await tasksApi.revokeShare(tarefa.id, compartilhamento.user.id);
    setCompartilhamentos((atual) => atual.filter((item) => item.id !== compartilhamento.id));
    onMudou();
  }

  return (
    <Dialog title="Compartilhar tarefa" onClose={onClose} testId="dialogo-compartilhar">
      <p className="dialog__resumo">{tarefa.title}</p>

      <form className="form" onSubmit={compartilhar}>
        <div className="form__row">
          <label className="field">
            <span>E-mail de quem vai receber</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="colega@empresa.com"
              data-testid="campo-email-compartilhar"
            />
          </label>
          <label className="field">
            <span>Permissao</span>
            <select value={permissao} onChange={(event) => setPermissao(event.target.value)}>
              <option value="view">Somente leitura</option>
              <option value="edit">Pode editar</option>
            </select>
          </label>
        </div>
        {erro && (
          <p className="alert" role="alert" data-testid="erro-compartilhar">
            {erro}
          </p>
        )}
        <button type="submit" className="button" data-testid="confirmar-compartilhar">
          Compartilhar
        </button>
      </form>

      <ul className="compartilhados">
        {compartilhamentos.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.user.first_name || item.user.email}</strong>
              <span>{item.permission === "edit" ? "pode editar" : "somente leitura"}</span>
            </div>
            <button
              type="button"
              className="icon-button icon-button--perigo"
              onClick={() => revogar(item)}
              aria-label={`Remover acesso de ${item.user.email}`}
            >
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
        {compartilhamentos.length === 0 && <li className="painel__vazio">Ainda so voce.</li>}
      </ul>
    </Dialog>
  );
}
