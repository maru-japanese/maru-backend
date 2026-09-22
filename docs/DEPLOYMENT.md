# Supabase: API, Auth e progresso

O site público é `https://maru-frontend.vercel.app` na Vercel. A API é a Edge
Function `maru-api` do projeto Supabase `qxtgaalmyzyldmcpwooo`; os dados ficam
no Postgres do mesmo projeto. Não há servidor Node ou volume SQLite em produção.

## Banco

O schema está em `supabase/migrations/20260922200355_maru_progress.sql`. A tabela
`public.maru_progress` usa RLS habilitada e não concede acesso direto a `anon`
nem `authenticated`. Só a função com chave de serviço lê e mescla snapshots.
Cada escrita compara a versão para evitar perder uma atualização concorrente.

Antes de aplicar migrações futuras, confira o histórico remoto e faça backup
do banco no Supabase. Nunca exponha a chave de serviço no frontend, nos commits
ou nos logs.

## Edge Function

```bash
npm ci
npm run check
npm test
npm run build:edge
supabase functions deploy maru-api --project-ref qxtgaalmyzyldmcpwooo
```

O `supabase/config.toml` aponta para o bundle gerado. A função usa as variáveis
`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` fornecidas pelo
ambiente Supabase. A origem permitida padrão é
`https://maru-frontend.vercel.app`; `MARU_PUBLIC_ORIGIN` pode substituí-la por
outra origem HTTPS exata. O frontend encaminha `/api/*` à função.

Variáveis opcionais da função:

| Variável | Uso |
| --- | --- |
| `MARU_PUBLIC_ORIGIN` | Origem HTTPS do site, sem caminho ou barra final. |
| `MARU_GOOGLE_ENABLED` | `true` somente depois de configurar e testar Google no Supabase Auth. |
| `TTS_QUEST_API_KEY` | Chave da API de pronúncia, se disponível. |
| `MARU_SUPPORT_BR_URL` / `MARU_SUPPORT_GLOBAL_URL` | Links HTTPS reais de apoio. |

`verify_jwt = false` é intencional: conteúdo e perfis de navegador são públicos.
As contas são validadas com Supabase Auth dentro da função, e escritas verificam
origem e identidade.

## Login Google

1. Ative Google em Supabase Auth e configure as credenciais do cliente OAuth no
   painel privado do projeto.
2. No Google Cloud, use como retorno do provedor o callback exibido pelo
   Supabase Auth (normalmente `/auth/v1/callback` no domínio do projeto).
3. Em Supabase Auth, permita o redirecionamento
   `https://maru-frontend.vercel.app/api/auth/google/callback`.
4. Configure `MARU_GOOGLE_ENABLED=true` para a função e publique novamente.
5. Teste login, logout e troca de conta numa janela privada na URL da Vercel.

Até lá, o botão de login fica indisponível; estudar sem conta continua possível.
Os cookies de sessão são `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS. O
navegador não recebe tokens em JavaScript.

## Dados SQLite antigos

`npm run migrate:sqlite -- --source=/caminho/maru.sqlite` mostra quantos perfis
anônimos podem ser importados. `--apply` os envia usando a chave de serviço do
ambiente privado; o arquivo de origem é preservado. Não migre perfis de contas
antigas automaticamente: primeiro concilie o ID delas com Supabase Auth.

O adaptador local `backend/server.js` e `npm run backup` ainda servem para
verificar ou preservar um SQLite legado. Eles não protegem o Postgres remoto;
configure backups e retenção no próprio projeto Supabase.

## Verificação após publicar

Confira `/api/health`, uma lição sem conta, a gravação de progresso e, se ativo,
login/logout. Falhas da função devem ser investigadas nos logs do Supabase sem
registrar cookies, tokens ou conteúdo privado do usuário.
