import { useCallback, useEffect, useMemo, useState } from "react";

import { holidays as holidaysApi, tasks as tasksApi } from "../api/endpoints";
import Icon from "./Icon";

const DIAS_DA_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const SEMANAS_NA_GRADE = 6;
const TAREFAS_VISIVEIS_POR_DIA = 2;

function iso(data) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function primeiroDiaDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function somarMeses(data, quantidade) {
  return new Date(data.getFullYear(), data.getMonth() + quantidade, 1);
}

/** Seis semanas comecando no domingo anterior ao dia 1, para a grade nunca mudar de altura. */
function gradeDoMes(mes) {
  const inicio = new Date(mes);
  inicio.setDate(1 - inicio.getDay());
  return Array.from({ length: SEMANAS_NA_GRADE * 7 }, (_, posicao) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + posicao);
    return dia;
  });
}

function rotuloDoMes(mes) {
  const texto = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Calendario({ diaSelecionado, onSelecionarDia, onAbrirTarefa, gatilho }) {
  const [mes, setMes] = useState(() => primeiroDiaDoMes(new Date()));
  const [tarefas, setTarefas] = useState([]);
  const [feriados, setFeriados] = useState({});

  const grade = useMemo(() => gradeDoMes(mes), [mes]);

  const carregar = useCallback(async () => {
    const inicio = grade[0];
    const fim = grade[grade.length - 1];
    const anos = [...new Set([inicio.getFullYear(), fim.getFullYear()])];

    const [pagina, ...listasDeFeriados] = await Promise.all([
      tasksApi.list({
        due_after: iso(inicio),
        due_before: iso(fim),
        page_size: 100,
        ordering: "due_date",
      }),
      ...anos.map((ano) => holidaysApi.list(ano).catch(() => [])),
    ]);

    setTarefas(pagina.results);
    setFeriados(
      Object.fromEntries(listasDeFeriados.flat().map((feriado) => [feriado.date, feriado.name])),
    );
  }, [grade]);

  useEffect(() => {
    carregar();
  }, [carregar, gatilho]);

  const porDia = useMemo(() => {
    const mapa = {};
    tarefas.forEach((tarefa) => {
      if (!tarefa.due_date) return;
      (mapa[tarefa.due_date] ??= []).push(tarefa);
    });
    return mapa;
  }, [tarefas]);

  const hoje = iso(new Date());

  return (
    <section className="calendario" aria-label="Calendário de prazos">
      <header className="calendario__topo">
        <h2>{rotuloDoMes(mes)}</h2>
        <div className="calendario__navegacao">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setMes(primeiroDiaDoMes(new Date()))}
          >
            Hoje
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setMes(somarMeses(mes, -1))}
            aria-label="Mês anterior"
            data-testid="mes-anterior"
          >
            <Icon name="esquerda" size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setMes(somarMeses(mes, 1))}
            aria-label="Próximo mês"
            data-testid="proximo-mes"
          >
            <Icon name="direita" size={18} />
          </button>
        </div>
      </header>

      <div className="calendario__semana" aria-hidden="true">
        {DIAS_DA_SEMANA.map((dia) => (
          <span key={dia}>{dia}</span>
        ))}
      </div>

      <div className="calendario__grade">
        {grade.map((dia) => {
          const chave = iso(dia);
          const doMes = dia.getMonth() === mes.getMonth();
          const daquiPraFrente = porDia[chave] ?? [];
          const feriado = feriados[chave];

          return (
            <button
              type="button"
              key={chave}
              className={[
                "calendario__dia",
                doMes ? "" : "calendario__dia--fora",
                chave === hoje ? "calendario__dia--hoje" : "",
                chave === diaSelecionado ? "calendario__dia--selecionado" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelecionarDia(chave === diaSelecionado ? "" : chave)}
              data-testid="dia-do-calendario"
            >
              <span className="calendario__numero">{dia.getDate()}</span>

              {feriado && (
                <span className="calendario__feriado" title={feriado}>
                  {feriado}
                </span>
              )}

              <span className="calendario__tarefas">
                {daquiPraFrente.slice(0, TAREFAS_VISIVEIS_POR_DIA).map((tarefa) => (
                  <span
                    key={tarefa.id}
                    className={`calendario__tarefa ${
                      tarefa.is_completed ? "calendario__tarefa--feita" : ""
                    }`}
                    style={{ "--cor": tarefa.category_detail?.color ?? "#8b8f99" }}
                    title={tarefa.title}
                    onClick={(evento) => {
                      evento.stopPropagation();
                      onAbrirTarefa(tarefa);
                    }}
                  >
                    {tarefa.title}
                  </span>
                ))}
                {daquiPraFrente.length > TAREFAS_VISIVEIS_POR_DIA && (
                  <span className="calendario__resto">
                    mais {daquiPraFrente.length - TAREFAS_VISIVEIS_POR_DIA}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
