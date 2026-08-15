import Icon from "./Icon";

const VITRINE = [
  { icone: "check", cor: "#12784f", rotulo: "Revisar contrato", chip: "Concluída" },
  { icone: "maleta", cor: "#5f3fc1", rotulo: "Trabalho", chip: "Categoria" },
  { icone: "pessoas", cor: "#b8860b", rotulo: "Projeto de verão", pessoas: ["MC", "RL", "AS"] },
];

export default function AuthLayout({ chamada, apoio, title, subtitle, children, footer }) {
  return (
    <main className="acesso">
      <section className="acesso__vitrine">
        <p className="marca">
          <span className="marca__selo">
            <Icon name="check" size={22} strokeWidth={2.6} />
          </span>
          AdviceTodo
        </p>

        <h1>{chamada}</h1>
        <p className="acesso__apoio">{apoio}</p>

        <ul className="amostra">
          {VITRINE.map((item) => (
            <li key={item.rotulo}>
              <span className="amostra__icone" style={{ "--cor": item.cor }}>
                <Icon name={item.icone} size={18} />
              </span>
              {item.rotulo}
              {item.chip && (
                <span className="amostra__chip" style={{ "--cor": item.cor }}>
                  {item.chip}
                </span>
              )}
              {item.pessoas && (
                <span className="avatares">
                  {item.pessoas.map((sigla, indice) => (
                    <span key={sigla} style={{ background: ["#335fc0", "#db7459", "#3b8a72"][indice] }}>
                      {sigla}
                    </span>
                  ))}
                  <span style={{ background: "#8a8f9c" }}>+2</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="acesso__painel">
        <div className="acesso__card">
          <h2>{title}</h2>
          <p className="acesso__subtitulo">{subtitle}</p>
          {children}
          <p className="acesso__rodape">{footer}</p>
        </div>
      </section>
    </main>
  );
}
