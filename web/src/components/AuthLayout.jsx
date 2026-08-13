export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth">
      <section className="auth__card">
        <p className="auth__brand">AdviceTodo</p>
        <h1>{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
        <p className="auth__footer">{footer}</p>
      </section>
    </main>
  );
}
