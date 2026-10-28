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
- Mova com WASD, setas ou o controle de toque. No celular, o controle permanece fixo na tela, inclusive no combate. Árvores, paredes e construções possuem colisões.
- Siga a **seta dourada** e o **!** no mapa. A seta calcula um caminho transitável, contornando as paredes. O painel informa o próximo objetivo da campanha.
- Perto de uma porta, surge uma janela com **[E] Entrar** ou **[E] Sair**. Pressione E ou toque no botão. Portas seladas explicam o requisito que falta.

### Capítulo I — A Primeira Brasa

1. Entre na **Cabana da Guardiã**, à esquerda do bosque, e converse com **Íris**. E ou o botão Continuar fecha o diálogo. Ela restaura sua vida e suas poções.
2. Enfrente o **Guardião Esquecido**, à direita. Sua derrota rompe o selo da porta do santuário.
3. Entre no **Santuário das Brasas**, ao norte. Liberte o **Lume Errante**, na ala direita.
4. Siga para o norte do interior e enfrente a **Sentinela do Altar**.
5. Aproxime-se do altar e use E ou o botão para **reacender a Primeira Brasa** e concluir o capítulo. O final fica salvo no perfil.

### Combate e descanso

- **Guardião:** chuva vertical em colunas, com aberturas que mudam entre as ondas.
- **Lume:** projéteis laterais em trajetórias sinuosas, alternando os lados de entrada.
- **Sentinela:** salvas radiais a partir do centro, com aberturas para escapar.
- Cada ação é seguida por um aviso de **1,2 segundo**, durante o qual você já pode posicionar a chama, e uma esquiva de **5,2 segundos**. Leia a dica de cada inimigo e controle o foguinho. Não é possível usar menus ou fugir durante a resposta inimiga.
- Ataque causa 23 de dano; poção recupera 35 HP; defender reduz o dano da próxima esquiva pela metade, arredondado para cima. Colisões concedem 700ms de invulnerabilidade.
- Cada espírito vencido desaparece do mapa e concede sua recompensa uma única vez. A derrota recupera sua vida e devolve você à fogueira do bosque, preservando conquistas anteriores.
- A fogueira e Íris recuperam vida e repõem pelo menos 3 poções. Entradas, saídas, conversas, vitórias e o altar salvam automaticamente. Também existe um botão de salvamento manual; erros de conexão permanecem visíveis.
- Saves antigos mantêm posição, vida, itens, vitórias e ouro e recebem os novos campos da campanha automaticamente. Eles começam os novos objetivos pela visita a Íris. Batalhas em andamento não são salvas.

## Persistência e login

A API guarda perfis em SQLite (`backend/data/game.sqlite`, ignorado no Git), usa consultas parametrizadas, valida os campos e emite sessões de 24 horas para ler/escrever o progresso. Os dados sobrevivem à reinicialização do processo; mantenha o arquivo SQLite em volume persistente no deploy e faça backups.

**Username sozinho é seleção de perfil, sem comprovação de identidade:** qualquer pessoa que conhece o nome pode entrar. Esse comportamento atende ao fluxo solicitado, mas não protege contas privadas. Para lançamento público, implementar autenticação real e limitação de tentativas. Logout descarta a sessão no cliente; salve antes de sair. O estado do jogo é controlado pelo cliente, sem proteção contra trapaça.

Rotas: `GET /health`, `POST /api/login` (`{username}`), `GET /api/progress` e `PUT /api/progress` (Bearer token e os campos de progresso).

O progresso contém `x`, `y`, `hp`, `potions`, `victories`, `gold`, `area` (`forest`, `hut`, `sanctuary`), `metKeeper`, `defeated` (IDs únicos dos inimigos) e `completed`. A API aceita payloads antigos de seis campos sem apagar as novas conquistas; não é necessário apagar ou recriar o banco.

## Organização

- `src/game/components/`: menu/login, gameplay, batalha, inventário, guia, controles, mapa e sprites.
- `src/game/store.ts`: estado Zustand, navegação e comunicação com a API.
- `src/game/model.ts`: progresso, colisões, interações, objetivos e cálculo da rota.
- `src/game/enemies.ts` e `patterns.ts`: inimigos e padrões determinísticos de projéteis.
- `backend/server.mjs`: servidor HTTP e SQLite sem dependências externas.
- `tests/`: persistência e migração após reiniciar, isolamento de perfis, validação, sessão, CORS, colisões, campanha completa e padrões de ataque.

## Verificação

```sh
npm test
npm run typecheck
EXPO_NO_TELEMETRY=1 CI=1 npm run build:web
```

O build gera `dist/`. Testar Android/iOS requer dispositivo ou emulador e não é substituído pelo build web. As interfaces e os sprites precisam ser comparados ao Figma quando o acesso estiver disponível.
