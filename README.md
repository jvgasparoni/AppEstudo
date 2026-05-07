# Study MVP

Aplicativo web de estudos para uso local/pessoal com Next.js, TypeScript, Tailwind, Prisma e SQLite.

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

4. Crie o banco SQLite e aplique a migration inicial:
```bash
npx prisma migrate dev --name init
```

5. Popule dados de exemplo:
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
- `npm run clean` - remove o cache/artefatos gerados pelo Next em `.next`
- `npm run seed` - executa seed do Prisma
- `npm test` - executa testes unitarios

## Rotas principais
- `/dashboard`
- `/questions`
- `/questions/new`
- `/questions/import`
- `/train`
- `/exams`
- `/exams/history`
- `/flashcards`
- `/flashcards/review`

## Solucao de problemas
Se aparecer erro como `Cannot find module './948.js'` vindo de `.next/server/webpack-runtime.js`, normalmente o cache de desenvolvimento do Next ficou inconsistente. Pare o servidor, rode `npm run dev:clean` e abra a aplicacao novamente.

Evite apagar a pasta `.next` enquanto `npm run dev` estiver em execucao, porque o servidor pode continuar apontando para chunks antigos que ja foram removidos.

## Validacao manual
Use o checklist em `TESTING.md` para validar persistencia de dados, importacoes e fluxos de treino, simulado e flashcards.
