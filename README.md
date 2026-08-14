# AdviceTodo

Gerenciador de tarefas com categorias, compartilhamento entre usuários, filtros e paginação.
API em Django REST Framework, front em React e tudo rodando em Docker Compose.

Teste prático para a vaga de Desenvolvedor(a) Python I da AdviceHealth.

## Aplicação no ar

https://advicetodo-web.yellowocean-d40ba3a2.eastus.azurecontainerapps.io

Para entrar sem precisar criar conta, use um dos usuários de demonstração:

| Usuário | Senha | O que ele enxerga |
|---|---|---|
| `ana@advice.dev` | `advice2026` | 12 tarefas próprias, em três categorias |
| `bruno@advice.dev` | `advice2026` | duas tarefas da Ana, uma só leitura e uma com edição |

## Como rodar

Precisa apenas de Docker com Compose.

```bash
git clone https://github.com/Kaylan00/advicetodo.git && cd advicetodo
docker compose up --build -d
docker compose exec backend python manage.py seed_demo
```

| Onde | Endereço |
|---|---|
| Front | http://localhost:8080 |
| Documentação da API (Swagger) | http://localhost:8000/api/docs/ |
| Schema OpenAPI | http://localhost:8000/api/schema/ |
| Admin do Django | http://localhost:8000/admin/ |

O `seed_demo` cria dois usuários para explorar o compartilhamento:

- `ana@advice.dev` / `advice2026` (dona das tarefas)
- `bruno@advice.dev` / `advice2026` (recebeu duas tarefas, uma só leitura e uma com edição)

Não é obrigatório criar `.env`: o compose já traz valores de desenvolvimento. Para mudar algo,
copie `.env.example` para `.env`. Em produção o `DJANGO_SECRET_KEY` precisa ser trocado.

O `Makefile` encurta o dia a dia: `make up`, `make down`, `make logs`, `make test`, `make lint`,
`make e2e`, `make seed`, `make superuser`.

## Testes

```bash
make test                 # pytest do backend dentro do container
make lint                 # ruff no backend e eslint no front
make e2e                  # sobe o compose com o Selenium e roda os testes de interface
```

Sem Docker, o backend roda com um virtualenv comum (usa SQLite por padrão):

```bash
cd backend
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/pytest
.venv/bin/python manage.py runserver
```

E o front:

```bash
cd web
npm install
npm run dev     # http://localhost:5173, com proxy de /api para a porta 8000
```

Números atuais: 71 testes de unidade e integração no backend, 7 fluxos no Selenium.

## Arquitetura

```
backend/
  config/        settings, urls e wsgi
  core/          o que é genérico: paginação, erro de domínio, modelo com timestamps, healthcheck
  accounts/      usuário com login por e-mail e emissão de JWT
  tasks/         categorias, tarefas e compartilhamento
  integrations/  consumo de API externa (feriados nacionais)
web/             front em React (Vite)
e2e/             testes de interface com Selenium
```

Cada app tem uma responsabilidade e as camadas seguem sempre a mesma ordem:

- **models**: estado e as regras que o próprio registro consegue garantir. `Task.set_completion` é o
  único lugar que mexe em `is_completed`, e uma `CheckConstraint` no banco impede que `completed_at`
  fique incoerente mesmo se alguém escrever direto pelo ORM.
- **managers**: recorte de dados. A visibilidade mora em `Task.objects.visible_to(user)`, então não
  existe view capaz de esquecer o filtro e vazar tarefa de terceiro.
- **services**: regra de negócio que envolve mais de um registro, como compartilhar e revogar.
  Violação de regra vira `DomainError`, que o handler do DRF traduz para 400 no campo certo.
- **serializers**: entrada e saída. Nenhuma regra de negócio, só validação de formato e de posse
  (por exemplo, a categoria escolhida precisa ser do próprio usuário).
- **views**: orquestração fina. As viewsets só amarram queryset, permissão, filtro e serializer.

A separação existe onde ela paga: `tasks` tem camada de serviço porque tem regra de verdade,
`accounts` não tem porque criar usuário é uma chamada só.

## Decisões de design

**Login por e-mail.** O `username` do Django não acrescentava nada, então o modelo usa
`USERNAME_FIELD = "email"`. Autenticação com JWT (SimpleJWT); o front guarda os dois tokens e o
cliente HTTP renova o access uma única vez ao receber 401 antes de derrubar a sessão.

**Permissão em duas camadas.** O queryset limita o que existe (as próprias mais as compartilhadas) e
a `TaskAccessPermission` decide o que pode ser feito. Tarefa de terceiro responde 404, não 403: quem
não tem acesso nem descobre que o registro existe. Excluir e mexer em compartilhamento são
privilégio do dono, mesmo para quem recebeu permissão de edição.

**Compartilhar por e-mail, sem listar usuários.** Não existe endpoint que devolva a base de
usuários. Compartilhar exige saber o e-mail de quem vai receber. Compartilhar de novo com a mesma
pessoa apenas troca a permissão, o que deixa a operação idempotente.

**Categoria pertence ao usuário.** Nome único por dono e sem diferenciar maiúscula de minúscula
(`UniqueConstraint` com `Lower`). Apagar categoria não apaga tarefa: o vínculo vai para nulo.

