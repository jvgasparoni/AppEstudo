# Study MVP

Aplicativo web de estudos (uso local/pessoal) com **Next.js + TypeScript + Tailwind + Prisma + SQLite**.

## Requisitos
- Node.js 20+
- npm 10+

## Como rodar localmente

1. Instale dependências:
```bash
npm install
```

2. Configure variáveis de ambiente:
```bash
cp .env.example .env
```

3. Gere o Prisma Client:
```bash
npx prisma generate
```

4. Crie o banco SQLite e aplique migration inicial:
```bash
npx prisma migrate dev --name init
```

5. Popule dados de exemplo:
```bash
npm run seed
```

6. Suba a aplicação:
```bash
npm run dev
```

7. (Opcional) Abrir Prisma Studio para inspeção do banco:
```bash
npx prisma studio
```

## Scripts disponíveis
- `npm run dev` — inicia ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — inicia build de produção
- `npm run seed` — executa seed do Prisma
- `npm test` — executa testes unitários

## Rotas principais
- `/dashboard`
- `/questions`
- `/questions/new`
- `/questions/import`
- `/train`
- `/exams`
- `/flashcards`
- `/flashcards/review`
- `/stats`

## Validação manual
Use o checklist em `TESTING.md` para validar persistência de dados, importações e fluxos de treino/simulado/flashcards.
