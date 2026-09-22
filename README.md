# Maru Backend

API do [Maru](https://github.com/maru-japanese), uma plataforma gratuita em
português para aprender japonês desde o primeiro contato com o idioma.

Este repositório concentra o que precisa permanecer no servidor: sincronização
de progresso, contas Google, persistência em SQLite, validação de frases e a
integração de pronúncia. A interface vive no repositório
[`maru-frontend`](https://github.com/maru-japanese/maru-frontend).

## Tecnologias

- Node.js 22 ou mais recente;
- SQLite com `better-sqlite3`;
- OAuth 2.0 do Google com PKCE, state e nonce;
- API TTS Quest para pronúncia japonesa.

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

A API inicia em `http://127.0.0.1:5173`. Confira com:

```bash
curl http://127.0.0.1:5173/api/health
```

O banco é criado em `data/progress/maru.sqlite`. Defina `MARU_DATA_DIR` para
usar outro diretório, principalmente em produção.

Para trabalhar com os dois repositórios ao mesmo tempo, inicie este projeto e,
em outro terminal, execute `npm run dev` no `maru-frontend`. O servidor de
desenvolvimento do frontend encaminha `/api` para esta API.

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `HOST` | Interface de rede; o padrão é `127.0.0.1`. |
| `PORT` | Porta HTTP; o padrão é `5173`. |
| `MARU_PUBLIC_ORIGIN` | Origem pública pela qual o navegador acessa `/api`, usada no OAuth e na proteção de escrita. |
| `MARU_DATA_DIR` | Diretório persistente do SQLite. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth opcionais. |
| `TTS_QUEST_API_KEY` | Chave opcional para maior capacidade de voz. |
| `MARU_SUPPORT_BR_URL` / `MARU_SUPPORT_GLOBAL_URL` | Links HTTPS opcionais de apoio ao projeto. |

Sem credenciais Google, o estudo anônimo e a sincronização por perfil de
navegador continuam disponíveis.

## Endpoints principais

| Método | Caminho | Responsabilidade |
| --- | --- | --- |
| `GET` | `/api/health` | Estado da API. |
| `GET` | `/api/content` | Catálogos e currículo. |
| `GET`, `PUT` | `/api/progress` | Leitura e sincronização do progresso. |
| `POST` | `/api/phrase/check` | Validação de exercícios guiados. |
| `POST` | `/api/audio` | Preparação de pronúncia. |
| `GET` | `/api/account` | Estado da sessão. |
| `GET` | `/api/auth/google` | Início do login Google. |
| `POST` | `/api/auth/logout` | Encerramento da sessão. |

## Verificar

```bash
npm run check
npm test
```

Os testes usam diretórios temporários e não alteram o progresso local.

## Dados e segurança

As sessões usam cookie HttpOnly e o banco armazena apenas o hash do token. Os
tokens do Google são descartados depois da confirmação da identidade. Escritas
autenticadas validam origem e identidade da conta antes de mesclar o snapshot.

Para gerar uma cópia consistente do SQLite:

```bash
npm run backup
npm run backup -- /caminho/seguro/maru-backup.sqlite
```

Consulte [hospedagem e recuperação](docs/DEPLOYMENT.md) e
[integrações externas](docs/INTEGRATIONS.md) antes de publicar.

## Container

```bash
docker build -t maru-backend .
docker run --env-file .env -e HOST=0.0.0.0 -p 5173:5173 maru-backend
```

Em produção, monte `MARU_DATA_DIR` em um volume persistente e exponha `/api`
sob a mesma origem pública do frontend por meio de um proxy reverso.
