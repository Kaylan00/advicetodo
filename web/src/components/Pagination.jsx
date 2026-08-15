import Icon from "./Icon";

/** Mostra as vizinhas da pagina atual, sempre com a primeira e a ultima nas pontas. */
function paginasVisiveis(atual, total) {
  if (total <= 5) return Array.from({ length: total }, (_, indice) => indice + 1);

  const janela = [atual - 1, atual, atual + 1].filter((pagina) => pagina > 1 && pagina < total);
  const paginas = [1, ...janela, total];

  return paginas.reduce((lista, pagina, indice) => {
    if (indice > 0 && pagina - paginas[indice - 1] > 1) lista.push("...");
    lista.push(pagina);
    return lista;
  }, []);
}

export default function Pagination({ page, pages, count, onChange }) {
  if (count === 0) return null;

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        data-testid="pagina-anterior"
      >
        <Icon name="esquerda" size={17} />
      </button>

      {paginasVisiveis(page, pages).map((item, indice) =>
        item === "..." ? (
          <span key={`corte-${indice}`} className="paginacao__reticencias">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === page ? "ativa" : ""}
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            data-testid={item === page ? "pagina-atual" : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Próxima página"
        data-testid="proxima-pagina"
      >
        <Icon name="direita" size={17} />
      </button>
    </nav>
  );
}
