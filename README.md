# Brasa — Crônicas do Bosque

RPG de turno em React Native / Expo 57, TypeScript e Zustand. A aplicação funciona na web e usa componentes nativos para Android e iOS. O ZIP fornecido foi consultado como referência do protótipo; não substituímos o checkout por ele. O nome Brasa e os sprites desenhados em código são provisórios: o Figma não estava acessível durante a implementação.

## Desenvolvimento

Requer **Node 24** (o backend usa `node:sqlite`) e npm 11.

```sh
npm ci
npm run backend
```

Em outro terminal, na mesma pasta:

```sh
npm run web -- --host localhost
```

A API usa a porta 3001; o Expo usa 8081. Para dispositivo físico, defina `EXPO_PUBLIC_API_URL=http://IP_DA_MAQUINA:3001` antes de iniciar o Expo. Em produção, aponte para a URL HTTPS da API. `CORS_ORIGINS` no backend recebe origens web permitidas, separadas por vírgula; o padrão aceita somente localhost e 127.0.0.1 na porta 8081. `PORT` e `RPG_DB` permitem alterar a porta e o caminho do banco. Não adicione segredos ao frontend.

## Jogar

- Entre com username de 3 a 20 letras, números ou `_`. Maiúsculas e minúsculas identificam o mesmo perfil.
- Continue a aventura ou confirme uma nova jornada. O progresso anterior só será substituído ao salvar.
- Mova com WASD, setas ou o controle de toque. O santuário e as árvores possuem colisões.
- Aproxime-se do fantasma à direita para lutar. Ataque causa 23 de dano; poção recupera 35 HP; defender reduz o dano da próxima esquiva pela metade.
- Na resposta do inimigo, controle o foguinho na arena por 5 segundos. Colisões causam dano com intervalo de invulnerabilidade.
- A fogueira à esquerda recupera vida, repõe pelo menos 3 poções e salva. Também é possível salvar pelo botão no bosque. Vitórias salvam automaticamente; falhas de rede são exibidas, sem apagar o estado em memória.
- A derrota devolve o personagem ao início do bosque. Novas batalhas reiniciam o inimigo. O progresso salvo inclui posição, vida, poções, vitórias e ouro; não inclui uma batalha em andamento.

## Persistência e login

A API guarda perfis em SQLite (`backend/data/game.sqlite`, ignorado no Git), usa consultas parametrizadas, valida os campos e emite sessões de 24 horas para ler/escrever o progresso. Os dados sobrevivem à reinicialização do processo; mantenha o arquivo SQLite em volume persistente no deploy e faça backups.

**Username sozinho é seleção de perfil, sem comprovação de identidade:** qualquer pessoa que conhece o nome pode entrar. Esse comportamento atende ao fluxo solicitado, mas não protege contas privadas. Para lançamento público, implementar autenticação real e limitação de tentativas. Logout descarta a sessão no cliente; salve antes de sair. O estado do jogo é controlado pelo cliente, sem proteção contra trapaça.

Rotas: `GET /health`, `POST /api/login` (`{username}`), `GET /api/progress` e `PUT /api/progress` (Bearer token e os seis campos de progresso).

## Organização

- `src/game/components/`: menu/login, gameplay, batalha, inventário, guia, controles, mapa e sprites.
- `src/game/store.ts`: estado Zustand, navegação e comunicação com a API.
- `src/game/model.ts`: progresso inicial e regras de colisão.
- `backend/server.mjs`: servidor HTTP e SQLite sem dependências externas.
- `tests/`: persistência após reiniciar, isolamento de perfis, validação, sessão, CORS e colisões.

## Verificação

```sh
npm test
npm run typecheck
EXPO_NO_TELEMETRY=1 CI=1 npm run build:web
```

O build gera `dist/`. Testar Android/iOS requer dispositivo ou emulador e não é substituído pelo build web. As interfaces e os sprites precisam ser comparados ao Figma quando o acesso estiver disponível.
