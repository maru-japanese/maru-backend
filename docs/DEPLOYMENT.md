# Contas, hospedagem e manutenção

## Ambiente

Requer Node.js 22 ou superior. As versões instaladas de better-sqlite3 e
google-auth-library exigem esse mínimo. O frontend continua em módulos nativos,
sem build obrigatório.

    npm ci
    cp .env.example .env
    npm run dev

O arquivo .env é ignorado pelo Git. npm run dev e npm start o carregam.
Não cole segredos em arquivos do frontend, testes ou documentação.

## Google

1. No projeto Google, configure a tela de consentimento e crie um cliente OAuth
   do tipo **Web application**. Durante testes, adicione os usuários de teste
   conforme a configuração do projeto.
2. Cadastre exatamente a URL de retorno:
   http://127.0.0.1:5173/api/auth/google/callback no ambiente local ou
   https://seu-dominio/api/auth/google/callback em produção.
3. Preencha GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e MARU_PUBLIC_ORIGIN.
   A origem deve corresponder à URL usada no navegador, sem caminho.
4. Reinicie o servidor. O botão passa a aparecer em Meu ritmo.

Somente openid, email e profile são solicitados. O servidor usa state ligado ao
navegador, PKCE e nonce; valida o ID token com a biblioteca oficial e cria uma
sessão própria. Tokens Google não são persistidos. A sessão dura até 30 dias,
tem cookie HttpOnly/SameSite e Secure em HTTPS, e só seu hash fica no banco.
O cabeçalho x-maru-user serve apenas a perfis anônimos; contas são resolvidas pelo cookie.

O primeiro acesso de uma conta reúne seu cache local, o perfil anônimo deste
navegador e o snapshot da conta no servidor. Uma marca por conta evita repetir
a importação anônima. Sair revoga a sessão e retorna ao perfil anônimo. Caches
de contas são separados por ID. Uma aba detecta troca de identidade e pede
recarga antes de sincronizar novamente.

Referências: [OAuth para servidor web](https://developers.google.com/identity/protocols/oauth2/web-server),
[validação de ID token](https://developers.google.com/identity/sign-in/web/backend-auth) e
[PKCE na biblioteca Google](https://github.com/googleapis/google-auth-library-nodejs/blob/main/samples/oauth2-codeVerifier.js).

## SQLite e migração

MARU_DATA_DIR aponta para uma pasta persistente. Sem essa variável, o padrão
é data/progress no repositório, independente do diretório de execução.
O banco maru.sqlite usa WAL, chaves estrangeiras e consultas parametrizadas.

Tabelas: users, sessions, progress e oauth_states (estado temporário do login).
O schema do snapshot continua na versão 2, com campos adicionais normalizados.
Cada JSON legado é importado ao ler o perfil pela primeira vez; o arquivo original
permanece intacto. Escritas usam transação e a mesclagem existente preserva a
união de lições e o registro mais recente por item.

A mesclagem atual preserva o maior total de contadores; ela não soma tentativas
concorrentes de dois aparelhos como um histórico de eventos distribuído.

## Hospedar

Use um processo Node com disco persistente, por exemplo um container numa VPS
ou um serviço com volume. Não use filesystem efêmero de função serverless.
O manual cita Render/Fly.io/VPS como opções, mas planos, preços e disponibilidade
devem ser conferidos antes de contratar. Nenhum serviço foi contratado nesta implementação.

    docker build -t maru .
    docker volume create maru-data
    docker run --env-file .env -e HOST=0.0.0.0 -e MARU_DATA_DIR=/var/lib/maru -p 5173:5173 -v maru-data:/var/lib/maru maru

Configure MARU_PUBLIC_ORIGIN com o domínio público HTTPS e termine TLS no
proxy ou host. O servidor não confia em cabeçalhos de proxy para escolher a
origem do OAuth. O container executa como usuário node; o volume precisa
permitir escrita por esse usuário.

## Backup e recuperação

    npm run backup
    npm run backup -- /caminho/seguro/maru-backup.sqlite

O comando usa a API de backup online do SQLite, incluindo dados confirmados
do WAL. Copiar somente maru.sqlite enquanto o banco está ativo pode perder
dados recentes. O destino não pode existir; backups e banco são privados.
[Referência da API de backup](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#backupdestination-options---promise).

Agende o comando no host e envie a cópia para armazenamento externo privado
com retenção definida. Para restaurar: pare o servidor; preserve a pasta atual
como cópia; coloque o backup como maru.sqlite em uma pasta limpa e gravável;
aponte MARU_DATA_DIR para ela e reinicie. Não misture um backup com arquivos
WAL/SHM de outro estado. Confira um perfil de teste antes de reabrir acesso.

## Apoio

MARU_SUPPORT_BR_URL e MARU_SUPPORT_GLOBAL_URL aceitam links HTTPS reais,
como a página de apoio do Maru no Apoia.se ou Ko-fi. Só esses links
públicos são enviados ao navegador. Sem endereço, a página informa que o canal
está sendo preparado e não exibe botão de pagamento.

## Validação e limites

Os testes de login usam identidade Google controlada: sucesso, estado/nonce inválidos,
replay, expiração, logout, origem e isolamento. Ativar e testar a autorização real
requer as credenciais do projeto. O Dockerfile é uma configuração de entrega;
publicar exige escolher e configurar o host. IA e link mágico são fases posteriores
registradas no backlog.
