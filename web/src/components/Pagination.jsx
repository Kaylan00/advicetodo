export default function Pagination({ page, pages, count, onChange }) {
  if (count === 0) return null;

  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        type="button"
        className="button button--ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        data-testid="pagina-anterior"
      >
        Anterior
      </button>
      <span data-testid="pagina-atual">
        Página {page} de {pages} ({count} tarefas)
      </span>
      <button
        type="button"
        className="button button--ghost"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        data-testid="proxima-pagina"
      >
        Próxima
      </button>
    </nav>
  );
}
