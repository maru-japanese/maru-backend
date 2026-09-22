# APIs e créditos

## Pronúncia: TTS Quest / VOICEVOX

O Maru solicita a pronúncia quando o aluno toca no botão. O backend consulta
`https://api.tts.quest/v3/voicevox/synthesis`, com a leitura ensinada e `speaker=3`.
A resposta contém uma URL remota de streaming, reproduzida pelo navegador.
Nenhum modelo de voz, MP3 ou gerador local faz parte do projeto.

- Crédito da voz: **VOICEVOX:ずんだもん**.
- [Documentação do provedor](https://github.com/ts-klassen/ttsQuestV3Voicevox).
- [Modalidade pública sem chave](https://voicevox.su-shiki.com/su-shikiapis/ttsquest/).
- [Termos VOICEVOX](https://voicevox.hiroshiba.jp/term/).
- [Termos da biblioteca de voz](https://zunko.jp/con_ongen_kiyaku.html).

É necessário acesso à internet. A modalidade pública pode impor espera entre
consultas. O serviço respeita `retryAfter`, informa o intervalo e reutiliza URLs
válidas por dez minutos. A disponibilidade da API não é controlada pelo Maru.

Opcionalmente, defina `TTS_QUEST_API_KEY` no ambiente antes de iniciar o servidor.
A chave permanece no backend. Só trechos do conteúdo de estudo são aceitos;
frases livres digitadas pelo aluno não são enviadas ao provedor de voz.

Os efeitos de acerto e conclusão do Arcade usam osciladores Web Audio no navegador.
São opcionais, independentes da pronúncia e não criam arquivos.

## Identidade: Google OAuth

O login usa OAuth 2.0 para aplicações web, com state, PKCE e nonce. O Google
confirma a identidade e o backend cria uma sessão própria; tokens do provedor
não são persistidos. Somente os escopos `openid`, `email` e `profile` são
solicitados.

- [OAuth 2.0 para aplicações web](https://developers.google.com/identity/protocols/oauth2/web-server).
- [Validação de ID tokens](https://developers.google.com/identity/sign-in/web/backend-auth).
- [Biblioteca Google Auth para Node.js](https://github.com/googleapis/google-auth-library-nodejs).

KanjiAPI, KanjiVG e outros recursos usados diretamente pela experiência de
estudo são documentados no repositório `maru-frontend`.
