import { useCallback, useEffect, useState } from "react";

import { tasks as tasksApi } from "../api/endpoints";

export const FILTROS_INICIAIS = {
  search: "",
  is_completed: "",
  category: "",
  priority: "",
  overdue: "",
  scope: "",
  ordering: "-created_at",
};

export function useTasks() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
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
      setErro(problema.firstMessage ?? "Nao foi possivel carregar as tarefas.");
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

  const limparFiltros = useCallback(() => {
    setPage(1);
    setFiltros(FILTROS_INICIAIS);
  }, []);

  return {
    filtros,
    aplicarFiltro,
    limparFiltros,
    pagina,
    page,
    setPage,
    carregando,
    erro,
    recarregar: carregar,
  };
}
