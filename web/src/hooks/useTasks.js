import { useCallback, useEffect, useState } from "react";

import { tasks as tasksApi } from "../api/endpoints";

export const FILTROS_INICIAIS = {
  search: "",
  is_completed: "",
  category: "",
  priority: "",
  overdue: "",
  scope: "",
  due_after: "",
  due_before: "",
  ordering: "-created_at",
};

function dataLocal(offsetDias = 0) {
  const data = new Date();
  data.setDate(data.getDate() + offsetDias);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

const VISOES = {
  hoje: () => ({ due_after: dataLocal(), due_before: dataLocal() }),
  semana: () => ({ due_after: dataLocal(), due_before: dataLocal(6) }),
  todas: () => ({}),
  compartilhadas: () => ({ scope: "shared" }),
  concluidas: () => ({ is_completed: "true" }),
};

export function useTasks() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [visao, setVisao] = useState("todas");
  const [page, setPage] = useState(1);
  const [pagina, setPagina] = useState({ results: [], count: 0, pages: 1, page: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setPagina(await tasksApi.list({ ...filtros, page }));
      setErro(null);
    } catch (problema) {
      setErro(problema.firstMessage ?? "Não foi possível carregar as tarefas.");
    } finally {
      setCarregando(false);
    }
  }, [filtros, page]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const aplicarFiltro = useCallback((campo, valor) => {
    setPage(1);
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }, []);

  const aplicarVisao = useCallback((nome) => {
    setPage(1);
    setVisao(nome);
    setFiltros((atual) => ({
      ...FILTROS_INICIAIS,
      ordering: atual.ordering,
      ...VISOES[nome](),
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    setPage(1);
    setVisao("todas");
    setFiltros(FILTROS_INICIAIS);
  }, []);

  return {
    filtros,
    visao,
    aplicarFiltro,
    aplicarVisao,
    limparFiltros,
    pagina,
    page,
    setPage,
    carregando,
    erro,
    recarregar: carregar,
  };
}
