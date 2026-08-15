import Icon from "./Icon";

export default function AuthLayout({ chamada, apoio, title, subtitle, children, footer }) {
  return (
    <main className="acesso">
      <section className="acesso__vitrine">
        <div className="acesso__conteudo">
          <p className="marca">
            <Icon name="concluido" size={40} weight="duotone" />
            AdviceTodo
          </p>

          <h1>{chamada}</h1>
          <p className="acesso__apoio">{apoio}</p>
        </div>

        <img className="acesso__ilustracao" src="/ilustracoes/tarefas.svg" alt="" />
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
