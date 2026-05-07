# Study MVP

Aplicativo web local de estudos com questoes, pratica, simulados, dashboard e flashcards. Feito com Next.js, TypeScript, Tailwind, Prisma e SQLite.

## Requisitos
- Node.js 20+
- npm 10+

## Como rodar localmente

1. Instale dependencias:
```bash
npm install
```

2. Configure variaveis de ambiente:
```bash
cp .env.example .env
```

3. Gere o Prisma Client:
```bash
npx prisma generate
```

4. Aplique as migrations no SQLite local:
```bash
npx prisma migrate deploy
```

5. Opcional: popule dados de exemplo:
```bash
npm run seed
```

6. Suba a aplicacao:
```bash
npm run dev
```

7. Se o cache do Next ficar inconsistente, reinicie limpo:
```bash
npm run dev:clean
```

8. Opcional: abra Prisma Studio para inspecao do banco:
```bash
npx prisma studio
```

## Scripts disponiveis
- `npm run dev` - inicia ambiente de desenvolvimento
- `npm run dev:clean` - limpa `.next` e inicia ambiente de desenvolvimento
- `npm run build` - build de producao
- `npm run build:clean` - limpa `.next` e executa build de producao
- `npm run start` - inicia build de producao
- `npm run lint` - executa ESLint
- `npm run clean` - remove o cache/artefatos gerados pelo Next em `.next`
- `npm run seed` - executa seed do Prisma
- `npm test` - executa testes unitarios

## Rotas principais
- `/dashboard` - resumo, resets de contadores e analise por periodo/origem
- `/questions` - banco de questoes, busca, edicao e exclusao
- `/questions/new` - cadastro manual de questao
- `/questions/:id/edit` - edicao de questao
- `/questions/import` - importacao em lote e exclusao em massa de questoes
- `/train` - pratica individual por dominio ou todos os dominios
- `/exams` - gerir simulados, incluindo simulado prova Security+ e personalizado por dominio
- `/exams/:id` - responder simulado
- `/exams/:id/review` - revisar resultado, respostas e explicacoes
- `/exams/history` - historico de simulados realizados
- `/flashcards` - cadastro, listagem e exclusao de flashcards
- `/flashcards/review` - revisao espacada de flashcards

## Funcionalidades
- Importacao de questoes em texto livre com alternativas A-E, resposta correta, explicacao, materia, tema, subtema, dificuldade, tags e fonte.
- Pratica por dominio, com feedback imediato e explicacao ao errar.
- Simulado prova seguindo a proporcao CompTIA Security+ por dominios.
- Simulado personalizado por dominio.
- Historico e revisao de simulados concluidos.
- Dashboard com filtros de 7, 15, 30 dias ou desde sempre, combinado com origem `Tudo`, `Simulados` ou `Praticar`.
- Estatisticas por dominio e subtema.
- Contadores resetaveis sem apagar historico real de tentativas.
- Flashcards com revisao espacada simples.

## Validacao
Use estes comandos antes de considerar uma alteracao pronta:
```bash
npm run lint
npm test
npm run build
```

## Solucao de problemas
Se aparecer erro como `Cannot find module './948.js'` vindo de `.next/server/webpack-runtime.js`, normalmente o cache de desenvolvimento do Next ficou inconsistente. Pare o servidor, rode `npm run dev:clean` e abra a aplicacao novamente.

Evite apagar a pasta `.next` enquanto `npm run dev` estiver em execucao, porque o servidor pode continuar apontando para chunks antigos que ja foram removidos.

## Checklist manual
Use `TESTING.md` para validar persistencia de dados, importacoes e fluxos de treino, simulado e flashcards.