**Enums em módulo próprio.** `tasks/enums.py` existe porque models, managers e filters precisam das
mesmas escolhas, e importar `models` nos outros dois criaria ciclo.

**Paginação com metadados úteis.** Além de `count` e `next`, a resposta traz `page`, `pages` e
`page_size`, que é o que o front precisa para desenhar a navegação sem fazer conta.

**Front sem biblioteca de estado.** A tela de tarefas cabe em um hook (`useTasks`) com filtros,
página e recarga. Trazer Redux ou React Query para três telas seria peso sem retorno.

**Mesma origem para front e API.** Em produção o nginx repassa `/api` para o backend e em
desenvolvimento o Vite faz o mesmo. Assim não há CORS no caminho feliz nem URL de API compilada no
bundle. As origens permitidas continuam configuráveis para quem quiser chamar a API de fora.

## API

Tudo sob `/api/v1/`. A documentação interativa fica em `/api/docs/`.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/register/` | cria a conta e já devolve os tokens |
| POST | `/auth/login/` | tokens mais os dados do usuário |
| POST | `/auth/refresh/` | renova o access token |
| GET | `/auth/me/` | usuário da sessão |
| GET POST | `/tasks/` | lista (com filtro, busca, ordenação e paginação) e cria |
| GET PATCH DELETE | `/tasks/{id}/` | detalhe, edição e exclusão |
| POST | `/tasks/{id}/toggle/` | alterna entre concluída e não concluída |
| GET POST | `/tasks/{id}/shares/` | quem tem acesso e novo compartilhamento |
| DELETE | `/tasks/{id}/shares/{user_id}/` | revoga o acesso |
| GET POST | `/categories/` | lista com contagem de tarefas e cria |
| GET PATCH DELETE | `/categories/{id}/` | detalhe, edição e exclusão |
| GET | `/holidays/?year=2026` | feriados nacionais vindos da API externa |

Filtros aceitos em `/tasks/`: `is_completed`, `category`, `uncategorized`, `priority`, `due_after`,
`due_before`, `overdue`, `scope` (`owned` ou `shared`), `search`, `ordering`, `page`, `page_size`.

## Integração externa

O item "criar e testar uma API externa" foi lido nas duas pontas:

1. **A API que o projeto expõe** é documentada em OpenAPI com drf-spectacular, versionada em
   `/api/v1/` e navegável pelo Swagger, pronta para outro sistema consumir.
2. **A API de terceiro que o projeto consome** é a de feriados nacionais da
   [BrasilAPI](https://brasilapi.com.br/docs#tag/Feriados-Nacionais). Tarefa com prazo em feriado
   mostra o nome dele na listagem, o que evita marcar entrega em dia que ninguém vai trabalhar.

O provedor é escolhido por configuração (`HOLIDAYS_PROVIDER`), então trocar a fonte não encosta no
resto do código, e existe uma implementação estática usada nos testes para nenhum teste depender de
rede. O resultado fica em cache por 24 horas e, se o serviço externo cair, o campo volta nulo e a
listagem de tarefas continua respondendo: feriado é informação acessória e não pode derrubar o
recurso principal. Os testes cobrem resposta válida, erro HTTP, timeout, JSON quebrado, payload fora
do formato, cache e a degradação.

## CI/CD

`.github/workflows/ci.yml` roda a cada push e pull request, em três jobs:

1. backend: `ruff check`, `ruff format --check` e `pytest` contra um Postgres de serviço;
2. front: `npm ci`, `eslint` e `vite build`;
3. e2e: sobe o compose com o Selenium e roda os sete fluxos de interface.

`.github/workflows/deploy.yml` publica as duas imagens no GitHub Container Registry e aponta os
Azure Container Apps para a tag do commit. Ele só executa quando o repositório tem a variável
`AZURE_ENABLED` e o segredo de acesso, para não quebrar quem clonar o projeto sem conta na Azure.

## Deploy

A aplicação roda em **Azure Container Apps**, dois aplicativos no mesmo ambiente:

- `advicetodo-api`: a imagem do backend, com gunicorn, migrando o banco a cada start.
- `advicetodo-web`: a imagem do nginx, servindo o build do React e repassando `/api` para a API.

O banco é um **Azure Database for PostgreSQL Flexible Server** (Burstable B1ms), com acesso público
restrito a serviços da Azure e TLS obrigatório. As imagens ficam no GitHub Container Registry, que é
gratuito para repositório público e dispensa um registry pago.

Duas coisas mudaram no código para o mesmo artefato servir compose e nuvem:

1. O endereço do backend no nginx virou variável (`BACKEND_URL` e `BACKEND_HOST`), resolvida pelo
   envsubst na subida do container. No compose aponta para o serviço interno, na Azure para o
   domínio da API.
2. `proxy_http_version 1.1`, porque o padrão do `proxy_pass` é HTTP/1.0 e o ingress do Container
   Apps recusa essa versão com 426.

Segredos (chave do Django e string de conexão) ficam como secrets do próprio Container App, nunca em
variável de ambiente exposta nem no repositório.

## O que ficaria para uma próxima rodada

- Throttling nos endpoints de login e cadastro, e blacklist de refresh token no logout.
- Notificar por e-mail quem recebe uma tarefa compartilhada.
- Cache compartilhado (Redis) no lugar do cache em memória, que hoje vive por processo.
- Testes de acessibilidade e um teste de carga na listagem com muitos registros.
