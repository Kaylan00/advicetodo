import { useEffect, useRef, useState } from "react";

import Icon from "./Icon";

/**
 * Substitui o select nativo para poder mostrar cor por opcao e seguir a identidade do produto.
 * Mantem o que o nativo entrega de graca: teclado, foco visivel e papeis de acessibilidade.
 */
export default function Select({ valor, opcoes, onChange, variante = "campo", cor, testId }) {
  const [aberto, setAberto] = useState(false);
  const [emFoco, setEmFoco] = useState(0);
  const raiz = useRef(null);

  const escolhida = opcoes.find((opcao) => opcao.valor === valor) ?? opcoes[0];

  useEffect(() => {
    if (!aberto) return undefined;
    const fecharClicandoFora = (evento) => {
      if (!raiz.current?.contains(evento.target)) setAberto(false);
    };
    document.addEventListener("mousedown", fecharClicandoFora);
    return () => document.removeEventListener("mousedown", fecharClicandoFora);
  }, [aberto]);

  function abrir() {
    setEmFoco(Math.max(0, opcoes.findIndex((opcao) => opcao.valor === valor)));
    setAberto(true);
  }

  function escolher(opcao) {
    onChange(opcao.valor);
    setAberto(false);
  }

  function noTeclado(evento) {
    if (evento.key === "Escape") {
      setAberto(false);
      return;
    }
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      if (!aberto) {
        abrir();
        return;
      }
      const passo = evento.key === "ArrowDown" ? 1 : -1;
      setEmFoco((atual) => (atual + passo + opcoes.length) % opcoes.length);
      return;
    }
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      if (aberto) escolher(opcoes[emFoco]);
      else abrir();
    }
  }

  return (
    <div
      ref={raiz}
      className={`select select--${variante} ${aberto ? "select--aberto" : ""}`}
      style={cor ? { "--cor": cor } : undefined}
    >
      <button
        type="button"
        className="select__gatilho"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={noTeclado}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        data-testid={testId}
      >
        {escolhida?.cor && <span className="select__ponto" style={{ background: escolhida.cor }} />}
        <span className="select__rotulo">{escolhida?.rotulo}</span>
        <Icon name="seta_baixo" size={15} />
      </button>

      {aberto && (
        <ul className="select__lista" role="listbox">
          {opcoes.map((opcao, indice) => (
            <li
              key={opcao.valor}
              role="option"
              aria-selected={opcao.valor === valor}
              className={`select__opcao ${indice === emFoco ? "select__opcao--foco" : ""}`}
              onMouseEnter={() => setEmFoco(indice)}
              onClick={() => escolher(opcao)}
              data-testid={`opcao-${opcao.valor || "vazio"}`}
            >
              {opcao.cor && <span className="select__ponto" style={{ background: opcao.cor }} />}
              <span className="select__rotulo">{opcao.rotulo}</span>
              {opcao.valor === valor && <Icon name="check" size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
